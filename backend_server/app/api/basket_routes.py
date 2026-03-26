from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.basket_schema import BasketCompareRequest, BasketCompareResponse
from app.services.basket_service import BasketService


router = APIRouter(prefix="/basket", tags=["basket"])


@router.post("/compare", response_model=BasketCompareResponse)
def compare_basket(
    request_data: BasketCompareRequest,
    db_session: Session = Depends(get_db),
) -> BasketCompareResponse:
    basket_service = BasketService(db_session)
    return basket_service.compare_basket_prices(request_data)

