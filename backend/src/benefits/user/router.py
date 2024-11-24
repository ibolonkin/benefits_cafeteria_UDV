from fastapi import APIRouter, Depends
from starlette.responses import StreamingResponse
from io import BytesIO

from src.benefits.handler import get_categories, get_image
from src.benefits.shemas import BenefitAvailable, Category, BenefitsAvailable, Application
from src.benefits.user.handler import get_all_benefit, choice_benefit_db, get_benefit_available
from src.utils import get_active_payload

router = APIRouter(dependencies=[Depends(get_active_payload)])

@router.get('/images/{uuid_orm}/')
async def get_image(image=Depends(get_image)) -> StreamingResponse:
    return StreamingResponse(BytesIO(image.data), media_type="image/jpeg")

@router.get('/benefits/')
async def get_all_benefits(benefits=Depends(get_all_benefit)) -> list[BenefitsAvailable]:
    return benefits

@router.get('/benefits/{uuid_orm}/')
async def get_benefit(benefit=Depends(get_benefit_available)) -> BenefitAvailable:
    return benefit

@router.post('/benefits/{uuid_orm}/choose')
async def choice_benefit(benefit=Depends(choice_benefit_db)) -> Application:
    return benefit

@router.get('/categories/')
async def get_category(categories=Depends(get_categories)) -> list[Category]:
    categories = [Category.model_validate(category, from_attributes=True) for category in categories
                  if category.is_published]
    return categories