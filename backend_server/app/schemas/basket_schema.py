from pydantic import BaseModel, Field


class BasketItemRequest(BaseModel):
    name: str = Field(min_length=1)
    quantity: float = Field(gt=0)


class BasketCompareRequest(BaseModel):
    items: list[BasketItemRequest]
    baseline_store: str | None = None


class BasketItemResult(BaseModel):
    name: str
    qty: float
    unit_price: float | None = None
    total: float
    available: bool
    estimated: bool = False


class StoreBasketResult(BaseModel):
    store: str
    total: float
    items: list[BasketItemResult]
    missing_items: list[str]


class BasketCompareResponse(BaseModel):
    results: list[StoreBasketResult]
    cheapest: str | None = None
    skipped_items: list[str] = []

