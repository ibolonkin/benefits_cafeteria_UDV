from datetime import date

from sqlalchemy import func, ForeignKey, LargeBinary, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base


class Status:
    approved = "Approved"
    denied = "Denied"
    pending = "Pending"
    terminated = 'Terminated'


class BenefitsORM(Base):
    __tablename__ = 'benefits'
    uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), server_default=func.gen_random_uuid(),
                                       nullable=False, index=True, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    main_photo: Mapped[int] = mapped_column(ForeignKey('image.id'), nullable=True)
    ucoin: Mapped[int] = mapped_column(nullable=False)
    experience_month: Mapped[int] = mapped_column(nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey('category.id'), nullable=True)
    duration_in_days: Mapped[int] = mapped_column(nullable=True)
    adap_period: Mapped[bool] = mapped_column(nullable=False, server_default='True')
    is_published: Mapped[bool] = mapped_column(nullable=False, server_default='False')

    category: Mapped["CategoryORM"] = relationship(back_populates="benefits", lazy="joined")

    applications: Mapped[list["ApplicationORM"]] = relationship(
        back_populates="benefit", cascade="all, delete", lazy="select"
    )

    approved_benefits: Mapped[list["ApprovedBenefitsORM"]] = relationship(
        back_populates="benefit", cascade="all, delete", lazy="select"
    )

    history: Mapped[list["HistoryBenefitsORM"]] = relationship(
        back_populates="benefit", cascade="all, delete", lazy="select"
    )


class CategoryORM(Base):
    __tablename__ = 'category'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    photo: Mapped[int] = mapped_column(ForeignKey('image.id'), nullable=True)
    is_published: Mapped[bool] = mapped_column(nullable=False, server_default='False')
    benefits: Mapped[list["BenefitsORM"]] = relationship(
        lazy="joined"
    )


class ApplicationORM(Base):
    __tablename__ = 'application'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=False, index=True)
    benefit_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('benefits.uuid'), nullable=False, index=True)
    status: Mapped[str] = mapped_column(nullable=False, server_default="Pending")

    __table_args__ = (
        CheckConstraint("status IN ('Approved', 'Denied', 'Pending')", name="check_status"),
        UniqueConstraint('user_uuid', 'benefit_uuid', name='uc_user_benefit')
    )

    user: Mapped["UsersORM"] = relationship(back_populates="applications", lazy="joined")
    benefit: Mapped["BenefitsORM"] = relationship(back_populates="applications", lazy="joined")

class ApprovedBenefitsORM(Base):
    __tablename__ = 'approved_benefits'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=False, index=True)
    benefit_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('benefits.uuid'), nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(nullable=True)

    user: Mapped["UsersORM"] = relationship(back_populates="approved_benefits", lazy="select")
    benefit: Mapped["BenefitsORM"] = relationship(back_populates="approved_benefits", lazy="joined")

class HistoryBenefitsORM(Base):
    __tablename__ = 'history_benefits'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=False, index=True)
    benefit_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('benefits.uuid'), nullable=False,
                                               index=True)
    status: Mapped[str] = mapped_column(nullable=False, server_default="Terminated")
    msg: Mapped[str] = mapped_column(nullable=True)
    __table_args__ = (
        CheckConstraint("status IN ( 'Denied', 'Terminated')", name="check_status_history"),
    )

    user: Mapped["UsersORM"] = relationship(back_populates="history", lazy="select")
    benefit: Mapped["BenefitsORM"] = relationship(back_populates="history", lazy="joined")


class Image(Base):
    __tablename__ = 'image'
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    data = mapped_column(LargeBinary)
