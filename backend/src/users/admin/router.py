from io import BytesIO

from fastapi import APIRouter, Depends
from starlette.responses import StreamingResponse

from src.handler import get_user_uuid
from src.users.admin.handler import (get_users_offset, update_user_db,
                                     get_user_benefits_uuid, get_user_photo_admin,
                                     delete_photo_user,update_photo_user)
from src.users.admin.shemas import GetAllUsers
from src.users.shemas import User
from src.utils import get_superUser_payload

router = APIRouter(dependencies=[Depends(get_superUser_payload)],
                   responses={403: {'detail': "FORBIDDEN"}, 401: {'detail': "NOT AUTHORIZED"}}, tags=['Admin: Users'])


@router.get('/{user_uuid}/info')
async def read_user(user=Depends(get_user_uuid)):
    return user


@router.get('/{user_uuid}/benefits')
async def read_user_benefits(benefits=Depends(get_user_benefits_uuid)):
    return benefits


@router.get('/{user_uuid}/photo')
async def read_user_photo(data=Depends(get_user_photo_admin)):
    return StreamingResponse(BytesIO(data.data), media_type="image/jpeg")


@router.delete('/{user_uuid}/photo/delete', dependencies=[Depends(delete_photo_user)])
async def delete_user_photo():
    return


@router.patch('/{user_uuid}/photo/update')
async def update_user_photo(user=Depends(update_photo_user)):
    return user


@router.get('/',
            description="order_by: По 4 типам, а именно name, email, create_at, job_title, Так же есть параметр "
                        "sort_order: по двум типам "
                        "asc и desc. len ( это сколько пользователей всего в системе)")
async def read_all_users(obj=Depends(get_users_offset)) -> GetAllUsers:
    return obj


@router.put('/{user_id}/')
async def update_user(user=Depends(update_user_db)):
    return User.model_validate(user, from_attributes=True)
