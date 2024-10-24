from fastapi import (APIRouter, Depends,
                     Response, status, HTTPException, Request)
from .handlerDB import register_user_db, refresh_get_user, find_auth_user, get_FirstLastName
from .shemas import UserInfo, Token
from .utils import create_tokens
from ..config import settings

router = APIRouter(responses={401: {'detail': "NOT AUTHORIZED"}})


@router.post('/registration', status_code=status.HTTP_201_CREATED,
             description='Регистрация пользователя')
async def register(response: Response, user_inf=Depends(register_user_db)) -> Token:
    return create_tokens(user_inf, response)


@router.post('/login', description='Авторизация или вход пользователя')
async def auth(response: Response, user_inf: UserInfo = Depends(find_auth_user)) -> Token:
    return create_tokens(user_inf, response)


@router.post('/logout', description='Выход из аккаунта')
async def logout(request: Request, response: Response):
    if request.cookies.get(settings.auth_jwt.key_cookie):
        response.delete_cookie(settings.auth_jwt.key_cookie)
        return {
            'detail': 'ok'
        }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Нет аккаунта')


@router.post('/refresh', description='Обновление ассес токена через рефреш')
async def refresh(response: Response, user_inf: UserInfo = Depends(refresh_get_user)) -> Token:
    return create_tokens(user_inf, response)


@router.get('/check')
async def check_auth(info=Depends(get_FirstLastName)):
    return info
