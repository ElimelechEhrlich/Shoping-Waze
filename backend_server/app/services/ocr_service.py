import json
import logging
import re

from fastapi import HTTPException, status
from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.receipt_schema import ReceiptExtracted


HEBREW_RECEIPT_PROMPT = """אתה מנתח קבלות בעברית.

החזר JSON בלבד בפורמט:

{
  "store_name": "...",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "...",
      "quantity": number,
      "total_price": number,
      "unit_price": number
    }
  ]
}

כל הטקסט הוא בעברית.
אם יש הנחות, כלול אותן במחיר הכולל של המוצר.
"""


logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self) -> None:
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is missing in environment variables.")
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def extract(self, image_bytes: bytes, mime_type: str) -> ReceiptExtracted:
        try:
            response = self.client.models.generate_content(
                model=settings.gemini_model_name,
                contents=[
                    HEBREW_RECEIPT_PROMPT,
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                ],
            )
            response_text = response.text or ""
            logger.info("Gemini OCR response received successfully.")

            cleaned_json_text = self._extract_json_text(response_text)
            parsed_data = json.loads(cleaned_json_text)
            receipt_data = ReceiptExtracted.model_validate(parsed_data)
            return receipt_data
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to parse receipt with Gemini OCR.")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"OCR parsing failed: {exc}",
            ) from exc

    @staticmethod
    def _extract_json_text(raw_text: str) -> str:
        raw_text = raw_text.strip()
        if raw_text.startswith("{") and raw_text.endswith("}"):
            return raw_text

        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if not match:
            raise ValueError("No valid JSON object found in Gemini response.")
        return match.group(0)

