from datetime import date
from pydantic import BaseModel, EmailStr, Field, field_validator, UUID4

ONLY_LETTERS = r'^[a-zA-ZА-Яа-я]+$'

class Token(BaseModel):
    token_type: str = 'Bearer'
    accessToken: str

class UserInfoMin(BaseModel):
    uuid: UUID4
    active: bool
    super_user: bool

class UserInfo(UserInfoMin):
    experience_month: int


class UserNameSurName(BaseModel):
    firstname: str = Field(pattern=ONLY_LETTERS, example='string')
    lastname: str = Field(pattern=ONLY_LETTERS, example='string')


class UserProfile(UserNameSurName):
    middlename: str = Field(pattern=ONLY_LETTERS, example='string')

    @field_validator('firstname', 'lastname', 'middlename')
    @classmethod
    def capitalize_fields(cls, value):
        if value:
            return value.lower().capitalize()


class UserAuthorization(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=15, example='<password>')


class UserRegister(UserProfile, UserAuthorization):
    pass


class User(UserInfoMin):
    create_at: date
    email: EmailStr
    profile: UserProfile


class UserAll(BaseModel):
    uuid: UUID4
    email: EmailStr
    profile: UserNameSurName
    create_at: date


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    create_at: date | None = None
    firstname: str | None = None
    lastname: str | None = None
    middlename: str | None = None
    active: bool | None = None
    super_user: bool | None = None
