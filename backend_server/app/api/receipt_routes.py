import asyncio
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.constants import (
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_IMAGE_SIZE_MB,
    MIN_IMAGE_SIZE_BYTES,
)
from app.database.session import get_db
from app.schemas.receipt_schema import ReceiptUploadResponse
from app.services.ocr_service import OCRService
from app.services.receipt_service import ReceiptService


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.post("/upload", response_model=ReceiptUploadResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    db_session: Session = Depends(get_db),
) -> ReceiptUploadResponse:
    content_type = (file.content_type or "").lower()
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are supported.",
        )
    # Some browsers send variants like image/jpg or image/x-png; normalize
    # to a known set so we don't waste a Gemini call on an unsupported type.
    if content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {content_type}",
        )

    image_bytes = await file.read()
    size = len(image_bytes)
    max_bytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max allowed size is {MAX_IMAGE_SIZE_MB}MB.",
        )
    if size < MIN_IMAGE_SIZE_BYTES:
        # An obviously-empty/corrupt upload — fail fast with a clear message
        # instead of paying Gemini latency to confirm the file is unreadable.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is too small or empty.",
        )

    ocr_service = OCRService()
    receipt_service = ReceiptService(db_session)

    extracted_receipt = await asyncio.to_thread(
        ocr_service.extract,
        image_bytes=image_bytes,
        mime_type=content_type,
    )
    saved_items_count = 0
    # The DB save is best-effort: if the managed Postgres is briefly down
    # we still want to return the parsed receipt so the user can review it.
    try:
        saved_items_count = receipt_service.save(extracted_receipt)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to save receipt to DB: %s", exc)

    logger.info(
        "Receipt upload completed. filename=%s size=%dB items=%d saved=%d",
        file.filename,
        size,
        len(extracted_receipt.items),
        saved_items_count,
    )
    return ReceiptUploadResponse(
        message="receipt processed",
        items_saved=saved_items_count,
        receipt=extracted_receipt,
    )

