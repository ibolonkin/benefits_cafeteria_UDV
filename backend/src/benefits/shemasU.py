from datetime import date
from typing import Literal

from pydantic import BaseModel, UUID4

from src.benefits.shemas import BenefitCategory, Category
from src.users.shemas import User, UserAll

class BenefitApplication(BaseModel):
    name: str
    category: Category

class ApplicationStatus(BaseModel):
    status: Literal["Denied", "Approved"]

class Application(BaseModel):
    id: int
    user: UserAll
    benefit: BenefitApplication
    create_at: date

class UserBenefitPending(BaseModel):
    id: int
    user_uuid: UUID4
    benefits_uuid: UUID4
    status: Literal["Pending"]
    user: User
    benefit: BenefitCategory
    create_at: date

class UserBenefit(UserBenefitPending):
    status: Literal["Pending", "Denied", "Approved"] | None
    update_at: date