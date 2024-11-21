from fastapi import APIRouter, Depends

from src.handler import get_active_user
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
async def get_my_info(user=Depends(get_active_user)):
    return user

@router.get('/benefits/')
async def get_my_benefit(benefits=Depends(get_user_info_benefit)):
    return benefits