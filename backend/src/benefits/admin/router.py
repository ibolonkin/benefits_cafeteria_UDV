from fastapi import APIRouter, Depends, status

from src.benefits.admin.handler import (create_category_db, create_benefit_db, add_photo_benefit, add_photo_category,
                                        delete_category, delete_benefit_db, update_benefit_db, update_category_db,
                                        get_all_application_db, get_application,
                                        update_status_application, get_all_benefit_admin,
                                        delete_photo_benefit, delete_photo_category)
from src.benefits.admin.shemas import ApplicationAll, UserBenefitPending
from src.benefits.handler import get_categories, get_benefit
from src.benefits.shemas import Benefit, BenefitCategory, CategoryAdmin
from src.utils import get_superUser_payload

router = APIRouter(dependencies=[Depends(get_superUser_payload)])

routerApplication = APIRouter(tags=["Admin: Application"])
routerBenefits = APIRouter(tags=["Admin: Benefits"])


@routerBenefits.post('/categories/', status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryAdmin = Depends(create_category_db)):
    return category


@routerBenefits.post("/benefits/", status_code=status.HTTP_201_CREATED)
async def create_benefit(benefit: Benefit = Depends(create_benefit_db), ):
    return benefit


@routerBenefits.patch('/benefits/{uuid_orm}/photo')
async def add_photo(benefit=Depends(add_photo_benefit)) -> BenefitCategory:
    benefit = BenefitCategory.model_validate(benefit, from_attributes=True)
    return benefit


@routerBenefits.patch('/categories/{uuid_orm}/photo')
async def add_photo_category(category=Depends(add_photo_category)) -> CategoryAdmin:
    return category


@routerBenefits.delete('/categories/{uuid_orm}/delete', dependencies=[Depends(delete_category)])
async def delete_category():
    pass


@routerBenefits.delete('/benefits/{uuid_orm}/delete', )
async def delete_benefit(status=Depends(delete_benefit_db)):
    return status


@routerBenefits.put('/benefits/{uuid_orm}/edit')
async def update_benefit(benefit=Depends(update_benefit_db)) -> BenefitCategory:
    return benefit


@routerBenefits.put('/categories/{uuid_orm}/edit')
async def update_category(category=Depends(update_category_db)) -> CategoryAdmin:
    return category


@routerApplication.get('/applications/')
async def get_all_applications(
        application=Depends(get_all_application_db)) -> ApplicationAll:
    return application


@routerApplication.get('/applications/{application_id}')
async def get_application(application=Depends(get_application)) -> UserBenefitPending:
    return application


@routerApplication.patch('/applications/{application_id}')
async def update_status_application(application=Depends(update_status_application)):
    return application


@routerBenefits.get('/a/benefits/')
async def get_benefit_admin(obj=Depends(get_all_benefit_admin)):
    return obj


@routerBenefits.get('/a/categories/')
async def get_category_admin(categories=Depends(get_categories)) -> list[CategoryAdmin]:
    return [CategoryAdmin.model_validate(c, from_attributes=True) for c in categories]


@routerBenefits.get('/a/benefits/{uuid_orm}')
async def get_benefit_admin(obj=Depends(get_benefit)):
    return obj


@routerBenefits.delete('/benefits/{uuid_orm}/delete/photo', dependencies=[Depends(delete_photo_benefit)])
async def delete_photo_benefit():
    pass


@routerBenefits.delete('/categories/{uuid_orm}/delete/photo', dependencies=[Depends(delete_photo_category)])
async def delete_photo_category():
    pass


router.include_router(routerApplication)
router.include_router(routerBenefits)
