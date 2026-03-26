import logging

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.constants import MISSING_PRICE_PENALTY_RATE
from app.models.price_history import PriceHistory
from app.models.product import Product
from app.models.store import Store
from app.schemas.basket_schema import (
    BasketCompareRequest,
    BasketCompareResponse,
    BasketItemResult,
    StoreBasketResult,
)


logger = logging.getLogger(__name__)


class BasketService:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def compare_basket_prices(self, request_data: BasketCompareRequest) -> BasketCompareResponse:
        stores = self.db_session.scalars(select(Store).order_by(Store.name.asc())).all()
        store_results: list[StoreBasketResult] = []

        baseline_store_name = (request_data.baseline_store or "").strip()
        baseline_store = None
        if baseline_store_name:
            baseline_store = next((s for s in stores if s.name == baseline_store_name), None)

        # Build comparison set and per-item fallback prices.
        # - If baseline_store is provided: only compare items that exist in that store.
        # - For each compared item: if a store is missing that item, use a fallback unit price based on the
        #   maximum known unit price across stores * (1 + penalty).
        skipped_item_names: list[str] = []
        comparable_items = []
        fallback_unit_price_by_item: dict[str, float] = {}
        for requested_item in request_data.items:
            if baseline_store is not None:
                baseline_unit_price = self._get_latest_unit_price(
                    store_id=baseline_store.id,
                    product_name=requested_item.name,
                )
                if baseline_unit_price is None:
                    skipped_item_names.append(requested_item.name)
                else:
                    comparable_items.append(requested_item)
                continue

            comparable_items.append(requested_item)

        for requested_item in comparable_items:
            known_prices: list[float] = []
            for store in stores:
                latest_unit_price = self._get_latest_unit_price(
                    store_id=store.id,
                    product_name=requested_item.name,
                )
                if latest_unit_price is not None:
                    known_prices.append(float(latest_unit_price))

            if not known_prices:
                skipped_item_names.append(requested_item.name)
                continue

            # Skip items whose only known prices are zero (coupons, discounts, etc.)
            max_known = max(known_prices)
            if max_known <= 0:
                skipped_item_names.append(requested_item.name)
                continue
            fallback_unit_price_by_item[requested_item.name] = round(max_known * (1 + MISSING_PRICE_PENALTY_RATE), 4)

        comparable_items = [it for it in comparable_items if it.name in fallback_unit_price_by_item]

        for store in stores:
            total_price = 0.0
            missing_items: list[str] = []
            store_items: list[BasketItemResult] = []

            for requested_item in comparable_items:
                latest_unit_price = self._get_latest_unit_price(
                    store_id=store.id,
                    product_name=requested_item.name,
                )
                if latest_unit_price is None:
                    missing_items.append(requested_item.name)
                    fallback_unit_price = fallback_unit_price_by_item[requested_item.name]
                    line_total = fallback_unit_price * requested_item.quantity
                    total_price += line_total
                    store_items.append(
                        BasketItemResult(
                            name=requested_item.name,
                            qty=requested_item.quantity,
                            unit_price=round(float(fallback_unit_price), 4),
                            total=round(float(line_total), 2),
                            available=False,
                            estimated=True,
                        )
                    )
                    continue

                line_total = float(latest_unit_price) * requested_item.quantity
                total_price += line_total
                store_items.append(
                    BasketItemResult(
                        name=requested_item.name,
                        qty=requested_item.quantity,
                        unit_price=round(float(latest_unit_price), 4),
                        total=round(float(line_total), 2),
                        available=True,
                        estimated=False,
                    )
                )

            store_results.append(
                StoreBasketResult(
                    store=store.name,
                    total=round(total_price, 2),
                    items=store_items,
                    missing_items=missing_items,
                )
            )

        logger.info(
            "Basket comparison completed. requested_items=%s stores_checked=%s",
            len(request_data.items),
            len(stores),
        )
        store_results.sort(key=lambda r: r.total)
        cheapest = store_results[0].store if store_results else None
        return BasketCompareResponse(results=store_results, cheapest=cheapest, skipped_items=skipped_item_names)

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

