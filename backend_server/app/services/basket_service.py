import logging

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.constants import DEFAULT_MISSING_PRICE
from app.models.price_history import PriceHistory
from app.models.product import Product
from app.models.store import Store
from app.schemas.basket_schema import (
    BasketCompareRequest,
    BasketCompareResponse,
    StoreBasketResult,
)


logger = logging.getLogger(__name__)


class BasketService:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def compare_basket_prices(self, request_data: BasketCompareRequest) -> BasketCompareResponse:
        stores = self.db_session.scalars(select(Store).order_by(Store.name.asc())).all()
        store_results: list[StoreBasketResult] = []

        for store in stores:
            total_price = 0.0
            missing_items: list[str] = []

            for requested_item in request_data.items:
                latest_unit_price = self._get_latest_unit_price(
                    store_id=store.id,
                    product_name=requested_item.name,
                )
                if latest_unit_price is None:
                    total_price += DEFAULT_MISSING_PRICE
                    missing_items.append(requested_item.name)
                    continue

                total_price += latest_unit_price * requested_item.quantity

            store_results.append(
                StoreBasketResult(
                    store=store.name,
                    total_price=round(total_price, 2),
                    missing_items=missing_items,
                )
            )

        logger.info(
            "Basket comparison completed. requested_items=%s stores_checked=%s",
            len(request_data.items),
            len(stores),
        )
        return BasketCompareResponse(stores=store_results)

    def _get_latest_unit_price(self, store_id: int, product_name: str) -> float | None:
        normalized_product_name = self._normalize_name(product_name)

        latest_price_date_subquery = (
            select(
                PriceHistory.product_id.label("product_id"),
                PriceHistory.store_id.label("store_id"),
                func.max(PriceHistory.receipt_date).label("latest_receipt_date"),
            )
            .where(PriceHistory.store_id == store_id)
            .group_by(PriceHistory.product_id, PriceHistory.store_id)
            .subquery()
        )

        latest_price_query: Select[tuple[float]] = (
            select(PriceHistory.unit_price)
            .join(Product, Product.id == PriceHistory.product_id)
            .join(
                latest_price_date_subquery,
                (latest_price_date_subquery.c.product_id == PriceHistory.product_id)
                & (latest_price_date_subquery.c.store_id == PriceHistory.store_id)
                & (latest_price_date_subquery.c.latest_receipt_date == PriceHistory.receipt_date),
            )
            .where(
                PriceHistory.store_id == store_id,
                Product.name == normalized_product_name,
            )
            .limit(1)
        )

        return self.db_session.scalar(latest_price_query)

    @staticmethod
    def _normalize_name(text: str) -> str:
        text = text.strip()
        return " ".join(text.split())

