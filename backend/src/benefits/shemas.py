from pydantic import BaseModel, Field, UUID4

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


class Benefit(BenefitCreate):
    uuid: UUID4
    main_photo: int | None = Field(..., ge=0)
    background_photo: int | None = Field(..., ge=0)

class BenefitCategory(Benefit):
    category: Category




# class CategoryBenefit(Category):
#     benefits: List[BenefitCreate]
