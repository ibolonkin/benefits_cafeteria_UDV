from fastapi import APIRouter

from .admin.router import router as router_admin
from .user.router import router as router_user

router = APIRouter(prefix='/b')


router.include_router(router_admin)
router.include_router(router_user, tags=['Benefit: User'])
