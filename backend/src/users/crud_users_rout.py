from fastapi import APIRouter, Depends
from .handlerDB import get_user_uuid_req, get_users_offset, update_user_db
from .helper import get_superUser_payload
from .shemas import User, UserAll

router = APIRouter(dependencies=[Depends(get_superUser_payload)],
                   responses={403: {'detail': "FORBIDDEN"}, 401: {'detail': "NOT AUTHORIZED"}})


@router.get('/{user_id}')
async def read_user(user=Depends(get_user_uuid_req)) -> User:
    return User.model_validate(user, from_attributes=True)


@router.get('/')
async def read_all_users(users: list[UserAll] = Depends(get_users_offset)) -> list[UserAll]:
    return users


@router.put('/{user_id}')
async def update_user(user=Depends(update_user_db)):
    return User.model_validate(user, from_attributes=True)
