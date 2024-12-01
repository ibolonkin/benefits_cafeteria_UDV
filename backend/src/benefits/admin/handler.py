from datetime import date, timedelta

from fastapi import Depends, HTTPException, status, Query, Path
from sqlalchemy import select, and_, func, update, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.base import get_async_session
from .shemas import BenefitUpdate, UpdateCategory, CategoryCreate, AnswerStatus
from src.benefits.handler import get_benefit, get_category
from src.benefits.models import ApplicationORM, CategoryORM, BenefitsORM, Image, HistoryBenefitsORM, ApprovedBenefitsORM
from src.handler import get_user_uuid
from src.benefits.shemas import BenefitCreate, CategoryAdmin, BenefitAdmin

#  Плохо что использую это тут наверно надо как то по другому придумать
from src.users.models import UserProfilesORM, UsersORM
from src.utils import validate_file
from src.statistics.handler import create_history_user, create_history_benefit


def create_in_db(orm_cls, validate_cls, cls_accept):
    async def create_model_db(model: cls_accept, session=Depends(get_async_session)):
        try:
            model_orm = orm_cls(**model.dict())
            if orm_cls == BenefitsORM:
                await create_history_benefit(model_orm, 'Create', session=session)
            else:
                query = select(func.count()).select_from(CategoryORM).where(CategoryORM.is_published)
                count = (await session.execute(query)).scalar()

                if count >= 6:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                        detail="Уже существует 6 опубликованных льгот,"
                                               " невозможно добавление больше")
            session.add(model_orm)
            await session.flush()
            await session.refresh(model_orm)
            model_new = validate_cls.model_validate(model_orm, from_attributes=True)
            await session.commit()
            return model_new
        except HTTPException as exc:
            raise exc
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    return create_model_db


create_category_db = create_in_db(CategoryORM, CategoryAdmin, CategoryCreate)
create_benefit_db = create_in_db(BenefitsORM, BenefitAdmin, BenefitCreate)


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
                                order_by: str = Query('is_published'),
                                sort_order: str = Query("asc"),
                                session: AsyncSession = Depends(get_async_session)):
    query = select(BenefitsORM)

    if ((order_by and order_by not in {'is_published', 'name', 'category', "experience_month"}) or
            (sort_order and sort_order not in {"asc", "desc"})):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    match order_by:
        case "is_published":
            order = BenefitsORM.is_published
        case 'name':
            order = BenefitsORM.name
        case "experience_month":
            order = BenefitsORM.experience_month

        case 'category':
            order = CategoryORM.name
            query = (query
                     .outerjoin(CategoryORM, CategoryORM.id == BenefitsORM.category_id))
        case _:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    if sort_order == 'asc':
        query = query.order_by(asc(order))
    else:
        query = query.order_by(desc(order))

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


async def add_photo(photo=Depends(validate_file), session=Depends(get_async_session)):
    image = Image(data=photo)
    session.add(image)
    await session.flush()
    return image


def add_photo_create(foo_get_orm, name_obj):
    async def add_photo_orm(obj=Depends(foo_get_orm),
                            image=Depends(add_photo),
                            session=Depends(get_async_session)):
        if name_obj == "category":
            att = obj.photo
            obj.photo = None
        else:
            att = obj.main_photo
            obj.photo = None

        if name_obj == "category":
            obj.photo = image.id
        else:
            obj.main_photo = image.id

        if att:
            image_old = await session.get(Image, att)
            await session.delete(image_old)
        await session.commit()
        return obj

    return add_photo_orm


async def delete_photo(idx: int, session: AsyncSession = Depends(get_async_session)):
    try:

        image = await session.get(Image, idx)

        if image:
            await session.delete(image)
            await session.commit()
            return
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='not photo')


def delete_photo_create(foo_get_orm, name_obj):
    async def delete_photo_orm(obj=Depends(foo_get_orm),
                               session=Depends(get_async_session)):
        if name_obj == "category":
            att = obj.photo
            obj.photo = None
        else:
            att = obj.main_photo
            obj.main_photo = None
        await session.flush()
        if att:
            await delete_photo(att, session=session)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='not photo')
        await session.refresh(obj)
        return obj

    return delete_photo_orm


add_photo_benefit = add_photo_create(get_benefit, 'benefit')
add_photo_category = add_photo_create(get_category, 'category')

delete_photo_benefit = delete_photo_create(get_benefit, 'benefit')
delete_photo_category = delete_photo_create(get_category, 'category')


async def delete_category(category_id:int, session: AsyncSession = Depends(get_async_session)):
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
        except:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty")
    await session.commit()
    benefit = await get_benefit(uuid_orm, session=session)
    return benefit


async def update_category_db(
        category: UpdateCategory,
        category_id: int = Path(..., ge=0),
        session: AsyncSession = Depends(get_async_session)):
    if hasattr(category, 'is_published') and category.is_published:

        query = select(func.count()).select_from(CategoryORM).where(CategoryORM.is_published,
                                                                    category_id != CategoryORM.id)
        count = (await session.execute(query)).scalar()

        if count >= 6:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Уже существует 6 опубликованных льгот,"
                                                                                " невозможно добавление больше")

    if category.dict(exclude_unset=True):
        try:
            stmt = update(CategoryORM).where(category_id == CategoryORM.id).values(
                **category.dict(exclude_unset=True))
            res = await session.execute(stmt)
            if res.rowcount == 0:
                raise
        except:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, )
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


async def get_application(application_id: int = Path(..., ge=0), session=Depends(get_async_session)):
    if user_benefit := await session.get(ApplicationORM, application_id):
        return user_benefit
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


async def update_status_application(statusAp: AnswerStatus,
                                    application=Depends(get_application),
                                    session: AsyncSession = Depends(get_async_session)):
    if application.status == "Pending":
        user = await get_user_uuid(application.user.uuid, session=session)
        if statusAp.status == 'Denied':
            user.ucoin += application.benefit.ucoin
            obj = HistoryBenefitsORM(user_uuid=user.uuid, benefit_uuid=application.benefit.uuid, status='Denied',
                                     msg=statusAp.msg)
            session.add(obj)
            await create_history_user(benefit=application.benefit, user=application.user, status='Denied',
                                      session=session)
        else:
            if application.benefit.duration_in_days:
                end_date = date.today() + timedelta(application.benefit.duration_in_days)
            else:
                end_date = None

            obj = ApprovedBenefitsORM(user_uuid=user.uuid, benefit_uuid=application.benefit.uuid, end_date=end_date)
            session.add(obj)
            await create_history_user(benefit=application.benefit, user=application.user, status='Approved',
                                      session=session)
        await session.delete(application)

        await session.commit()

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    return obj


async def delete_benefit_db(benefit=Depends(get_benefit), session=Depends(get_async_session)):
    await session.delete(benefit)
    await create_history_benefit(benefit, 'Delete', session=session)
    await session.commit()
    return {'detail': 'ok'}
