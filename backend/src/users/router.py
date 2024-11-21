from fastapi import APIRouter
from .auth.router import router as auth_router
from .admin.router import router as crud_router
from .user.router import router as user_router

router = APIRouter()

router.include_router(auth_router, prefix="/v1")
router.include_router(crud_router, prefix="/u")
router.include_router(user_router, prefix="/profile")
