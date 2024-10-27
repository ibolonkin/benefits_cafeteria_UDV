from fastapi import Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from src.base import get_async_session
from src.benefits.shemas import CategoryCreate, Category, BenefitCreate, Benefit, BenefitUpdate, UpdateCategory
from .models import CategoryORM, BenefitsORM, Image, UserBenefits
from .utils import validate_file, get_user_payload
from ..users.handlerDB import get_user_uuid
from ..users.helper import get_active_payload


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
            print(e)
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


async def get_all_benefit(session: AsyncSession = Depends(get_async_session),
                          user=Depends(get_user_payload)):
    try:
        query = select(BenefitsORM)
        benefits = [b for b in (await session.execute(query)).unique().scalars()]

        query = select(UserBenefits).where(user.uuid == UserBenefits.user_uuid)
        userBenefits = (await session.execute(query)).unique().scalars()
        status_benefit = {b.benefits_uuid: b.status for b in userBenefits}
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    for b in benefits:
        b.status = status_benefit.get(b.uuid)
    available = [b for b in benefits
                 if b.experience_month <= user.experience
                 if user.adap_period >= b.adap_period
                 if user.ucoin >= b.ucoin
                 ]

    unavailable = [b for b in benefits
                   if b.experience_month > user.experience
                   if user.adap_period < b.adap_period
                   ]
    return {'available': available, 'unavailable': unavailable}


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

async def add_photo_benefit(isMain: bool = True, photo=Depends(validate_file),
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


async def choice_benefit_db(user=Depends(get_active_payload),
                            benefit=Depends(get_benefit),
                            session: AsyncSession = Depends(get_async_session)):
    userOrm = await get_user_uuid(user.uuid, session)

    if benefit.experience_month > user.experience_month:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    uCoin: bool

    if userOrm.ucoin < benefit.ucoin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Не хватает койнов')

    elif benefit.ucoin >= 0:
        uCoin = True
    else:
        uCoin = False

    try:
        userBenefit = UserBenefits(user_uuid=user.uuid, benefits_uuid=benefit.uuid)
        session.add(userBenefit)

        await session.flush()
        query = select(UserBenefits).where(userBenefit.id == UserBenefits.id)
        userBenefit = (await session.execute(query)).scalar()
        if uCoin:
            userOrm.ucoin -= benefit.ucoin
        await session.commit()
        return userBenefit
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)


async def delete_category(category_id: int, session: AsyncSession = Depends(get_async_session)):
    try:
        update(BenefitsORM).filter(category_id == BenefitsORM.category_id).values(**{'category_id': None})
        await session.flush()
        query = select(CategoryORM).where(category_id == CategoryORM.id)
        category = (await session.execute(query)).scalar()
        await session.delete(category)
        await session.commit()
        return
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def update_benefit_db(benefit_id: str, benefit_inf: BenefitUpdate,
                            session: AsyncSession = Depends(get_async_session),
                            ):
    if benefit_inf.dict(exclude_unset=True):
        try:
            stmt = update(BenefitsORM).where(benefit_id == BenefitsORM.uuid).values(
                **benefit_inf.dict(exclude_unset=True))
            await session.execute(stmt)
        except:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="conflict")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty")
    await session.commit()
    benefit = await get_benefit(benefit_id, session=session)
    return benefit


async def update_category_db(category_id: int,
                             category: UpdateCategory,
                             session: AsyncSession = Depends(get_async_session)):
    if category.dict(exclude_unset=True):
        try:
            stmt = update(CategoryORM).where(category_id == CategoryORM.id).values(
                **category.dict(exclude_unset=True))
            res = await session.execute(stmt)
            if res.rowcount == 0:
                raise
        except:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="conflict")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty")
    await session.commit()

    return {'id': category_id, 'name': category.name}
