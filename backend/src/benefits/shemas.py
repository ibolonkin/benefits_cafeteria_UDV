from typing import Literal

from pydantic import BaseModel, Field, UUID4

from src.users.shemas import User


class CategoryCreate(BaseModel):
    name: str


class Category(CategoryCreate):
    id: int


class BenefitCreate(BaseModel):
    name: str
    description: str
    price: int = Field(0, ge=0)
    category_id: int = Field(..., ge=0)
    experience_month: int = Field(0, ge=0)
    ucoin: bool = False


class BenefitUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: int | None = Field(0, ge=0)
    category_id: int | None = Field(None, ge=0)
    experience_month: int | None = Field(0, ge=0)
    ucoin: bool | None = None


class Benefit(BenefitCreate):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)
    background_photo: int | None = Field(..., ge=0)


class BenefitCategory(Benefit):
    category: Category | None
    category_id: int | None


class BenefitStatus(BenefitCategory):
    status: Literal["Pending", "Denied", "Approved"] | None
# class CategoryBenefit(Category):
#     benefits: List[BenefitCreate]

class AllBenefit(BaseModel):
    available:  list[BenefitStatus]
    unavailable: list[BenefitStatus]

class UserBenefit(BaseModel):
    user_uuid: UUID4
    benefits_uuid: UUID4
    status: Literal["Pending", "Denied", "Approved"] | None
    user: User
    benefit: BenefitCategory