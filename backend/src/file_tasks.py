import hashlib
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.benefits.models import ApprovedBenefitsORM, HistoryBenefitsORM
from src.users.models import UsersORM, UserProfilesORM
from src.config import settings

async def process_expired_benefits(session: AsyncSession):
    today = date.today()
    query = select(ApprovedBenefitsORM).where(ApprovedBenefitsORM.end_date < today)
    expired_benefits = (await session.execute(query)).unique().scalars()

    for application in expired_benefits:
        history_record = HistoryBenefitsORM(
            user_uuid=application.user_uuid,
            benefit_uuid=application.benefit_uuid,
            status="Terminated"
        )
        session.add(history_record)

        await session.delete(application)

    await session.commit()

async def create_super_user(session: AsyncSession):
    query = select(UsersORM).where(settings.email == UsersORM.email)
    user = (await session.execute(query)).scalar()
    if not user:
        hash_password = hashlib.sha256(settings.password.encode('utf-8')).hexdigest()
        user = UsersORM(email=settings.email, hash_password=hash_password)
        session.add(user)
        await session.flush()
        userProfile = UserProfilesORM(user_uuid=user.uuid,
                                      firstname=settings.firstname,
                                      lastname=settings.lastname,
                                      middlename=settings.middlename,
                                      )
        session.add(userProfile)

    user.super_user = True
    user.ucoin = 9999

    await session.commit()