from fastapi import APIRouter, Depends
from src.benefits.handlerDB import create_category_db, create_benefit_db, add_photo_benefit, delete_category, \
    update_benefit_db, update_category_db, add_photo_category, delete_benefit_db, get_all_benefit_admin
from src.benefits.shemas import Category, Benefit, BenefitCategory
from src.users.helper import get_superUser_payload

router = APIRouter(dependencies=[Depends(get_superUser_payload)])


@router.post('/category/')
async def create_category(category: Category = Depends(create_category_db)):
    return category


@router.post("/")
async def create_benefit(benefit: Benefit = Depends(create_benefit_db)):
    return benefit


@router.patch('/{benefit_id}/')
async def add_photo(benefit=Depends(add_photo_benefit)) -> BenefitCategory:
    benefit = BenefitCategory.model_validate(benefit, from_attributes=True)
    return benefit


@router.patch('/category/{category_id}/')
async def add_photo_category(category=Depends(add_photo_category)) -> Category:
    return category


@router.delete('/category/{category_id}/', dependencies=[Depends(delete_category)])
async def delete_category():
    pass


@router.put('/{benefit_id}/')
async def update_benefit(benefit=Depends(update_benefit_db)) -> BenefitCategory:
    return benefit


@router.put('/category/{category_id}/')
async def update_category(category=Depends(update_category_db)) -> Category:
    return category


@router.delete('/benefit/{benefit_id}/', )
async def delete_benefit(status=Depends(delete_benefit_db)):
    return status
    pass

@router.get('/benefit/')
async def get_all_benefit_adm(benefitClass = Depends(get_all_benefit_admin)):
    return benefitClass

