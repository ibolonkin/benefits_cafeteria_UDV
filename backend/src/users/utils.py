from datetime import timedelta, datetime, timezone, date
import jwt
from src.config import settings
from src.users.models import TOKEN_TYPE_FIELD, ACCESS_TOKEN_TYPE, REFRESH_TOKEN_TYPE
from src.users.shemas import Token


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



