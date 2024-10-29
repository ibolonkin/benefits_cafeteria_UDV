from datetime import date
from pydantic import BaseModel, EmailStr, Field, field_validator, UUID4

ONLY_LETTERS_ONE_WORD = r'^[a-zA-ZА-Яа-я]+$'
STRING = r'^.+[^ ]+.*$'


class Token(BaseModel):
    token_type: str = 'Bearer'
    accessToken: str


class UserInfo(BaseModel):
    uuid: UUID4
    active: bool
    super_user: bool


class UserNameSurName(BaseModel):
    firstname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string')
    lastname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string')

    @field_validator('firstname', 'lastname')
    @classmethod
    def capitalize_fields(cls, value):
        if value:
            return value.lower().capitalize()


class UserProfileForAll(UserNameSurName):
    job_title: str | None = Field(None, pattern=STRING, example='string')

    @field_validator('job_title')
    @classmethod
    def capitalize_fields(cls, value):
        if value:
            return value.lower().capitalize()


class UserProfile(UserNameSurName):
    middlename: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string')

    @field_validator('middlename')
    @classmethod
    def capitalize_fields(cls, value):
        if value:
            return value.lower().capitalize()


class UserProfileFull(UserProfile, UserProfileForAll):
    legal_entity: str | None = Field(None, pattern=STRING, example='string')


class UserAuthorization(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=15, example='<password>')


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


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    create_at: date | None = None
    firstname: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    lastname: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    middlename: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    active: bool | None = None
    super_user: bool | None = None
    ucoin: int | None = Field(0, ge=0)
    adap_period: bool | None = None
    job_title: str | None = Field(None, pattern=STRING, example='string', min_length=1)
    legal_entity: str | None = Field(None, pattern=STRING, example='string', min_length=1)


class MyCoin(BaseModel):
    ucoin: int = Field(0, ge=0)


class GetAllUsers(BaseModel):
    users: list[UserAll]
    len: int
