from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...dependencies import get_db
from ...schemas import UserCreate
from ...crud import get_user_by_username, create_user, verify_password

router = APIRouter()


@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    return {"message": "User authenticated"}


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(db, username=user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    create_user(db, user)
    return {"message": "User created successfully"}
