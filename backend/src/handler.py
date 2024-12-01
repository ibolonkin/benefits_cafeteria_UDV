from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.base import get_async_session
from src.users.models import UsersORM
from src.utils import get_payload_refresh, get_verify_payload


async def get_user_uuid(user_uuid: str, session: AsyncSession = Depends(get_async_session)) -> UsersORM | None:
    try:
        if user := await session.get(UsersORM, user_uuid):
            return user

        raise
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NOT FOUND")


def get_user_token_sub_creator(
        name_foo,
):
    async def get_user_token_sub(payload=Depends(name_foo), session: AsyncSession = Depends(get_async_session)) \
            -> UsersORM:
        try:
            return await get_user_uuid(payload.get('uuid'), session)
        except HTTPException:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token invalid")

    return get_user_token_sub


refresh_get_user = get_user_token_sub_creator(get_payload_refresh)
get_active_user = get_user_token_sub_creator(get_verify_payload)
