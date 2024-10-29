from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, UUID4
from src.users.shemas import User

STRING = r'\S.+|\S'


class CategoryCreate(BaseModel):
    name: str = Field(pattern=STRING, min_length=1, example='string')


class Category(CategoryCreate):
    id: int
    photo: int | None = Field(..., ge=0)


class BenefitCreate(BaseModel):
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    description: str = Field(pattern=STRING, example='string', min_length=1)
    category_id: int = Field(..., ge=0)
    experience_month: int = Field(0, ge=0)
    ucoin: int = Field(0, ge=0)
    adap_period: bool


class BenefitUpdate(BaseModel):
    name: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    description: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    ucoin: int | None = Field(0, ge=0)
    category_id: int | None = Field(None, ge=0)
    experience_month: int | None = Field(0, ge=0)
    adap_period: bool | None = Field(None)


class Benefit(BenefitCreate):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)
   # background_photo: int | None = Field(..., ge=0)


class BenefitCategory(Benefit):
    category: Category | None
    category_id: int | None


class BenefitStatus(BenefitCategory):
    status: Literal["Pending", "Denied", "Approved"] | None
    available: bool


# class CategoryBenefit(Category):
#     benefits: List[BenefitCreate]

class AllBenefit(BaseModel):
    available: list[BenefitStatus]
    unavailable: list[BenefitStatus]


class UserBenefit(BaseModel):
    user_uuid: UUID4
    benefits_uuid: UUID4
    status: Literal["Pending", "Denied", "Approved"] | None
    user: User
    benefit: BenefitCategory
    create_at: date


class UpdateCategory(BaseModel):
    name: str | None = Field(None, pattern=STRING, min_length=3, max_length=255, example='string')
