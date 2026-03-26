from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.product import Product
from app.schemas.products_schema import ProductListResponse, ProductListItem


router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    q: str | None = Query(default=None, description="Optional case-insensitive search by product name"),
    limit: int = Query(default=500, ge=1, le=5000),
    db_session: Session = Depends(get_db),
) -> ProductListResponse:
    stmt = select(Product).order_by(Product.name.asc()).limit(limit)
    products = db_session.scalars(stmt).all()

    q_norm = (q or "").strip().lower()
    if q_norm:
        products = [p for p in products if q_norm in p.name.lower()]

    items = [
        ProductListItem(
            id=p.id,
            name=p.name,
            category=_guess_category(p.name),
            unit="יח'",
            price=0.0,
        )
        for p in products
    ]
    return ProductListResponse(products=items)


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

