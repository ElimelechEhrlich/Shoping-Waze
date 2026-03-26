from datetime import date

from pydantic import BaseModel, Field


class ProductListItem(BaseModel):
    id: int
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    unit: str = Field(min_length=1)
    price: float = Field(ge=0)


class ProductListResponse(BaseModel):
    products: list[ProductListItem]


class ProductCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255, description="Product name")
    price: float | None = Field(default=None, ge=0, description="Unit price (optional)")
    store_name: str | None = Field(default=None, description="Store name for price entry (optional)")
    receipt_date: date | None = Field(default=None, description="Date for price entry (defaults to today)")


class ProductCreateResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    already_existed: bool
    message: str

