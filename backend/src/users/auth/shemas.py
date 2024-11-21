from pydantic import BaseModel, Field, EmailStr
from src.users.shemas import ONLY_ONE_WORD, UserProfileFIO


class UserAuthorization(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=15, example='<password>', pattern=ONLY_ONE_WORD)

class UserRegister(UserProfileFIO, UserAuthorization):
    pass