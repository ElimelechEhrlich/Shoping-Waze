from pydantic import BaseModel, Field


class ProductListItem(BaseModel):
    id: int
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    unit: str = Field(min_length=1)
    price: float = Field(ge=0)


class ProductListResponse(BaseModel):
    products: list[ProductListItem]

