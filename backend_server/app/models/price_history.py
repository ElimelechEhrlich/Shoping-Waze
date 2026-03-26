from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    receipt_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    store = relationship("Store", back_populates="price_history_entries")
    product = relationship("Product", back_populates="price_history_entries")

    __table_args__ = (
        Index("ix_price_history_store_product_receipt_date", "store_id", "product_id", "receipt_date"),
    )

