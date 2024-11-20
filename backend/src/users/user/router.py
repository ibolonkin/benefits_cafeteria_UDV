from fastapi import APIRouter, Depends

from src.users.shemas import UserWithbenefit
from src.users.user.handler import get_coins_db, get_FirstLastName, get_user_info_benefit
from src.users.user.shemas import UCoin, Check

router = APIRouter(responses={401: {'detail': "NOT AUTHORIZED"}}, tags=["User: Profile"])

@router.get('/check/')
async def check_auth(info=Depends(get_FirstLastName)) -> Check:
    return info


@router.get('/ucoin/')
async def get_coin(coins=Depends(get_coins_db)) -> UCoin:
    return coins


@router.get('/info/')
async def get_my_info(user=Depends(get_user_info_benefit)) -> UserWithbenefit:
    return user

@router.get('/benefits/')
async def get_my_benefit(user=Depends(get_user_info_benefit)):
    return user.benefits