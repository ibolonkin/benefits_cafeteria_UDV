from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func, ForeignKey, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base
from datetime import date, datetime
import copy

class UserImages(Base):
    __tablename__ = 'user_images'

    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'),
                                            primary_key=True, unique=True, index=True)
    data = mapped_column(LargeBinary)

class UserCodes(Base):
    __tablename__ = 'user_codes'

    user_uuid: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'),
                                            primary_key=True, unique=True, index=True)

    verification_code: Mapped[str] = mapped_column(nullable=True)
    verification_code_expiration: Mapped[datetime] = mapped_column(nullable=True)

    reset_code: Mapped[str] = mapped_column(nullable=True)
    reset_code_expiration: Mapped[datetime] = mapped_column(nullable=True)

    time_change_password: Mapped[datetime] = mapped_column(nullable=True)

    user: Mapped["UsersORM"] = relationship(
        back_populates="userCodes", lazy="joined", uselist=False, cascade="all, delete"
    )


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

    is_verified: Mapped[bool] = mapped_column(server_default='False')
    date_when_change_password: Mapped[date] = mapped_column(nullable=True, server_default=func.now())

    userCodes: Mapped[UserCodes] = relationship(
        back_populates="user", lazy="select", uselist=False, cascade="all, delete"
    )

    profile: Mapped["UserProfilesORM"] = relationship(
        back_populates="user", lazy="joined", uselist=False, cascade="all, delete"
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

    def can_application(self, benefit_uuid_get):
        if benefit_uuid_get in [b.benefit_uuid for b in self.approved_benefits]:
            return False
        if benefit_uuid_get in [b.benefit_uuid for b in self.applications]:
            return False
        history_benefit_uuid = sorted([b for b in self.history if b.benefit_uuid == benefit_uuid_get],
                                      key=lambda x: x.update_at, reverse=True)
        today = date.today()
        for b in history_benefit_uuid:
            if b.status == 'Terminated':
                continue
            if b.status == 'Denied' and (today - b.update_at).days <= 7:
                return False
        return True

    @property
    def benefits(self):

        key_dict = {
            "Approved": 1,
            "Denied": 3,
            "Terminated": 4,
            "Pending": 2,
        }

        benefits = [copy.deepcopy(record.benefit) for record in self.applications]
        benefitsApproved = [copy.deepcopy(record.benefit) for record in self.approved_benefits]
        benefitHistory = [copy.deepcopy(record.benefit) for record in self.history]

        for i in range(len(benefitHistory)):
            benefitHistory[i].status = self.history[i].status
            benefitHistory[i].msg = self.history[i].msg

        for i in range(len(benefitsApproved)):
            benefitsApproved[i].status = 'Approved'
            benefitsApproved[i].msg = None

        for i in range(len(benefits)):
            benefits[i].status = self.applications[i].status
            benefits[i].update_at = self.applications[i].status
            benefits[i].create_at = self.applications[i].status
            benefits[i].msg = None

        return sorted(benefits + benefitsApproved + benefitHistory, key=lambda x: key_dict[x.status])


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

