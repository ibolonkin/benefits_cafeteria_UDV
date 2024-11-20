from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base


class UsersORM(Base):
    __tablename__ = 'users'
    uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), server_default=func.gen_random_uuid(),
                                       nullable=False, index=True, primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hash_password: Mapped[str]
    active: Mapped[bool] = mapped_column(server_default='True')
    super_user: Mapped[bool] = mapped_column(server_default='False')
    ucoin: Mapped[int] = mapped_column(nullable=False, server_default='0')
    adap_period: Mapped[bool] = mapped_column(nullable=False, server_default='False')

    profile: Mapped["UserProfilesORM"] = relationship(
        back_populates="user", lazy="joined", uselist=False
    )
    applications: Mapped[list["ApplicationORM"]] = relationship(
        back_populates="user", cascade="all, delete", lazy="select"
    )
    approved_benefits: Mapped[list["ApprovedBenefitsORM"]] = relationship(
        back_populates="user", cascade="all, delete", lazy="select"
    )
    history: Mapped[list["HistoryBenefitsORM"]] = relationship(
        back_populates="user", cascade="all, delete", lazy="select"
    )

    @property
    def benefits(self):
        benefits = [record.benefit for record in self.applications]
        benefitsApproved = [record.benefit for record in self.approved_benefits]
        for i in range(len(benefits)):
            benefits[i].status = self.applications[i].status
            benefits[i].update_at = self.applications[i].update_at
            benefits[i].create_at = self.applications[i].create_at
        return benefits + benefitsApproved


class UserProfilesORM(Base):
    __tablename__ = 'user_profiles'
    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'),
                                            primary_key=True, unique=True, index=True)
    lastname: Mapped[str]
    firstname: Mapped[str]
    middlename: Mapped[str] = mapped_column(nullable=True)
    legal_entity: Mapped[str] = mapped_column(nullable=True)
    job_title: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["UsersORM"] = relationship(back_populates="profile", lazy="joined")