from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, UUID4
from ..benefits.shemas import BenefitStatusUser

ONLY_LETTERS_ONE_WORD = r'^[a-zA-ZА-Яа-я]+$'
STRING = r'^.+[^ ]+.*$'
ONLY_ONE_WORD = r'^[^\s]+$'


class Token(BaseModel):
    token_type: str = 'Bearer'
    accessToken: str


class UserInfo(BaseModel):
    uuid: UUID4
    active: bool
    super_user: bool


class UserNameSurName(BaseModel):
    firstname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)
    lastname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('firstname', 'lastname')
    @classmethod
    def capitalize_fields(cls, value):
        if value:
            return value.lower().capitalize()


class UserProfileForAll(UserNameSurName):
    job_title: str | None = Field(None, pattern=STRING, example='string', max_length=100)

    @field_validator('job_title')
    @classmethod
    def capitalize_fields_job_title(cls, value):
        if value:
            return value.lower().capitalize()


class UserProfile(UserNameSurName):
    middlename: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('middlename')
    @classmethod
    def capitalize_fields_middlename(cls, value):
        if value:
            return value.lower().capitalize()


class UserProfileFull(UserProfile, UserProfileForAll):
    legal_entity: str | None = Field(None, pattern=STRING, example='string', max_length=100)


class UserAuthorization(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=15, example='<password>', pattern=ONLY_ONE_WORD)


class UserRegister(UserProfile, UserAuthorization):
    pass


class User(UserInfo):
    create_at: date
    email: EmailStr
    ucoin: int
    adap_period: bool
    profile: UserProfileFull


class UserAll(BaseModel):
    uuid: UUID4
    email: EmailStr
    profile: UserProfileForAll
    create_at: date


class ProfileUpdate(BaseModel):
    firstname: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)
    lastname: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)
    middlename: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)
    job_title: str | None = Field(None, pattern=STRING, example='string', min_length=1, max_length=100)
    legal_entity: str | None = Field(None, pattern=STRING, example='string', min_length=1, max_length=100)


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    create_at: date | None = None
    profile: ProfileUpdate | None = None
    active: bool | None = None
    super_user: bool | None = None
    ucoin: int | None = Field(0, ge=0)
    adap_period: bool | None = None

    @field_validator('create_at')
    @classmethod
    def date_cannot_be_in_future(cls, v):
        if v is not None and v > date.today():
            raise ValueError("Дата не может быть больше сегодняшней")
        return v


class MyCoin(BaseModel):
    ucoin: int = Field(0, ge=0)


class GetAllUsers(BaseModel):
    users: list[UserAll]
    len: int


class UserWithbenefit(User):
    benefits: list[BenefitStatusUser]


class AnswerStatus(BaseModel):
    status: Literal["Denied", "Approved", "Pending"] | None


class Check(UserNameSurName):
    super_user: bool
