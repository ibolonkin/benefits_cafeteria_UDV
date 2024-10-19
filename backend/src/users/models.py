from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base
from ..benefits.models import BenefitsORM, UserBenefits

TOKEN_TYPE_FIELD = "type"
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"

class UsersORM(Base):
    __tablename__ = 'users'
    uuid = mapped_column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, index=True,
                         primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True, )
    hash_password: Mapped[str]
    active: Mapped[bool] = mapped_column(server_default='True')
    super_user: Mapped[bool] = mapped_column(server_default='False')

    profile: Mapped["UserProfilesORM"] = relationship(
        back_populates="user",
        lazy="joined"
    )

    benefits: Mapped[list["BenefitsORM"]] = relationship(
        secondary="user_benefits",
        back_populates="users",
        lazy="select"
    )


class UserProfilesORM(Base):
    __tablename__ = 'user_profiles'
    user_uuid = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), unique=True, nullable=False, index=True,
                              primary_key=True)
    lastname: Mapped[str]
    firstname: Mapped[str]
    middlename: Mapped[str]

    user: Mapped["UsersORM"] = relationship(
        back_populates="profile",
        lazy="joined",
        uselist=False
    )
