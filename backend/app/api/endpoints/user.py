from fastapi import APIRouter

router = APIRouter()


@router.get("/user")
def test_user():
    return {"message": "User endpoint is working"}
