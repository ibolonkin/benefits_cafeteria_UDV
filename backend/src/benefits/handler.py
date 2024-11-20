from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.base import get_async_session

from src.benefits.models import CategoryORM, BenefitsORM, Image


def get_in_db(orm, typeId):
    async def get_orm_db(uuid_orm: typeId, session=Depends(get_async_session)):
        try:
            obj = await session.get(orm, uuid_orm)

        except:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        if obj:
            return obj

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return get_orm_db


get_benefit = get_in_db(BenefitsORM, str)
get_category = get_in_db(CategoryORM, int)
get_image = get_in_db(Image, int)


async def get_categories(session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(CategoryORM).order_by(CategoryORM.name)
        categories = (await session.execute(query)).unique().scalars()
        if categories:
            return categories
        raise
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
