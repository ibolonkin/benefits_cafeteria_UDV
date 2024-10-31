from fastapi import APIRouter
from .router_cud import router as router_cud
from .router_r import router as router_r
from .router_application import router as router_application

router = APIRouter(tags=['benefit'], prefix='/b')

router.include_router(router_cud)
router.include_router(router_r)
router.include_router(router_application)

