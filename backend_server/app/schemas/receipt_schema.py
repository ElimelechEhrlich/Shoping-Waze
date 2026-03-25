from datetime import date

from pydantic import BaseModel, Field


class ReceiptItemExtracted(BaseModel):
    name: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    total_price: float = Field(ge=0)
    unit_price: float = Field(ge=0)


class ReceiptExtracted(BaseModel):
    store_name: str = Field(min_length=1)
    date: date
    items: list[ReceiptItemExtracted]


class ReceiptUploadResponse(BaseModel):
    message: str
    items_saved: int
    receipt: ReceiptExtracted | None = None

