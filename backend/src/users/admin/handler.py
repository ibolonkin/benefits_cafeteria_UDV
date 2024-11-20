from fastapi import Depends, HTTPException, status, Query
from sqlalchemy import select, asc, desc, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.base import get_async_session
from src.handler import get_user_uuid
from src.users.admin.shemas import UserAll, UserUpdate
from src.users.models import UserProfilesORM, UsersORM

async def get_user_uuid_selectLoad(user_uuid: str, session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(UsersORM).where(user_uuid == UsersORM.uuid).options(selectinload(UsersORM.applications))
        if user := (await session.execute(query)).scalar():
            return user
        raise Exception
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NOT FOUND")

async def get_users_offset(start: int = Query(0, ge=0), offset: int = Query(5, ge=1, le=20),
                           order_by: str = Query('name'),
                           sort_order: str = Query("asc"),
                           session: AsyncSession = Depends(get_async_session)):
    order = {"name": UserProfilesORM.firstname,
             "email": UsersORM.email,
             "create_at": UsersORM.create_at,
             "job_title": UserProfilesORM.job_title}.get(order_by)

    if not order:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, )

    query = select(UsersORM).join(UserProfilesORM)

    if sort_order == "asc":
        query = query.order_by(asc(order))
    elif sort_order == 'desc':
        query = query.order_by(desc(order))
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    query = query.slice(start, start + offset)
    users = (await session.execute(query)).unique().scalars()
    query = select(func.count()).select_from(UsersORM)
    result = await session.execute(query)
    count = result.scalar()

    return {'users': [UserAll.model_validate(u, from_attributes=True) for u in users], 'len': count}


async def update_user_db(user_id: str, new_user: UserUpdate, session: AsyncSession = Depends(get_async_session)):
    profile = {}
    if new_user.profile:
        profile = new_user.profile.dict(exclude_unset=True)
        if hasattr(new_user, 'profile'):
            delattr(new_user, 'profile')

    flag = False

    if new_user.dict(exclude_unset=True):
        try:
            stmt = update(UsersORM).where(user_id == UsersORM.uuid).values(**new_user.dict(exclude_unset=True))
            await session.execute(stmt)
            flag = True
        except:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="conflict")

    if profile:
        stmt2 = update(UserProfilesORM).where(user_id == UserProfilesORM.user_uuid).values(**profile)
        await session.execute(stmt2)
        flag = True

    if not flag:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty")

    await session.commit()

    user = await get_user_uuid(user_id, session)

    return user
