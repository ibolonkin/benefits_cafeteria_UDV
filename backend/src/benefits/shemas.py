from pydantic import BaseModel, Field, UUID4

from src.users.shemas import User

STRING = r'\S.+|\S'

class CategoryName(BaseModel):
    name: str = Field(pattern=STRING, min_length=1, example='string')

class Category(CategoryName):
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
    is_published: bool


class BenefitsUser(BaseModel):
    uuid: UUID4
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    ucoin: int = Field(0, ge=0)
    main_photo: int | None = Field(..., ge=0)
    category: Category | None
    status: str = 'Approved'

class Benefit(BaseModel):
    uuid: UUID4
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    description: str = Field(pattern=STRING, example='string', min_length=1)
    experience_month: int = Field(0, ge=0)
    ucoin: int = Field(0, ge=0)
    adap_period: bool = False
    duration_in_days: int | None = Field(None, ge=0)
    main_photo: int | None = Field(..., ge=0)
    category: Category | None

class BenefitAdmin(Benefit):
    is_published: bool

class BenefitsAvailable(BenefitsUser):
    available: bool

class BenefitAvailable(Benefit):
    available: bool

class Application(BaseModel):
    user: User
    benefit: Benefit
    status: str = "Pending"
    msg: str | None = None