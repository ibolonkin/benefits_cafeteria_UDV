from datetime import date
from pydantic import BaseModel, EmailStr, Field, field_validator

from src.utils import UserInfo


ONLY_LETTERS_ONE_WORD = r'^[a-zA-ZА-Яа-я]+$'
STRING = r'^.+[^ ]+.*$'
ONLY_ONE_WORD = r'^[^\s]+$'

class UserProfileName(BaseModel):
    firstname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('firstname')
    @classmethod
    def name_field(cls, value):
        if value:
            return value.lower().title()

class UserProfileLastName(BaseModel):
    lastname: str = Field(pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('lastname')
    @classmethod
    def lastname_field(cls, value):
        if value:
            return value.lower().title()


class UserProfileFio(UserProfileName, UserProfileLastName):
    middlename: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD, example='string', min_length=1, max_length=100)

    @field_validator('middlename')
    @classmethod
    def middlename_field(cls, value):
        if value:
            return value.lower().title()

class UserProfile(UserProfileFio):
    legal_entity: str | None = Field(None, pattern=STRING, example='string', max_length=100)
    job_title: str | None = Field(None, pattern=STRING, example='string', max_length=100)
    @field_validator('job_title', 'legal_entity')
    @classmethod
    def title_fields_job_title(cls, value):
        if value:
            return value.lower().title()

class User(BaseModel):
    create_at: date
    email: EmailStr
    ucoin: int
    adap_period: bool
    profile: UserProfile
    is_verified: bool
    date_change_password: date

class UserApplication(BaseModel):
    profile: UserProfileName

class UserAdmin(UserInfo, User):
    pass

