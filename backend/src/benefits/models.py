from sqlalchemy import func, ForeignKey, LargeBinary, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base


# # Status = ENUM("Approved", 'Denied', "Pending", name='status')
# Status = sa.Enum("Approved", 'Denied', "Pending", name='status')
class Status:
    approved = "Approved"
    denied = "Denied"
    pending = "Pending"


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
    category_id: Mapped[int] = mapped_column(ForeignKey('category.id'), nullable=True)
    category: Mapped['CategoryORM'] = relationship(back_populates='benefits', uselist=False, lazy="joined")

    user_benefits_records: Mapped[list["UserBenefits"]] = relationship(
        "UserBenefits", back_populates="benefit", lazy="select", overlaps="users"
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
    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=False, index=True)
    benefits_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('benefits.uuid'), nullable=False,
                                                index=True)

    status: Mapped[str] = mapped_column(nullable=False, server_default="Pending")

    __table_args__ = (
        CheckConstraint(
            "status IN ('Approved', 'Denied', 'Pending')",
            name="check_status"
        ),
        UniqueConstraint('user_uuid', 'benefits_uuid', name='uq_user_benefit')  # уже не уверен, что это надо
    )

    user: Mapped["UsersORM"] = relationship("UsersORM", back_populates="benefits_records", lazy="joined",
                                            overlaps="benefits")
    benefit: Mapped["BenefitsORM"] = relationship("BenefitsORM", back_populates="user_benefits_records", lazy="joined",
                                                  overlaps="users")


class Image(Base):
    __tablename__ = 'image'
    id: Mapped[int] = mapped_column(primary_key=True)
    data = mapped_column(LargeBinary)
