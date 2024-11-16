from fastapi import APIRouter, Depends

from src.benefits.handlerDB import get_all_application_db, get_application, update_status_application
from src.benefits.shemasU import UserBenefitPending, ApplicationAll, UserBenefit
from src.users.helper import get_superUser_payload

router = APIRouter(dependencies=[Depends(get_superUser_payload)])


@router.get('/application/')
async def get_all_applications(
        application=Depends(get_all_application_db)) -> ApplicationAll:
    return application

@router.get('/application/{application_id}')
async def get_application(application=Depends(get_application)) -> UserBenefitPending:
    return application

@router.patch('/application/{application_id}')
async def update_status_application(application=Depends(update_status_application)):
    return application