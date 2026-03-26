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


_UNKNOWN_STORE_NAMES: frozenset[str] = frozenset({"unknown", "לא ידוע", "לא מזוהה", ""})


def _is_known_store(store: Store) -> bool:
    return store.name.strip().lower() not in _UNKNOWN_STORE_NAMES


class BasketService:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def compare_basket_prices(self, request_data: BasketCompareRequest) -> BasketCompareResponse:
        all_stores = self.db_session.scalars(select(Store).order_by(Store.name.asc())).all()
        stores = [s for s in all_stores if _is_known_store(s)]
        store_ids = [s.id for s in stores]
        store_results: list[StoreBasketResult] = []

        baseline_store_name = (request_data.baseline_store or "").strip()
        baseline_store = None
        if baseline_store_name:
            baseline_store = next((s for s in stores if s.name == baseline_store_name), None)

        requested_norm_names = list({self._normalize_name(it.name) for it in request_data.items})
        name_to_id: dict[str, int] = {}
        if requested_norm_names:
            prows = self.db_session.execute(
                select(Product.id, Product.name).where(Product.name.in_(requested_norm_names))
            ).all()
            name_to_id = {r.name: r.id for r in prows}

        product_ids = list({name_to_id[n] for n in requested_norm_names if n in name_to_id})
        matrix: dict[tuple[int, int], float] = {}
        if store_ids and product_ids:
            matrix = self._batch_latest_unit_prices(store_ids, product_ids)

        def unit_price_at_store(store_id: int, product_name: str) -> float | None:
            norm = self._normalize_name(product_name)
            pid = name_to_id.get(norm)
            if pid is None:
                return None
            v = matrix.get((store_id, pid))
            return float(v) if v is not None else None

        skipped_item_names: list[str] = []
        comparable_items = []
        for requested_item in request_data.items:
            if baseline_store is not None:
                if unit_price_at_store(baseline_store.id, requested_item.name) is None:
                    skipped_item_names.append(requested_item.name)
                else:
                    comparable_items.append(requested_item)
            else:
                comparable_items.append(requested_item)

        fallback_unit_price_by_item: dict[str, float] = {}
        for requested_item in comparable_items:
            norm = self._normalize_name(requested_item.name)
            pid = name_to_id.get(norm)
            if pid is None:
                skipped_item_names.append(requested_item.name)
                continue
            known_prices: list[float] = []
            for sid in store_ids:
                v = matrix.get((sid, pid))
                if v is not None:
                    known_prices.append(float(v))
            if not known_prices:
                skipped_item_names.append(requested_item.name)
                continue
            max_known = max(known_prices)
            if max_known <= 0:
                skipped_item_names.append(requested_item.name)
                continue
            fallback_unit_price_by_item[requested_item.name] = round(
                max_known * (1 + MISSING_PRICE_PENALTY_RATE), 4
            )

        comparable_items = [it for it in comparable_items if it.name in fallback_unit_price_by_item]

        for store in stores:
            total_price = 0.0
            missing_items: list[str] = []
            store_items: list[BasketItemResult] = []

            for requested_item in comparable_items:
                latest_unit_price = unit_price_at_store(store.id, requested_item.name)
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
            "Basket comparison completed. requested_items=%s stores_checked=%s (batched price lookup)",
            len(request_data.items),
            len(stores),
        )
        store_results.sort(key=lambda r: r.total)
        cheapest = store_results[0].store if store_results else None
        return BasketCompareResponse(results=store_results, cheapest=cheapest, skipped_items=skipped_item_names)

    def _batch_latest_unit_prices(
        self, store_ids: list[int], product_ids: list[int]
    ) -> dict[tuple[int, int], float]:
        """מחיר יחידה אחרון לכל (חנות, מוצר) — שאילתה אחת במקום אלפי קריאות ל־DB."""
        if not store_ids or not product_ids:
            return {}
        row_num = (
            func.row_number()
            .over(
                partition_by=(PriceHistory.store_id, PriceHistory.product_id),
                order_by=(PriceHistory.receipt_date.desc(), PriceHistory.id.desc()),
            )
            .label("rn")
        )
        ranked = (
            select(
                PriceHistory.store_id,
                PriceHistory.product_id,
                PriceHistory.unit_price,
                row_num,
            )
            .where(
                PriceHistory.store_id.in_(store_ids),
                PriceHistory.product_id.in_(product_ids),
            )
            .subquery("ph_ranked")
        )
        stmt: Select[tuple[int, int, float]] = select(
            ranked.c.store_id,
            ranked.c.product_id,
            ranked.c.unit_price,
        ).where(ranked.c.rn == 1)
        rows = self.db_session.execute(stmt).all()
        return {(int(r.store_id), int(r.product_id)): float(r.unit_price) for r in rows}

    @staticmethod
    def _normalize_name(text: str) -> str:
        text = text.strip()
        return " ".join(text.split())
