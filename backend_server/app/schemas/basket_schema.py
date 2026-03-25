from pydantic import BaseModel, Field


class BasketItemRequest(BaseModel):
    name: str = Field(min_length=1)
    quantity: float = Field(gt=0)


class BasketCompareRequest(BaseModel):
    items: list[BasketItemRequest]


class StoreBasketResult(BaseModel):
    store: str
    total_price: float
    missing_items: list[str]


class BasketCompareResponse(BaseModel):
    stores: list[StoreBasketResult]

