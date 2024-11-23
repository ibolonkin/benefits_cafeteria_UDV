from fastapi import Depends, HTTPException,status
from sqlalchemy import select
from sqlalchemy.orm import selectinload


from src.base import get_async_session
from src.handler import get_active_user
from src.users.models import UsersORM, UserImages
from src.utils import get_active_payload, validate_file


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


async def get_user_photo(user=Depends(get_active_payload), session=Depends(get_async_session)):
    try:
        photo = await session.get(UserImages, user.uuid)
        if photo:
            return photo
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,)
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,)


async def update_photo_user(user=Depends(get_active_user),
                            photo_new=Depends(validate_file),
                            session=Depends(get_async_session)
                            ):
    try:
        photo = await get_user_photo(user, session)
        photo.data = photo_new

    except HTTPException:
        userImages = UserImages(user_uuid=user.uuid, data=photo_new)
        session.add(userImages)

    await session.commit()
    await session.refresh(user)
    return user

async def delete_photo_user(user=Depends(get_active_payload), session=Depends(get_async_session)):
    try:
        photo = await get_user_photo(user, session)
        await session.delete(photo)
        await session.commit()
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,)


