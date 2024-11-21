from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.benefits.models import ApprovedBenefitsORM, HistoryBenefitsORM


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
