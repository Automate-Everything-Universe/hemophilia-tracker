from fastapi import APIRouter
from .endpoints.user import router as user_router
from .endpoints.login import router as login_router
from .endpoints.data import router as data_router

router = APIRouter()

router.include_router(user_router, prefix="/users", tags=["users"])
router.include_router(login_router, prefix="/login", tags=["login"])
router.include_router(data_router, prefix="/data", tags=["data"])
