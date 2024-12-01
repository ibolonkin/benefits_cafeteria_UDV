from datetime import datetime
from typing import AsyncGenerator
from sqlalchemy import Date, func
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from src.config import settings

engine = create_async_engine(settings.DATABASE_URL(), poolclass=NullPool,)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

class Base(DeclarativeBase):
    create_at = mapped_column(Date, server_default=func.now())
    update_at = mapped_column(Date, server_default=func.now(), server_onupdate=func.now())
    delete_at: Mapped[datetime] = mapped_column(nullable=True)

    def __repr__(self) -> str:
        cols = [f"{col}={getattr(self, col)}" for col in self.__table__.columns.keys()]
        return f"<{self.__class__.__name__}: {', '.join(cols)}>"
