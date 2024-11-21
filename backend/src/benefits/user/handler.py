from datetime import date

from dateutil.relativedelta import relativedelta
from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.base import get_async_session
from src.benefits.handler import get_benefit
from src.benefits.models import BenefitsORM, ApplicationORM, ApprovedBenefitsORM
from src.handler import get_active_user


async def choice_benefit_db(userOrm=Depends(get_active_user),
                            benefit: BenefitsORM = Depends(get_benefit),
                            session: AsyncSession = Depends(get_async_session)):
    if not benefit.is_published or not benefit.category.is_published:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Бенефит не доступен для выбора')

    today = date.today()
    difference = relativedelta(today, userOrm.create_at)
    experience_month = difference.years * 12 + difference.months

    if benefit.experience_month > experience_month:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Не хватает стажа')

    if benefit.adap_period > userOrm.adap_period:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Не пройден адаптивный период')

    uCoin: bool

    if userOrm.ucoin < benefit.ucoin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Не хватает койнов')

    elif benefit.ucoin >= 0:
        uCoin = True
    else:
        uCoin = False

    await session.refresh(userOrm, attribute_names=['applications', 'approved_benefits', 'history'])
    if not userOrm.can_application(benefit.uuid):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail='Ты уже отправил заявку либо тебе ещё нельзя отправить заявку')

    try:
        userBenefit = ApplicationORM(user_uuid=userOrm.uuid, benefit_uuid=benefit.uuid)
        session.add(userBenefit)

        await session.flush()
        query = select(ApplicationORM).where(userBenefit.id == ApplicationORM.id)
        userBenefit = (await session.execute(query)).scalar()
        if uCoin:
            userOrm.ucoin -= benefit.ucoin
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Вы уже подали заявку')
    await session.commit()
    return userBenefit


async def get_all_benefit(
        userOrm=Depends(get_active_user),
        session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(BenefitsORM)

        benefits = [b for b in (await session.execute(query)).unique().scalars()]
        query = select(ApplicationORM).where(userOrm.uuid == ApplicationORM.user_uuid)
        applicationBenefits = [b for b in (await session.execute(query)).unique().scalars()]
        query = select(ApprovedBenefitsORM).where(userOrm.uuid == ApprovedBenefitsORM.user_uuid)
        approvedBenefits = [b for b in (await session.execute(query)).unique().scalars()]
        userBenefits = [b for b in applicationBenefits] + [b for b in approvedBenefits]

    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    status_benefit = {b.benefit_uuid for b in userBenefits}

    today = date.today()
    difference = relativedelta(today, userOrm.create_at)
    experience_month = difference.years * 12 + difference.months

    for b in benefits:
        if (b.experience_month > experience_month
                or userOrm.adap_period < b.adap_period
                or b.ucoin > userOrm.ucoin
                or b.uuid in status_benefit):
            b.available = False
        else:
            b.available = True

    return [b for b in benefits if b.is_published and b.category.is_published]


async def get_benefit_available(benefit=Depends(get_benefit), userOrm=Depends(get_active_user),
                                session=Depends(get_async_session)):
    try:
        query = select(ApplicationORM).where(userOrm.uuid == ApplicationORM.user_uuid)
        userBenefits = (await session.execute(query)).unique().scalars()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    if any(benefit.uuid == b.benefit_uuid for b in userBenefits):
        benefit.available = False
        return benefit

    today = date.today()
    difference = relativedelta(today, userOrm.create_at)
    experience_month = difference.years * 12 + difference.months

    if (benefit.experience_month > experience_month
            or userOrm.adap_period < benefit.adap_period
            or benefit.ucoin > userOrm.ucoin):
        benefit.available = False
        return benefit
    else:
        benefit.available = True
        return benefit
