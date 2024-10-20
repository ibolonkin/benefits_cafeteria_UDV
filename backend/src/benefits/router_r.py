from io import BytesIO
from fastapi import APIRouter, Depends, Response
from starlette.responses import StreamingResponse
from src.benefits.handlerDB import get_image, get_all_benefit, get_categories
from src.benefits.shemas import BenefitCategory, Category
from src.users.helper import get_active_payload

router = APIRouter(dependencies=[Depends(get_active_payload)])


# @router.get('/{benefit_id}/')
# async def get_benefit(benefit=Depends(get_benefit)) -> BenefitCategory:
#     return benefit


@router.get('/')
async def get_all_benefits(benefits=Depends(get_all_benefit)) -> list[BenefitCategory]:
    benefits = [BenefitCategory.model_validate(benefit, from_attributes=True) for benefit in benefits]
    return benefits


@router.get('/image/{image_id}')
async def get_image(response: Response, image=Depends(get_image)) -> StreamingResponse:
    response.headers["Cache-Control"] = "public, max-age=3600"
    return StreamingResponse(BytesIO(image), media_type="image/jpeg")


@router.get('/category')
async def get_category(categories=Depends(get_categories)):
    categories = [Category.model_validate(category, from_attributes=True) for category in categories]
    return categories
