from fastapi import APIRouter, status, Response, Depends, Cookie, HTTPException

from src.config import settings
from src.handler import refresh_get_user
from src.users.auth.handler import register_user_db, find_auth_user

from src.utils import Token, create_tokens

router = APIRouter(responses={401: {'detail': "NOT AUTHORIZED"}}, tags=["Auth"])


@router.post('/registration/', status_code=status.HTTP_201_CREATED,
             description='Регистрация пользователя')
async def register(response: Response, user_inf=Depends(register_user_db)) -> Token:
    return create_tokens(user_inf, response)


@router.post('/login/', description='Авторизация или вход пользователя')
async def auth(response: Response, user_inf=Depends(find_auth_user)) -> Token:
    return create_tokens(user_inf, response)


@router.post('/logout/', description='Выход из аккаунта')
async def logout(response: Response, cookies: str | None = Cookie(alias=settings.auth_jwt.key_cookie), ):
    if cookies:
        response.delete_cookie(settings.auth_jwt.key_cookie)
        return {
            'detail': 'ok'
        }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Нет аккаунта')


@router.post('/refresh/', description='Обновление ассес токена через рефреш')
async def refresh(response: Response, user_inf=Depends(refresh_get_user)) -> Token:
    return create_tokens(user_inf, response)

