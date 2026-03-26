from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.utils import normalize_product_name
from app.database.session import get_db
from app.models.price_history import PriceHistory
from app.models.product import Product
from app.models.store import Store
from app.schemas.products_schema import (
    ProductCreateRequest,
    ProductCreateResponse,
    ProductListItem,
    ProductListResponse,
)

router = APIRouter(prefix="/products", tags=["products"])

_UNKNOWN_STORE_NAMES: frozenset[str] = frozenset({"unknown", "לא ידוע", "לא מזוהה", ""})


@router.get("", response_model=ProductListResponse)
def list_products(
    q: str | None = Query(default=None, description="Optional case-insensitive search by product name"),
    limit: int = Query(default=500, ge=1, le=5000),
    db_session: Session = Depends(get_db),
) -> ProductListResponse:
    stmt = (
        select(Product, func.avg(PriceHistory.unit_price).label("avg_price"))
        .outerjoin(PriceHistory, Product.id == PriceHistory.product_id)
        .group_by(Product.id, Product.name, Product.canonical_name, Product.source)
        .order_by(Product.name.asc())
    )

    q_norm = (q or "").strip().lower()
    if q_norm:
        stmt = stmt.where(Product.name.ilike(f"%{q_norm}%"))

    stmt = stmt.limit(limit)
    rows = db_session.execute(stmt).all()

    items = [
        ProductListItem(
            id=row.Product.id,
            name=row.Product.name,
            category=_guess_category(row.Product.name),
            unit="יח'",
            price=round(float(row.avg_price), 2) if row.avg_price else 0.0,
        )
        for row in rows
    ]
    return ProductListResponse(products=items)


@router.post("", response_model=ProductCreateResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    body: ProductCreateRequest,
    db_session: Session = Depends(get_db),
) -> ProductCreateResponse:
    canonical = normalize_product_name(body.name)
    normalized_name = " ".join(body.name.strip().split())

    # Check if product already exists (by canonical name or exact name)
    existing = None
    if canonical:
        existing = db_session.scalar(select(Product).where(Product.canonical_name == canonical))
    if not existing:
        existing = db_session.scalar(select(Product).where(Product.name == normalized_name))

    already_existed = existing is not None
    if already_existed:
        product = existing
    else:
        product = Product(name=normalized_name, canonical_name=canonical, source="manual")
        db_session.add(product)
        db_session.flush()

    saved_price = 0.0

    # Save price entry if price + store provided and store is known
    if body.price is not None and body.price > 0 and body.store_name:
        store_name_norm = " ".join(body.store_name.strip().split())
        if store_name_norm.lower() not in _UNKNOWN_STORE_NAMES:
            store = db_session.scalar(select(Store).where(Store.name == store_name_norm))
            if not store:
                store = Store(name=store_name_norm)
                db_session.add(store)
                db_session.flush()

            entry_date = body.receipt_date or date.today()
            price_row = PriceHistory(
                product_id=product.id,
                store_id=store.id,
                unit_price=round(body.price, 4),
                receipt_date=entry_date,
            )
            db_session.add(price_row)
            saved_price = body.price

    db_session.commit()

    # If no price was saved now, check existing average
    if saved_price == 0.0:
        avg = db_session.scalar(
            select(func.avg(PriceHistory.unit_price)).where(PriceHistory.product_id == product.id)
        )
        saved_price = round(float(avg), 2) if avg else 0.0

    msg = "מוצר קיים — מחיר עודכן" if already_existed and body.price else (
          "מוצר קיים במאגר" if already_existed else "מוצר חדש נוסף למאגר"
    )

    return ProductCreateResponse(
        id=product.id,
        name=product.name,
        category=_guess_category(product.name),
        price=saved_price,
        already_existed=already_existed,
        message=msg,
    )


def _guess_category(product_name: str) -> str:
    name = product_name.strip()
    if not name:
        return "general"

    n = name.lower()

    # Snack brands/types checked FIRST — must beat vegetable/fruit keyword matches.
    # e.g. "ביסלי בצל" contains "בצל" but is a snack, not a vegetable.
    snacks = (
        "ביסלי", "במבה", "טוגו", "שלייקס", "חטיף", "צ'יפס", "קרקר",
        "פופקורן", "עוגיה", "עוגי", "וופל", "שוקולד", "ממתק", "סוכריה",
        "קרמבו", "פצפוצי", "חטיפי", "ארטיק", "ברנע",
    )
    vegetables = ("עגבנ", "מלפפ", "פלפל", "גזר", "בצל", "חסה", "כרוב", "קישוא", "חציל", "תפוח אדמה", "שום")
    fruits = ("תפוח", "בננה", "תפוז", "ענב", "מנגו", "אבטיח", "אפרסק", "נקטרינה", "שזיף", "אגס")
    dairy = ("חלב", "גבינה", "יוגורט", "שמנת", "חמאה", "ביצים")
    bakery = ("לחם", "חלה", "פיתה", "פיתות", "בורקס", "בגט")
    dry = ("אורז", "פסטה", "קמח", "סוכר", "קפה", "שמן")
    meat = ("עוף", "בשר", "הודו", "דג")
    frozen = ("קפוא", "גלידה")
    cleaning = ("ניקוי", "כביסה", "סבון", "שמפו", "מרכך", "אקונומיקה")

    def has_any(tokens: tuple[str, ...]) -> bool:
        return any(t in name for t in tokens) or any(t in n for t in tokens)

    # Snacks before vegetables/fruits to avoid false matches on flavor words
    if has_any(snacks):
        return "snacks"
    if has_any(vegetables):
        return "vegetables"
    if has_any(fruits):
        return "fruits"
    if has_any(dairy):
        return "dairy"
    if has_any(bakery):
        return "bakery"
    if has_any(dry):
        return "dry"
    if has_any(meat):
        return "meat"
    if has_any(frozen):
        return "frozen"
    if has_any(cleaning):
        return "cleaning"
    return "general"

