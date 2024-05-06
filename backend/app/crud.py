from sqlalchemy.orm import Session
from .models import User, FactorLevel
from .schemas import UserCreate, FactorLevelCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_factor_levels_by_user_id(db: Session, user_id: int):
    return db.query(FactorLevel).filter(FactorLevel.user_id == user_id).all()


def create_factor_level(db: Session, factor_level: FactorLevelCreate, user_id: int):
    db_factor_level = FactorLevel(**factor_level.dict(), user_id=user_id)
    db.add(db_factor_level)
    db.commit()
    db.refresh(db_factor_level)
    return db_factor_level
