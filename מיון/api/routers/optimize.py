from fastapi import APIRouter
from services.es_service import find_cheapest

router = APIRouter()

@router.post("/optimize")
def optimize(items: list[str]):
    result = find_cheapest(items)
    return result