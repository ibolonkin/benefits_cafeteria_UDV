from fastapi import APIRouter
from .auth_users_rout import router as auth_router
from .crud_users_rout import router as crud_router

router = APIRouter()

router.include_router(auth_router, prefix="/v1", tags=['user'])
router.include_router(crud_router, prefix="/u", tags=['users'])




