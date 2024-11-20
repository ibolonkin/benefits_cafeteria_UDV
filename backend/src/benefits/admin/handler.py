from datetime import date

from fastapi import Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, and_, func, update, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.base import get_async_session
from .shemas import AnswerStatus, ApplicationStatus, BenefitUpdate, UpdateCategory
from src.benefits.handler import get_benefit, get_category
from src.benefits.models import ApplicationORM, CategoryORM, BenefitsORM, Image
from src.handler import get_user_uuid
from src.benefits.shemas import Category, Benefit, BenefitCreate, CategoryCreate
from ...users.models import UserProfilesORM, UsersORM


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


async def update_application_db(new_status: AnswerStatus, user=Depends(get_user_uuid),
                                benefit=Depends(get_benefit), session=Depends(get_async_session)):
    if not new_status.status:
        try:
            query = select(ApplicationORM).where(
                and_(ApplicationORM.user_uuid == user.uuid,
                     benefit.uuid == ApplicationORM.benefit_uuid), )
            user_benefit = (await session.execute(query)).scalar()
            await session.delete(user_benefit)
            await session.commit()
        finally:
            raise HTTPException(status_code=status.HTTP_200_OK, detail='ok')

    try:
        query = select(ApplicationORM).where(
            and_(ApplicationORM.user_uuid == user.uuid,
                 benefit.uuid == ApplicationORM.benefit_uuid), )
        user_benefit = (await session.execute(query)).scalar()

        user_benefit.status = new_status.status
        user_benefit.update_at = date.today()
    except:
        user_benefit = ApplicationORM(user_uuid=user.uuid, benefit_uuid=benefit.uuid, status=new_status.status)
        session.add(user_benefit)
        await session.flush()
        query = select(ApplicationORM).where(
            and_(ApplicationORM.user_uuid == user.uuid,
                 benefit.uuid == ApplicationORM.benefit_uuid), )
        user_benefit = (await session.execute(query)).scalar()

    await session.commit()
    return user_benefit


async def get_all_benefit_admin(start: int = Query(0, ge=0), offset: int = Query(5, ge=1, le=20),
                                session: AsyncSession = Depends(get_async_session)):
    query = select(BenefitsORM).order_by(BenefitsORM.name)

    if start and offset:
        query = query.slice(start, start + offset)
    elif start:
        query = query.offset(start)
    elif offset:
        query = query.slice(0, offset)

    benefits = [b for b in (await session.execute(query)).unique().scalars()]
    query = select(func.count()).select_from(BenefitsORM)
    result = await session.execute(query)
    count = result.scalar()
    return {'benefits': benefits, 'len': count}


async def validate_file(photo: UploadFile = File(..., media_type='image')):
    if not photo.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported. Please upload images.")
    return await photo.read()


async def add_photo(photo=Depends(validate_file), session=Depends(get_async_session)):
    image = Image(data=photo)
    session.add(image)
    await session.flush()
    return image


def add_photo_create(foo_get_orm, name_att):
    async def add_photo_orm(obj=Depends(foo_get_orm),
                            image=Depends(add_photo),
                            session=Depends(get_async_session)):
        att = getattr(obj, name_att)
        if att:
            image_old = await session.get(Image, att)
            await session.delete(image_old)
        att = image.id
        await session.commit()
        return obj

    return add_photo_orm


add_photo_benefit = add_photo_create(get_benefit, 'main_photo')
add_photo_category = add_photo_create(get_benefit, 'photo')



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


async def update_benefit_db(uuid_orm: str, benefit_inf: BenefitUpdate,
                            session: AsyncSession = Depends(get_async_session),
                            ):
    if benefit_inf.dict(exclude_unset=True):
        try:
            stmt = update(BenefitsORM).where(uuid_orm == BenefitsORM.uuid).values(
                **benefit_inf.dict(exclude_unset=True))
            await session.execute(stmt)
        except Exception as e:
            print(e)
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="conflict")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty")
    await session.commit()
    benefit = await get_benefit(uuid_orm, session=session)
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
    category = await get_category(category_id, session)

    return category


async def get_all_application_db(start: int = Query(0, ge=0), offset: int = Query(5, ge=1, le=20),
                                 order_by: str = Query('name'),
                                 sort_order: str = Query("asc"),
                                 session=Depends(get_async_session)):
    if ((order_by and order_by not in {"name", "name_benefit", "create_at", "name_category"}) or
            (sort_order and sort_order not in {"asc", "desc"})):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    try:
        query = select(ApplicationORM)
        match order_by:
            case "name":
                order = UserProfilesORM.firstname
                query = (query
                         .join(UsersORM, UsersORM.uuid == ApplicationORM.user_uuid)
                         .join(UserProfilesORM, UserProfilesORM.user_uuid == UsersORM.uuid))

            case "name_benefit":
                order = BenefitsORM.name
                query = (query.join(BenefitsORM, BenefitsORM.uuid == ApplicationORM.benefit_uuid))

            case "create_at":
                order = ApplicationORM.create_at

            case "name_category":
                order = CategoryORM.name
                query = (query
                         .join(BenefitsORM, BenefitsORM.uuid == ApplicationORM.benefit_uuid)
                         .outerjoin(CategoryORM, CategoryORM.id == BenefitsORM.category_id))
            case _:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

        query = query.where('Pending' == ApplicationORM.status)

        if sort_order == "asc":
            query = query.order_by(asc(order))
        elif sort_order == 'desc':
            query = query.order_by(desc(order))

        query = query.slice(start, start + offset)
        user_benefits = (await session.execute(query)).unique().scalars()

        query = select(func.count()).select_from(ApplicationORM).where('Pending' == ApplicationORM.status)
        result = await session.execute(query)
        count = result.scalar()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {'applications': user_benefits, 'len': count}


async def get_application(application_id: int, session=Depends(get_async_session)):
    if user_benefit := await session.get(ApplicationORM, application_id):
        return user_benefit
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def get_application_pending(application_id: int, session=Depends(get_async_session)):
    try:
        query = select(ApplicationORM).where(
            and_(application_id == ApplicationORM.id, ApplicationORM.status == 'Pending'))
        res = (await session.execute(query)).scalar()
        return res
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def update_status_application(statusAp: ApplicationStatus,
                                    application=Depends(get_application),
                                    session: AsyncSession = Depends(get_async_session)):
    if application.status == "Pending":
        if statusAp.status == 'Denied':
            user = await get_user_uuid(application.user.uuid, session=session)
            user.ucoin += application.benefit.ucoin
        application.status = statusAp.status
        application.update_at = date.today()
        await session.commit()
        await session.refresh(application)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    return application


async def delete_benefit_db(benefit=Depends(get_benefit), session=Depends(get_async_session)):
    await session.delete(benefit)
    await session.commit()
    return {'detail': 'ok'}
