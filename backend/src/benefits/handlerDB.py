from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.base import get_async_session
from src.benefits.shemas import CategoryCreate, Category, BenefitCreate, Benefit
from .models import CategoryORM, BenefitsORM, Image
from .utils import validate_file

# TODO: Добавить выбирание льгот

def create_in_db(orm_cls, validate_cls, cls_accept):
    async def create_model_db(model: cls_accept, session=Depends(get_async_session)):
        try:
            model_orm = orm_cls(**model.dict())
            session.add(model_orm)
            await session.flush()
            model_new = validate_cls.model_validate(model_orm, from_attributes=True)
            await session.commit()
            return model_new
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    return create_model_db


create_category_db = create_in_db(CategoryORM, Category, CategoryCreate)
create_benefit_db = create_in_db(BenefitsORM, Benefit, BenefitCreate)

# TODO: перенести в статистику и добавить доп валидацию
async def get_benefit(benefit_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(BenefitsORM).where(benefit_id == BenefitsORM.uuid)
        # options(selectinload(BenefitsORM.users)) что бы достать пользователей которые используют данный бенефит
        benefit = (await session.execute(query)).scalar()
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    if benefit:
        return benefit

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def get_image(image_id: int, session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(Image).where(image_id == Image.id)
        image = (await session.execute(query)).scalar()
        if image:
            return image.data
        raise
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def get_categories(session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(CategoryORM)
        categories = (await session.execute(query)).unique().scalars()
        if categories:
            return categories
        raise
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def get_all_benefit(session: AsyncSession = Depends(get_async_session)):

    # TODO: переделать под конкретного пользователя

    try:
        query = select(BenefitsORM)
        benefits = (await session.execute(query)).unique().scalars()
        return benefits
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)


# async def create_category_db(category: CategoryCreate, session=Depends(get_async_session)):
#     category_orm = CategoryORM(**category.dict())
#     session.add(category_orm)
#     await session.flush()
#     category: Category = Category.model_validate(category_orm, from_attributes=True)
#     await session.commit()
#     return category

# async def create_benefit_db(benefit: BenefitCreate, session=Depends(get_async_session)):
#     benefit_orm = BenefitsORM(**benefit.dict())
#     session.add(benefit_orm)
#     await session.flush()
#     benefit: Benefit = Benefit.model_validate(benefit_orm, from_attributes=True)
#     await session.commit()
#     return benefit

async def add_photo_benefit(isMain: bool, photo=Depends(validate_file),
                            benefit: BenefitsORM = Depends(get_benefit),
                            session=Depends(get_async_session)):
    image = Image(data=photo)
    session.add(image)
    await session.flush()

    if isMain:
        benefit.main_photo = image.id
    else:
        benefit.background_photo = image.id

    await session.commit()

    return benefit
