import json
import logging
import re

from fastapi import HTTPException, status
from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.receipt_schema import ReceiptExtracted


RECEIPT_EXTRACTION_PROMPT = """You are a receipt parser specializing in Hebrew grocery receipts.

Return ONLY valid JSON — no markdown, no explanation, just the JSON object.

Required format:
{
  "store_name": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string (in Hebrew exactly as printed on receipt)",
      "quantity": number,
      "total_price": number,
      "unit_price": number,
      "category": "string"
    }
  ]
}

Category must be exactly one of:
  vegetables, fruits, dairy, bakery, dry, meat, frozen, cleaning, snacks, general

Category classification rules — classify by what the product IS, not by its flavor or ingredients:
  - Flavored snacks (ביסלי, במבה, חטיפים, קרקרים, צ'יפס) → snacks, even if the flavor is a vegetable or fruit
  - Actual vegetables sold as produce (עגבנייה, מלפפון, בצל, גזר, פלפל) → vegetables
  - Actual fruits sold as produce (תפוח, בננה, תפוז, ענבים) → fruits
  - Packaged dairy (חלב, גבינה, יוגורט, שמנת, ביצים) → dairy
  - Bread and baked goods (לחם, חלה, פיתה, בורקס) → bakery
  - Dry goods and pantry (אורז, פסטה, קמח, שמן, קפה, מיץ קופסה) → dry
  - Meat and fish (עוף, בשר, דג, הודו) → meat
  - Frozen products (קפוא, גלידה) → frozen
  - Household and hygiene (סבון, שמפו, אקונומיקה, מרכך, ניקוי) → cleaning
  - Anything else → general

Additional rules:
  - If discounts are applied, include them in the item's total_price (net price after discount).
  - quantity is the number of units purchased (default 1 if not shown).
  - unit_price = total_price / quantity (calculate if not explicitly shown).
  - If date is not visible, use today's date.
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
                    RECEIPT_EXTRACTION_PROMPT,
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

