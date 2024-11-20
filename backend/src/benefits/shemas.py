from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, UUID4

STRING = r'\S.+|\S'


class CategoryCreate(BaseModel):
    name: str = Field(pattern=STRING, min_length=1, example='string')


class Category(CategoryCreate):
    id: int
    photo: int | None = Field(..., ge=0)


class CategoryAdmin(Category):
    is_published: bool


class BenefitCreate(BaseModel):
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    description: str = Field(pattern=STRING, example='string', min_length=1)
    category_id: int | None = Field(None, ge=0)
    experience_month: int = Field(0, ge=0)
    ucoin: int = Field(0, ge=0)
    adap_period: bool = False
    duration_in_days: int | None = Field(None, ge=0)


class BenefitGet(BaseModel):
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    ucoin: int = Field(0, ge=0)


class BenefitGetU(BenefitGet):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)
    category: Category | None


class Benefit(BenefitCreate):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)


class BenefitCategory(Benefit):
    category: Category | None
    # category_id: int | None


class BenefitStatus(BenefitCategory):
    status: Literal["Pending", "Denied", "Approved"] | None


class BenefitStatusUser(BenefitStatus):
    create_at: date
    update_at: date


class BenefitAvailableFull(BenefitCategory):
    available: bool


class BenefitAvailable(BenefitGetU):
    available: bool
