import logging
from collections.abc import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.utils import normalize_product_name
from app.models.price_history import PriceHistory
from app.models.product import Product
from app.models.store import Store
from app.schemas.receipt_schema import ReceiptExtracted, ReceiptItemExtracted


logger = logging.getLogger(__name__)


class ReceiptService:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session

    def save(self, receipt_data: ReceiptExtracted) -> int:
        store = self._get_or_create_store(receipt_data.store_name)
        saved_items_count = 0

        for item in receipt_data.items:
            product = self._get_or_create_product(item.name)
            unit_price = self._calculate_unit_price(item)

            price_row = PriceHistory(
                product_id=product.id,
                store_id=store.id,
                unit_price=unit_price,
                receipt_date=receipt_data.date,
            )
            self.db_session.add(price_row)
            saved_items_count += 1

        self.db_session.commit()
        logger.info(
            "Receipt saved successfully. store_name=%s receipt_date=%s items_saved=%s",
            store.name,
            receipt_data.date.isoformat(),
            saved_items_count,
        )
        return saved_items_count

    def _get_or_create_store(self, store_name: str) -> Store:
        normalized_store_name = self._normalize_name(store_name)
        existing_store = self.db_session.scalar(
            select(Store).where(Store.name == normalized_store_name)
        )
        if existing_store:
            return existing_store

        new_store = Store(name=normalized_store_name)
        self.db_session.add(new_store)
        self.db_session.flush()
        return new_store

    def _get_or_create_product(self, product_name: str) -> Product:
        canonical = normalize_product_name(product_name)

        # 1. Match by canonical_name — finds products from prior receipts
        #    even when the spelling differs slightly.
        if canonical:
            existing = self.db_session.scalar(
                select(Product).where(Product.canonical_name == canonical)
            )
            if existing:
                return existing

        # 2. Fall back to exact normalized name match (covers products created
        #    before canonical_name was introduced).
        normalized = self._normalize_name(product_name)
        existing = self.db_session.scalar(
            select(Product).where(Product.name == normalized)
        )
        if existing:
            if existing.canonical_name is None and canonical:
                existing.canonical_name = canonical
                self.db_session.flush()
            return existing

        # 3. Create new product from this receipt.
        new_product = Product(name=normalized, canonical_name=canonical, source="receipt")
        self.db_session.add(new_product)
        self.db_session.flush()
        return new_product

    @staticmethod
    def _calculate_unit_price(item: ReceiptItemExtracted) -> float:
        if item.quantity <= 0:
            raise ValueError(f"Invalid quantity for item {item.name}: {item.quantity}")
        calculated_price = item.total_price / item.quantity
        return round(calculated_price, 4)

    @staticmethod
    def _normalize_name(text: str) -> str:
        text = text.strip()
        separators: Iterable[str] = ("-", "_", "  ")
        for separator in separators:
            text = text.replace(separator, " ")
        return " ".join(text.split())

