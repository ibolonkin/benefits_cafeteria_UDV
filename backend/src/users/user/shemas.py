from datetime import date
from typing import Literal
from pydantic import BaseModel, Field

from src.benefits.shemas import Category
from src.users.shemas import UserProfileName, UserProfileLastName

STRING = r'\S.+|\S'

class UCoin(BaseModel):
    ucoin: int = Field(0, ge=0)

class Check(UserProfileName, UserProfileLastName):
    super_user: bool

class BenefitsUser(BaseModel):
    name: str = Field(pattern=STRING, example='string', min_length=1, max_length=255)
    category: Category | None
    create_at: date
    update_at: date
    end_date: date | None = None
    status: Literal['Pending', 'Approved', 'Denied', 'Terminated']
    msg: str | None = None