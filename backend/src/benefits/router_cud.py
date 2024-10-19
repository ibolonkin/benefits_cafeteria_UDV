from fastapi import APIRouter, Depends
from src.benefits.handlerDB import create_category_db, create_benefit_db, add_photo_benefit
from src.benefits.shemas import Category, Benefit
from src.users.helper import get_superUser_payload

router = APIRouter(dependencies=[Depends(get_superUser_payload)])

@router.post('/category')
async def create_category(category: Category = Depends(create_category_db)):
    return category


@router.post("/")
async def create_benefit(benefit: Benefit = Depends(create_benefit_db)):
    return benefit


@router.patch('/{benefit_id}/')
async def add_photo(benefit=Depends(add_photo_benefit)):
    return benefit

