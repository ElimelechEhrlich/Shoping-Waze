import logging

from fastapi import HTTPException, status
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings
from app.schemas.receipt_schema import ReceiptExtracted


# Tight, minimal-token prompt. The schema enforces the structure, so the
# prompt only describes intent and rules that the schema cannot capture.
RECEIPT_EXTRACTION_PROMPT = (
    "Extract grocery items from this Hebrew receipt.\n"
    "Categories: vegetables, fruits, dairy, bakery, dry, meat, frozen, "
    "cleaning, snacks, general.\n"
    "Classify by what the product IS, not by flavor (ביסלי/במבה/חטיפים = snacks "
    "even when the flavor is a vegetable/fruit).\n"
    "total_price = net price after discounts.\n"
    "quantity defaults to 1 if not shown.\n"
    "unit_price = total_price / quantity.\n"
    "If date is missing, use today."
)


# JSON schema for Gemini structured output. Eliminates the brittle
# regex/parse step and forces a stable response shape.
_RECEIPT_RESPONSE_SCHEMA: dict = {
    "type": "OBJECT",
    "properties": {
        "store_name": {"type": "STRING"},
        "date": {"type": "STRING", "description": "YYYY-MM-DD"},
        "items": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "quantity": {"type": "NUMBER"},
                    "total_price": {"type": "NUMBER"},
                    "unit_price": {"type": "NUMBER"},
                    "category": {"type": "STRING"},
                },
                "required": ["name", "quantity", "total_price", "unit_price"],
            },
        },
    },
    "required": ["store_name", "date", "items"],
}


# Hard cap on time spent in a single Gemini call. Prevents stuck workers
# when the upstream API hangs; the client will timeout and we'll surface
# 504 to the user instead of blocking the server thread indefinitely.
_GEMINI_REQUEST_TIMEOUT_MS = 60_000

# Retried only on transient SDK errors (network/5xx/quota throttling).
# Parsing/validation failures are NOT retried — they're deterministic.
_TRANSIENT_GENAI_EXCEPTIONS: tuple[type[BaseException], ...] = (
    genai_errors.APIError,
)


logger = logging.getLogger(__name__)


def _build_client() -> genai.Client | None:
    if not settings.gemini_api_key:
        return None
    return genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(timeout=_GEMINI_REQUEST_TIMEOUT_MS),
    )


# Singleton — re-creating the client on every request was wasting time
# on TLS/HTTP setup and adding latency under load.
_client: genai.Client | None = _build_client()


class OCRService:
    def __init__(self) -> None:
        if _client is None:
            raise ValueError("GEMINI_API_KEY is missing in environment variables.")
        self._client = _client

    def extract(self, image_bytes: bytes, mime_type: str) -> ReceiptExtracted:
        try:
            response = self._call_with_retries(image_bytes, mime_type)
        except RetryError as exc:
            last = exc.last_attempt.exception() if exc.last_attempt else None
            logger.exception("Gemini OCR failed after retries.")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"OCR upstream unavailable: {last or exc}",
            ) from exc

        try:
            # When response_schema is set, .parsed gives us a dict already
            # validated against the schema — no manual JSON extraction needed.
            parsed_data = response.parsed
            if parsed_data is None:
                # Fallback path: SDK could not auto-parse — try the raw text.
                import json  # noqa: PLC0415

                parsed_data = json.loads(response.text or "{}")

            receipt_data = ReceiptExtracted.model_validate(parsed_data)
            logger.info(
                "Gemini OCR parsed successfully. items=%s",
                len(receipt_data.items),
            )
            return receipt_data
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to validate Gemini OCR response.")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"OCR parsing failed: {exc}",
            ) from exc

    @retry(
        retry=retry_if_exception_type(_TRANSIENT_GENAI_EXCEPTIONS),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        reraise=False,
    )
    def _call_with_retries(self, image_bytes: bytes, mime_type: str):
        return self._client.models.generate_content(
            model=settings.gemini_model_name,
            contents=[
                RECEIPT_EXTRACTION_PROMPT,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(
                # Deterministic output — no creative variation needed for OCR
                # and lower temperature also tends to be slightly faster.
                temperature=0.0,
                response_mime_type="application/json",
                response_schema=_RECEIPT_RESPONSE_SCHEMA,
                # Hard cap to keep responses bounded; a typical receipt with
                # ~50 items fits comfortably under this limit.
                max_output_tokens=4096,
            ),
        )
