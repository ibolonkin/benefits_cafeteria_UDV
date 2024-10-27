import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .shemas import UserInfo
from src.config import settings
from src.users.models import REFRESH_TOKEN_TYPE, TOKEN_TYPE_FIELD, ACCESS_TOKEN_TYPE

http_bearer = HTTPBearer(auto_error=False)


def validate_token_type(
        payload: dict,
        token_type: str,
):
    if payload.get(TOKEN_TYPE_FIELD) != token_type:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"token invalid {token_type}"
                                                                             f" != {payload.get(TOKEN_TYPE_FIELD)}")


def decode_jwt(
        token: str | bytes,
        public_key=settings.auth_jwt.public_key_path.read_text(),
        algorithm=settings.auth_jwt.algorithm,
):
    decoded = jwt.decode(token, public_key, algorithms=[algorithm])
    return decoded


def decode_jwt_token(token, token_type):
    try:
        payload = decode_jwt(token=token)
        validate_token_type(payload, token_type)
        payload['uuid'] = payload['sub']
        return payload
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='invalid token')


async def get_payload_access(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)) -> UserInfo:
    try:
        token = credentials.credentials
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, )
    return UserInfo.model_validate(decode_jwt_token(token, ACCESS_TOKEN_TYPE), from_attributes=True)


async def get_payload_refresh(request: Request):
    token = request.cookies.get(settings.auth_jwt.key_cookie)
    payload = decode_jwt_token(token, REFRESH_TOKEN_TYPE)
    return payload


async def get_active_payload(userInf=Depends(get_payload_access)) -> UserInfo:
    if userInf.active:
        return userInf
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User not active')


async def get_superUser_payload(userInf=Depends(get_active_payload)) -> UserInfo:
    if userInf.super_user:
        return userInf
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='FORBIDDEN')
