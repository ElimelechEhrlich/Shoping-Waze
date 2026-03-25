import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.constants import MAX_IMAGE_SIZE_MB
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
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are supported.",
        )

    image_bytes = await file.read()
    max_bytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max allowed size is {MAX_IMAGE_SIZE_MB}MB.",
        )

    ocr_service = OCRService()
    receipt_service = ReceiptService(db_session)

    extracted_receipt = ocr_service.extract(
        image_bytes=image_bytes,
        mime_type=file.content_type,
    )
    saved_items_count = 0
    # שמירה ל-DB לא חייבת להכשיל את ה-UI: גם אם ה-DB לא זמין מקומית,
    # נמשיך להחזיר את ה-extracted receipt ל-Details כדי שה-flow יעבוד.
    try:
        saved_items_count = receipt_service.save(extracted_receipt)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to save receipt to DB: %s", exc)

    logger.info("Receipt upload endpoint completed. filename=%s", file.filename)
    return ReceiptUploadResponse(
        message="receipt processed",
        items_saved=saved_items_count,
        receipt=extracted_receipt,
    )

