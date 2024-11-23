
import jwt

from datetime import timedelta, datetime, timezone
from pydantic import BaseModel, UUID4
from fastapi import Depends, HTTPException, status, Request, UploadFile, File
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.config import settings

TOKEN_TYPE_FIELD = "type"
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


class Token(BaseModel):
    token_type: str = 'Bearer'
    accessToken: str

class UserInfo(BaseModel):
    uuid: UUID4
    active: bool
    super_user: bool

    def get(self, att: str):
        if hasattr(self, att):
            return getattr(self, att)
        return None

def encode_jwt(
        payload: dict,
        private_key=settings.auth_jwt.private_key_path.read_text(),
        algorithm=settings.auth_jwt.algorithm,
        expire_minutes=settings.auth_jwt.access_token_expire_minutes,
        expire_timedelta: timedelta | None = None
):
    to_encode = payload.copy()
    now = datetime.now(timezone.utc)
    if expire_timedelta:
        expire = now + expire_timedelta
    else:
        expire = now + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire, 'iat': now})

    encoded = jwt.encode(to_encode, private_key, algorithm=algorithm)
    return encoded


def create_jwt(token_type: str, token_data: dict,
               expire_minutes=settings.auth_jwt.access_token_expire_minutes,
               expire_timedelta: timedelta | None = None):
    jwt_payload = {TOKEN_TYPE_FIELD: token_type}
    jwt_payload.update(token_data)
    return encode_jwt(payload=jwt_payload, expire_minutes=expire_minutes, expire_timedelta=expire_timedelta)


def create_access_token(user_inf) -> str:
    jwt_payload = {
        'sub': str(user_inf.uuid),
        'active': user_inf.active,
        'super_user': user_inf.super_user,
    }
    return create_jwt(token_type=ACCESS_TOKEN_TYPE,
                      token_data=jwt_payload,
                      expire_minutes=settings.auth_jwt.access_token_expire_minutes,
                      )


def create_refresh_token(user) -> str:
    jwt_payload = {
        "sub": str(user.uuid)
    }
    return create_jwt(token_type=REFRESH_TOKEN_TYPE,
                      token_data=jwt_payload,
                      expire_timedelta=timedelta(days=settings.auth_jwt.refresh_token_expire_days))


def create_tokens(user_inf, response):
    access_token = create_access_token(user_inf)
    refresh_token = create_refresh_token(user_inf)
    response.set_cookie(key=settings.auth_jwt.key_cookie, value=refresh_token,
                        max_age=settings.auth_jwt.refresh_token_expire_days * 24 * 60 * 60,
                        )
    return Token(
        accessToken=access_token,
    )


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


async def get_payload_access(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)):
    try:
        token = credentials.credentials
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, )
    return UserInfo.model_validate(decode_jwt_token(token, ACCESS_TOKEN_TYPE), from_attributes=True)


async def get_payload_refresh(request: Request):
    token = request.cookies.get(settings.auth_jwt.key_cookie)
    payload = decode_jwt_token(token, REFRESH_TOKEN_TYPE)
    return payload


async def get_active_payload(userInf=Depends(get_payload_access)):
    if userInf.active:
        return userInf
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User not active')


async def get_superUser_payload(userInf=Depends(get_active_payload)):
    if userInf.super_user:
        return userInf
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='FORBIDDEN')

async def validate_file(photo: UploadFile = File(..., media_type='image')):
    if not photo.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported. Please upload images.")
    return await photo.read()