from pydantic import BaseModel, Field, field_validator, EmailStr, UUID4
from datetime import date
from src.users.shemas import ONLY_LETTERS_ONE_WORD, STRING, UserProfileName, UserProfileLastName


class ProfileUpdate(BaseModel):
    firstname: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD,
                                  example='string', min_length=1, max_length=100)
    lastname: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD,
                                 example='string', min_length=1, max_length=100)
    middlename: str | None = Field(None, pattern=ONLY_LETTERS_ONE_WORD,
                                   example='string', min_length=1, max_length=100)
    job_title: str | None = Field(None, pattern=STRING, example='string',
                                  min_length=1, max_length=100)
    legal_entity: str | None = Field(None, pattern=STRING, example='string',
                                     min_length=1, max_length=100)


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

class UserProfileForAll(UserProfileName, UserProfileLastName):
    job_title: str | None = Field(None, pattern=STRING,
                                  example='string', max_length=100)

    @field_validator('job_title')
    @classmethod
    def title_fields_job_title(cls, value):
        if value:
            return value.lower().title()

class UserAllAdmin(BaseModel):
    uuid: UUID4
    email: EmailStr
    profile: UserProfileForAll
    create_at: date

class GetAllUsersAdmin(BaseModel):
    users: list[UserAllAdmin]
    len: int