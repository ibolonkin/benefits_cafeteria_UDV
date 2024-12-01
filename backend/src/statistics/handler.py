from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from .models import HistoryBenefits, HistoryUserBenefits
from src.base import get_async_session
from ..benefits.models import BenefitsORM, ApprovedBenefitsORM, HistoryBenefitsORM, ApplicationORM, CategoryORM
from ..users.models import UsersORM

from sqlalchemy import select, func, case, exists, desc


async def static_info_get(session: AsyncSession = Depends(get_async_session)):
    # Подзапрос для пользователей без бенефитов
    no_benefits_subquery = (
        select(UsersORM.uuid)
        .outerjoin(ApprovedBenefitsORM, ApprovedBenefitsORM.user_uuid == UsersORM.uuid)
        .outerjoin(HistoryBenefitsORM, HistoryBenefitsORM.user_uuid == UsersORM.uuid)
        .outerjoin(ApplicationORM, ApplicationORM.user_uuid == UsersORM.uuid)
        .where(
            ~exists(
                select(1)
                .where(ApprovedBenefitsORM.user_uuid == UsersORM.uuid)
                .correlate(UsersORM)  # Явная корреляция
            ),
            ~exists(
                select(1)
                .where(HistoryBenefitsORM.user_uuid == UsersORM.uuid)
                .correlate(UsersORM)  # Явная корреляция
            ),
            ~exists(
                select(1)
                .where(ApplicationORM.user_uuid == UsersORM.uuid)
                .correlate(UsersORM)  # Явная корреляция
            )
        )
        .subquery()
    )

    # Основной запрос для статистики
    query = select(
        # Считаем активных пользователей
        func.count(case((True == UsersORM.active, 1))).label("active_users_count"),

        # Считаем всех пользователей
        func.count(UsersORM.uuid).label("total_users_count"),

        # Считаем опубликованные бенефиты
        select(func.count(BenefitsORM.uuid))
        .where(True == BenefitsORM.is_published)
        .correlate(None)  # Указываем, что этот подзапрос независим
        .scalar_subquery()
        .label("published_benefits_count"),

        # Считаем все бенефиты
        select(func.count(BenefitsORM.uuid))
        .correlate(None)  # Указываем, что этот подзапрос независим
        .scalar_subquery()
        .label("total_benefits_count"),

        # Считаем опубликованные категории
        select(func.count(CategoryORM.id))
        .where(True == CategoryORM.is_published)
        .correlate(None)  # Указываем, что этот подзапрос независим
        .scalar_subquery()
        .label("published_categories_count"),

        # Считаем все категории
        select(func.count(CategoryORM.id))
        .correlate(None)  # Указываем, что этот подзапрос независим
        .scalar_subquery()
        .label("total_categories_count"),

        # Считаем пользователей без бенефитов
        select(func.count(no_benefits_subquery.c.uuid))
        .correlate(None)  # Указываем, что этот подзапрос независим
        .scalar_subquery()
        .label("users_with_no_benefits")
    ).select_from(UsersORM)

    # Выполнение запроса
    result = await session.execute(query)
    data = result.one()

    # Основной запрос
    query = (
        select(
            BenefitsORM.uuid.label("benefit_uuid"),  # UUID бенефита
            BenefitsORM.name.label("benefit_name"),  # Название бенефита
            func.count(ApprovedBenefitsORM.id).label("approved_count"),  # Количество одобренных записей
        )
        .join(CategoryORM, BenefitsORM.category_id == CategoryORM.id)  # Соединение с категорией
        .outerjoin(ApprovedBenefitsORM, ApprovedBenefitsORM.benefit_uuid == BenefitsORM.uuid)  # Одобренные бенефиты
        .where(
            True == BenefitsORM.is_published,  # Бенефит опубликован
            True == CategoryORM.is_published  # Категория опубликована
        )
        .group_by(BenefitsORM.uuid, BenefitsORM.name)  # Группировка по UUID и названию бенефита
        .order_by(BenefitsORM.name)  # Сортировка по названию (необязательно)
    )

    # Выполнение запроса
    result = await session.execute(query)
    data_benefits = result.fetchall()

    categories_query = (
        select(
            CategoryORM.name.label("category_name"),  # Имя категории
            func.count(BenefitsORM.uuid).label("published_benefits_count")  # Количество опубликованных льгот
        )
        .outerjoin(BenefitsORM, BenefitsORM.category_id == CategoryORM.id)
        .where(
            True == CategoryORM.is_published,  # Только опубликованные категории
            True == BenefitsORM.is_published  # Только опубликованные льготы
        )
        .group_by(CategoryORM.id, CategoryORM.name)  # Группировка по категориям
        .order_by(CategoryORM.name)  # Сортировка по имени категории (необязательно)
    )

    # Выполнение запроса для категорий
    result_categories = await session.execute(categories_query)
    data_categories = result_categories.fetchall()

    # Возвращаем результат в читаемом формате
    return {
        'users': {
            'active': data.active_users_count,
            'total': data.total_users_count,
            'no_benefits': data.users_with_no_benefits,
        },
        'benefit': {
            'is_published': data.published_benefits_count,
            'total': data.total_benefits_count,
        },
        'category': {
            'is_published': data.published_categories_count,
            'total': data.total_categories_count,
        },
        'categories': [
            {
                "name": row.category_name,
                "count": row.published_benefits_count,
            }
            for row in data_categories
        ],
        'benefits': [
            {
                "name": row.benefit_name,
                "count": row.approved_count,
            }
            for row in data_benefits
        ]
    }


async def create_history_user(benefit, user, status, session):
    try:
        ucoin = 0
        price = 0

        if status == 'Approved':
            ucoin = benefit.ucoin
            price = benefit.price

        historyUserBenefit = HistoryUserBenefits(benefit_name=benefit.name,
                                                 user_Fio=f'{user.profile.lastname}'
                                                          f' {user.profile.firstname}'
                                                          f' {user.profile.middlename
                                                          if user.profile.middlename else ""}',
                                                 status=status,
                                                 ucoin=ucoin,
                                                 price=price,
                                                 user_job_title=f'{user.profile.job_title if user.profile.job_title else ""}',
                                                 user_legal_entity=f'{user.profile.legal_entity if user.profile.legal_entity else ""}',
                                                 user_email=user.email,
                                                 )
        session.add(historyUserBenefit)
        await session.commit()
    except Exception as e:
        print(e)


async def create_history_benefit(benefit, status, session):
    try:
        historyBenefits = HistoryBenefits(benefit_name=benefit.name, status=status)
        session.add(historyBenefits)
        await session.commit()
    except Exception as e:
        print(e)


async def get_popular_benefits(async_session: AsyncSession):
    query = (
        select(
            BenefitsORM.name.label("benefit_name"),
            func.count(ApprovedBenefitsORM.id).label("active_count")
        )
        .join(ApprovedBenefitsORM.benefit)
        .where(
            (ApprovedBenefitsORM.end_date.is_(None)) |
            (ApprovedBenefitsORM.end_date >= func.current_date())
        )
        .group_by(BenefitsORM.name)
        .order_by(desc(func.count(ApprovedBenefitsORM.id)))
    )

    result = await async_session.execute(query)
    return result.all()


async def gather_statistics(start_date: date = None, end_date: date = None,
                            session: AsyncSession = Depends(get_async_session)):
    date_filter = True  # True не ограничивает запрос
    if start_date and end_date:
        date_filter = HistoryUserBenefits.create_at.between(start_date, end_date)
    elif start_date:
        date_filter = HistoryUserBenefits.create_at >= start_date
    elif end_date:
        date_filter = HistoryUserBenefits.create_at <= end_date

    query = (
        select(
            func.count().filter(HistoryUserBenefits.status == 'Pending').label('pending_count'),
            func.count().filter(HistoryUserBenefits.status == 'Approved').label('approved_count'),
            func.count().filter(HistoryUserBenefits.status == 'Denied').label('denied_count'),
            func.sum(HistoryUserBenefits.price).filter(HistoryUserBenefits.status == 'Approved').label(
                'total_company_expense'),
            func.sum(HistoryUserBenefits.ucoin).filter(HistoryUserBenefits.status == 'Approved').label(
                'total_user_expense'),
            func.count(HistoryUserBenefits.id).label('total_requests')
        )
        .where(date_filter)
    )
    total_data = (await session.execute(query)).fetchone()

    total_requests = total_data.pending_count
    approved_requests = total_data.approved_count
    denied_requests = total_data.denied_count
    total_company_expense = total_data.total_company_expense or 0.0
    total_user_expense = total_data.total_user_expense or 0.0

    benefit_popularity_query = (
        select(
            HistoryUserBenefits.benefit_name,
            func.count(
                case(
                    ('Pending' == HistoryUserBenefits.status, 1),
                    else_=None
                )
            ).label('count'),
            (func.count(
                case(
                    ('Pending' == HistoryUserBenefits.status, 1),
                    else_=None
                )
            ) * 100.0 / total_requests).label('percentage'),
            func.count(
                case(
                    ('Approved' == HistoryUserBenefits.status, 1),
                    else_=None
                )
            ).label('approved_count')
        )
        .where(date_filter)
        .group_by(HistoryUserBenefits.benefit_name)
        .order_by(desc(func.count(
            case(
                ('Pending' == HistoryUserBenefits.status, 1),
                else_=None
            )
        ) * 100.0 / total_requests))
    )

    result = (await session.execute(benefit_popularity_query))

    new = await get_popular_benefits(session)
    # Обработка данных по популярности льгот
    benefits_data = [{'name': info[0], 'pending': info[1], 'approved': info[3], 'per': f'{info[2]:.2f}'}
                     for info in result if info[1] or info[3]]

    return {
        'total_requests': total_requests,
        'approved_requests': approved_requests,
        'denied_requests': denied_requests,
        'benefit_stats': benefits_data,
        'total_company_expense': total_company_expense,
        'total_user_expense': total_user_expense,
        'current_benefits': [
            {'name': b[0],
             'approved': b[1]
             } for b in new
        ]
    }


async def get_all(stat=Depends(gather_statistics)):
    return stat


async def gather_data(start_date: date = None, end_date: date = None, session=Depends(get_async_session)):
    date_filter = True

    if start_date and end_date:
        date_filter = HistoryUserBenefits.create_at.between(start_date, end_date)
    elif start_date:
        date_filter = HistoryUserBenefits.create_at >= start_date
    elif end_date:
        date_filter = HistoryUserBenefits.create_at <= end_date

    query = select(HistoryUserBenefits).where(date_filter)
    res = (await session.execute(query)).scalars()
    return {'name': f'statistics{("_start=" + str(start_date) + '&') if start_date else ""}'
                    f'{("_end=" + str(end_date)) if end_date else ""}', 'stat': [his.to_dict() for his in res]}
