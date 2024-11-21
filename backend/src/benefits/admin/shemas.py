from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, UUID4

from src.benefits.shemas import STRING, Category
from src.users.admin.shemas import UserAll
from src.users.shemas import User


class BenefitUpdate(BaseModel):
    name: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    description: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    ucoin: int | None = Field(0, ge=0)
    category_id: int | None = Field(None, ge=0)
    experience_month: int | None = Field(0, ge=0)
    adap_period: bool | None = Field(None)
    duration_in_days: int | None = Field(None, ge=0)
    is_published: bool | None = Field(None)

class UpdateCategory(BaseModel):
    name: str | None = Field(None, pattern=STRING, min_length=3, max_length=255, example='string')
    is_published: bool | None = Field(None)


class BenefitsAdmin(BaseModel):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    category: Category | None
    experience_month: int = Field(0, ge=0)

class ResponseBenefitsAdmin(BaseModel):
    benefits: list[BenefitsAdmin]
    len: int = Field(..., ge=0)


class BenefitApplication(BaseModel):
    name: str
    category: Category

class ApplicationStatus(BaseModel):
    status: Literal["Denied", "Approved"]

class AnswerStatus(BaseModel):
    status: Literal["Denied", "Approved", "Pending"] | None

class Application(BaseModel):
    id: int
    user: UserAll
    benefit: BenefitApplication
    create_at: date

class BenefitApp(BenefitApplication):
    uuid: UUID4
    category: Category | None
    experience_month: int = Field(0, ge=0)
    adap_period: bool = False
    ucoin: int = Field(0, ge=0)


class UserBenefitPending(BaseModel):
    id: int
    user: User
    benefit: BenefitApp
    create_at: date

class UserBenefit(UserBenefitPending, AnswerStatus):
    update_at: date

class ApplicationAll(BaseModel):
    applications: list[Application]
    len: int