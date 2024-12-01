from io import BytesIO

from fastapi import APIRouter, Depends, status
from starlette.responses import StreamingResponse

from src.handler import get_active_user
from src.users.shemas import User
from src.users.user.handler import (get_coins_db, get_FirstLastName, get_user_info_benefit, get_user_photo,
                                    update_photo_user, delete_photo_user)
from src.users.user.shemas import UCoin, Check, BenefitsUser

router = APIRouter(responses={401: {'detail': "NOT AUTHORIZED"}}, tags=["User: Profile"])


@router.get('/check/')
async def check_auth(info=Depends(get_FirstLastName)) -> Check:
    return info


@router.get('/ucoin/')
async def get_coin(coins=Depends(get_coins_db)) -> UCoin:
    return coins


@router.get('/info/')
async def get_my_info(user=Depends(get_active_user)) -> User:
    return user


@router.get('/benefits/')
async def get_my_benefit(benefits=Depends(get_user_info_benefit)) -> list[BenefitsUser]:
    return benefits


@router.patch('/photo/update')
async def update_my_photo(user=Depends(update_photo_user)) -> User:
    return user

@router.delete('/photo/delete', dependencies=[Depends(delete_photo_user)])
async def delete_my_photo():
    pass


@router.get('/photo/', status_code=status.HTTP_201_CREATED)
async def get_my_photo(photo=Depends(get_user_photo)):
    return StreamingResponse(BytesIO(photo.data), media_type="image/jpeg")
