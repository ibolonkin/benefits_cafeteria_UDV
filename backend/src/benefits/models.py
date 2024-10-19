from sqlalchemy import func, ForeignKey, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base

# TODO: Добавить статус в  таблице между льготами и пользователем, какая находиться в ожидании, какая отказана и какая
#  принята.


class BenefitsORM(Base):
    __tablename__ = 'benefits'
    uuid = mapped_column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, index=True,
                         unique=True, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    background_photo: Mapped[int] = mapped_column(ForeignKey('image.id'), nullable=True)
    main_photo: Mapped[int] = mapped_column(ForeignKey('image.id'), nullable=True)
    price: Mapped[int] = mapped_column(nullable=False)
    experience_month: Mapped[int] = mapped_column(nullable=False)
    ucoin: Mapped[bool] = mapped_column(nullable=False)

    category_id: Mapped[int] = mapped_column(ForeignKey('category.id'), nullable=False)

    category: Mapped['CategoryORM'] = relationship(back_populates='benefits', uselist=False, lazy="joined")

    users: Mapped[list["UsersORM"]] = relationship(
        secondary="user_benefits",
        back_populates="benefits",
        lazy="select"
    )


class CategoryORM(Base):
    __tablename__ = 'category'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)

    benefits: Mapped[list["BenefitsORM"]] = relationship(
        lazy="joined"
    )


class UserBenefits(Base):
    __tablename__ = 'user_benefits'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_uuid = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=False, index=True)
    benefits_uuid = mapped_column(UUID(as_uuid=True), ForeignKey('benefits.uuid'), nullable=False,
                                  index=True)
    # status через enum

class Image(Base):
    __tablename__ = 'image'
    id: Mapped[int] = mapped_column(primary_key=True)
    data = mapped_column(LargeBinary)
