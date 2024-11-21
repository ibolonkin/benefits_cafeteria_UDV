from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.base import get_async_session
from src.handler import get_active_user
from src.users.models import UsersORM
from src.utils import get_active_payload


async def get_coins_db(user=Depends(get_active_user)):
    return {'ucoin': user.ucoin}


async def get_FirstLastName(user=Depends(get_active_user)):
    return {"firstname": user.profile.firstname, "lastname": user.profile.lastname,
            'super_user': user.super_user}


async def get_user_info(user=Depends(get_active_user)):
    return user


async def get_user_info_benefit(user_inf=Depends(get_active_payload), session=Depends(get_async_session)):
    query = select(UsersORM).where(user_inf.uuid == UsersORM.uuid).options(selectinload(UsersORM.applications),
                                                                           selectinload(UsersORM.approved_benefits),
                                                                           selectinload(UsersORM.history))
    userOrm = (await session.execute(query)).scalar()
    return userOrm.benefits
