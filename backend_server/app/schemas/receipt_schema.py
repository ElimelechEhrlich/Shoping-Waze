from datetime import date

from pydantic import BaseModel, Field


VALID_CATEGORIES = frozenset(
    {"vegetables", "fruits", "dairy", "bakery", "dry", "meat", "frozen", "cleaning", "snacks", "general"}
)


class ReceiptItemExtracted(BaseModel):
    name: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    total_price: float = Field(ge=0)
    unit_price: float = Field(ge=0)
    category: str = Field(default="general")

    def model_post_init(self, __context: object) -> None:
        if self.category not in VALID_CATEGORIES:
            object.__setattr__(self, "category", "general")


class ReceiptExtracted(BaseModel):
    store_name: str = Field(min_length=1)
    date: date
    items: list[ReceiptItemExtracted]


class ReceiptUploadResponse(BaseModel):
    message: str
    items_saved: int
    receipt: ReceiptExtracted | None = None

