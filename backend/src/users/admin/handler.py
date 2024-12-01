from datetime import date, timedelta

from fastapi import Depends, HTTPException, status, Query
from sqlalchemy import select, asc, desc, func, update, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.base import get_async_session
from src.statistics.handler import create_history_user
from src.utils import validate_file
from src.config import settings
from src.handler import get_user_uuid
from src.users.admin.shemas import UserUpdate, ProfileUpdate, UserAllAdmin, StatusApp
from src.users.models import UserProfilesORM, UsersORM, UserImages
from src.benefits.models import ApprovedBenefitsORM, ApplicationORM, HistoryBenefitsORM


async def get_user_benefits_uuid(user_uuid: str, session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(UsersORM).where(user_uuid == UsersORM.uuid).options(selectinload(UsersORM.approved_benefits),
                                                                           selectinload(UsersORM.applications))
        if user := (await session.execute(query)).scalar():
            return user.benefits_admin
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

    query = select(UsersORM).join(UserProfilesORM).where(UsersORM.email != settings.email)

    if sort_order == "asc":
        query = query.order_by(asc(order))
    elif sort_order == 'desc':
        query = query.order_by(desc(order))
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    query = query.slice(start, start + offset)
    users = (await session.execute(query)).unique().scalars()
    query = select(func.count()).select_from(UsersORM).where(UsersORM.email != settings.email)
    result = await session.execute(query)
    count = result.scalar()

    return {'users': [UserAllAdmin.model_validate(u, from_attributes=True) for u in users], 'len': count}


async def update_user_db(user_id: str, new_user: UserUpdate, session: AsyncSession = Depends(get_async_session)):
    profile = {}
    if isinstance(new_user.profile, ProfileUpdate):
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


async def get_user_photo_admin(user_uuid, session: AsyncSession = Depends(get_async_session)):
    try:
        data = await session.get(UserImages, user_uuid)
        if not data:
            raise
        return data
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def delete_photo_user(user_uuid, session: AsyncSession = Depends(get_async_session)):
    try:
        image = await get_user_photo_admin(user_uuid, session)
        await session.delete(image)
        await session.commit()
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def update_photo_user(user_uuid,
                            photo=Depends(validate_file),
                            session: AsyncSession = Depends(get_async_session)):
    try:
        image = await get_user_photo_admin(user_uuid, session)
        await session.delete(image)
    except:
        pass
    finally:
        await session.flush()
        image = UserImages(user_uuid=user_uuid, data=photo)
        session.add(image)
        await session.commit()
    return await get_user_uuid(user_uuid, session)


async def get_all(user=Depends(get_user_uuid), session=Depends(get_async_session)):
    await session.refresh(user, attribute_names=['applications', 'approved_benefits'])
    return user


async def update_status_benefit_app(benefit_uuid: str, answer: StatusApp,  user: UsersORM = Depends(get_user_uuid),
                                    session=Depends(get_async_session)):
    await session.refresh(user, attribute_names=['applications', 'approved_benefits'])

    if not any(benefit_uuid == str(b.benefit_uuid) for b in user.app_admin):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="benefit not found in user_benefits")

    application = next((item for item in user.app_admin if str(item.benefit_uuid) == benefit_uuid), None)

    if not application:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="benefit not found in user_benefits")
    else:

        if answer.status == 'Approved':
            if not hasattr(application, 'status') or application.status == 'Approved':
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="benefit approved")
            else:

                if application.benefit.duration_in_days:
                    end_date = date.today() + timedelta(application.benefit.duration_in_days)
                else:
                    end_date = None

                obj = ApprovedBenefitsORM(user_uuid=user.uuid, benefit_uuid=application.benefit.uuid, end_date=end_date)
                session.add(obj)
                await create_history_user(benefit=application.benefit, user=application.user, status='Approved',
                                          session=session)
        else:
            user.ucoin += application.benefit.ucoin
            obj = HistoryBenefitsORM(user_uuid=user.uuid, benefit_uuid=application.benefit.uuid, status='Denied',
                                     msg=answer.msg)
            session.add(obj)
            await create_history_user(benefit=application.benefit, user=application.user, status='Denied',
                                      session=session)
        await session.delete(application)
        await session.commit()
        return obj








    pass


async def search_users(q: str, session: AsyncSession = Depends(get_async_session)):
    # Условие для поиска по имени или почте
    query = (
        select(UsersORM).join(UserProfilesORM)
        .where(
            or_(
                UserProfilesORM.firstname.ilike(f"%{q}%"),  # Имя пользователя содержит поисковую строку
                UserProfilesORM.middlename.ilike(f"%{q}%"),
                UserProfilesORM.lastname.ilike(f"%{q}%"),
                UsersORM.email.ilike(f"%{q}%")  # Почта содержит поисковую строку
            )
        )
    )

    # Выполнение запроса
    result = await session.execute(query)
    users = result.scalars().all()  # Получаем все подходящие записи
    return users
