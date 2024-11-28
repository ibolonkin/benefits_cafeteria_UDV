from datetime import date
from pydantic import BaseModel, Field, UUID4
from typing import Literal

from src.benefits.shemas import STRING, Category, Benefit
from src.users.shemas import UserApplication, User


class BenefitUpdate(BaseModel):
    name: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    description: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    ucoin: int | None = Field(0, ge=0)
    category_id: int | None = Field(None, ge=0)
    experience_month: int | None = Field(0, ge=0)
    adap_period: bool | None = Field(None)
    duration_in_days: int | None = Field(None, ge=0)
    is_published: bool | None = Field(None)
    price: int | None = Field(0, ge=0)


class UpdateCategory(BaseModel):
    name: str | None = Field(None, pattern=STRING, min_length=3, max_length=255, example='string')
    is_published: bool | None = Field(None)


class BenefitsAdmin(BaseModel):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    category: Category | None
    experience_month: int = Field(0, ge=0)
    is_published: bool


class BenefitsAdminResponse(BaseModel):
    benefits: list[BenefitsAdmin]
    len: int = Field(..., ge=0)


class BenefitInApplications(BaseModel):
    name: str
    category: Category | None


class Application(BaseModel):
    id: int
    user: UserApplication
    benefit: BenefitInApplications
    create_at: date
    status: str
    msg: str | None = None


class ApplicationGet(Application):
    user: User
    benefit: Benefit
    status: str = "Approved"


class BenefitInApplication(BenefitInApplications):
    uuid: UUID4
    experience_month: int = Field(0, ge=0)
    adap_period: bool = False
    ucoin: int = Field(0, ge=0)


class Applications(BaseModel):
    applications: list[Application]
    len: int


class CategoryCreate(BaseModel):
    name: str = Field(pattern=STRING, min_length=1, example='string')
    is_published: bool


class AnswerStatus(BaseModel):
    status: Literal['Approved', 'Denied']
    msg: str | None = None

class BenefitsAdminAll(BaseModel):
    benefits: list[BenefitsAdmin]
    len: int