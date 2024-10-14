from sqlalchemy import func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..base import Base


class BenefitsORM(Base):
    __tablename__ = 'benefits'
    uuid = mapped_column(UUID(as_uuid=True), server_default=func.gen_random_uuid(), nullable=False, index=True,
                         unique=True, primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    text: Mapped[str] = mapped_column(nullable=False)

    users: Mapped[list["UsersORM"]] = relationship(
        secondary="user_benefits",
        back_populates="benefits",
        lazy="joined"
    )

class UserBenefits(Base):
    __tablename__ = 'user_benefits'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_uuid = mapped_column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=False, index=True)
    benefits_uuid = mapped_column(UUID(as_uuid=True), ForeignKey('benefits.uuid'), nullable=False,
                                  index=True)

