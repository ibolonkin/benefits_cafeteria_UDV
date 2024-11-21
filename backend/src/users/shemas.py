from datetime import date
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
from src.utils import UserInfo
from src.benefits.shemas import BenefitStatusUser

ONLY_LETTERS_ONE_WORD = r'^[a-zA-ZА-Яа-я]+$'
STRING = r'^.+[^ ]+.*$'
ONLY_ONE_WORD = r'^[^\s]+$'


class UserNameSurname(BaseModel):
    firstname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)
    lastname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('firstname', 'lastname')
    @classmethod
    def title_fields(cls, value):
        if value:
            return value.lower().title()


class UserProfileFIO(UserNameSurname):
    middlename: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('middlename')
    @classmethod
    def title_fields_middlename(cls, value):
        if value:
            return value.lower().title()


class UserProfile(UserProfileFIO):
    legal_entity: str | None = Field(None, pattern=STRING, example='string', max_length=100)
    job_title: str | None = Field(None, pattern=STRING, example='string', max_length=100)

    @field_validator('job_title', 'legal_entity')
    @classmethod
    def title_fields_job_title(cls, value):
        if value:
            return value.lower().title()


class User(UserInfo):
    create_at: date
    email: EmailStr
    ucoin: int
    adap_period: bool
    profile: UserProfile


class UserWithbenefit(User):
    benefits: list[BenefitStatusUser]