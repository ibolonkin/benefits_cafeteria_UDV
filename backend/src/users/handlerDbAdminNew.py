from datetime import date

from fastapi import Depends, HTTPException, status
from sqlalchemy import select, and_

from src.base import get_async_session
from src.benefits.handlerDB import get_benefit
from src.benefits.models import UserBenefits
from src.users.handlerDB import get_user_uuid
from src.users.shemas import AnswerStatus


async def update_application_db(new_status: AnswerStatus, user=Depends(get_user_uuid),
                                benefit=Depends(get_benefit), session=Depends(get_async_session)):
    if not new_status.status:
        try:
            query = select(UserBenefits).where(
                and_(UserBenefits.user_uuid == user.uuid,
                     benefit.uuid == UserBenefits.benefits_uuid), )
            user_benefit = (await session.execute(query)).scalar()
            await session.delete(user_benefit)
            await session.commit()
        finally:
            raise HTTPException(status_code=status.HTTP_200_OK, detail='ok')

    try:
        query = select(UserBenefits).where(
            and_(UserBenefits.user_uuid == user.uuid,
                 benefit.uuid == UserBenefits.benefits_uuid), )
        user_benefit = (await session.execute(query)).scalar()

        user_benefit.status = new_status.status
        user_benefit.update_at = date.today()
    except:
        user_benefit = UserBenefits(user_uuid=user.uuid, benefits_uuid=benefit.uuid, status=new_status.status)
        session.add(user_benefit)
        await session.flush()
        query = select(UserBenefits).where(
            and_(UserBenefits.user_uuid == user.uuid,
                 benefit.uuid == UserBenefits.benefits_uuid), )
        user_benefit = (await session.execute(query)).scalar()

    await session.commit()
    return user_benefit
    pass
