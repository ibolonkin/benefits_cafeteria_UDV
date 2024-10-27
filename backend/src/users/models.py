from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base

TOKEN_TYPE_FIELD = "type"
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


class UsersORM(Base):
    __tablename__ = 'users'
    uuid = mapped_column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, index=True,
                         primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hash_password: Mapped[str]
    active: Mapped[bool] = mapped_column(server_default='True')
    super_user: Mapped[bool] = mapped_column(server_default='False')
    ucoin: Mapped[int] = mapped_column(nullable=False, server_default='0')
    adap_period: Mapped[bool] = mapped_column(nullable=False, server_default='False')
    profile: Mapped["UserProfilesORM"] = relationship(back_populates="user", lazy="joined")

    # Добавлено overlaps для устранения предупреждений
    benefits_records: Mapped[list["UserBenefits"]] = relationship(
        "UserBenefits", back_populates="user", lazy="select", overlaps="benefits"
    )


class UserProfilesORM(Base):
    __tablename__ = 'user_profiles'
    user_uuid = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), unique=True, nullable=False, index=True,
                              primary_key=True)
    lastname: Mapped[str]
    firstname: Mapped[str]
    middlename: Mapped[str] = mapped_column(nullable=True)
    legal_entity: Mapped[str] = mapped_column(nullable=True)
    job_title: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["UsersORM"] = relationship(
        back_populates="profile",
        lazy="joined",
        uselist=False
    )
