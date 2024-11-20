from pydantic import BaseModel, Field
from src.users.shemas import  UserNameSurname

class UCoin(BaseModel):
    ucoin: int = Field(0, ge=0)

class Check(UserNameSurname):
    super_user: bool