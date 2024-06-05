from typing import Union

from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        password=hashed_password,
        email=user.email,
        peak_level=user.peak_level,
        time_elapsed=user.time_elapsed,
        second_level_measurement=user.second_level_measurement,
        weekly_infusions=user.weekly_infusions
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_default_values(db: Session, username: str) -> Union[schemas.UserSignup, None]:
    db_user = get_user_by_username(db, username)
    if db_user:
        weekly_infusions_list = db_user.weekly_infusions.split(", ") if db_user.weekly_infusions else []
        return schemas.UserSignup(
            first_name=db_user.first_name,
            last_name=db_user.last_name,
            username=db_user.username,
            password=db_user.password,
            email=db_user.email,
            peak_level=db_user.peak_level,
            time_elapsed=db_user.time_elapsed,
            second_level_measurement=db_user.second_level_measurement,
            weekly_infusions=weekly_infusions_list
        )
    return None


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def delete_user_by_username(db: Session, username: str):
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


def delete_user_by_email(db: Session, email: str):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


def get_user_plot_data(db: Session, username: str) -> schemas.UserPlotsData:
    db_user = get_user_by_username(db, username)
    if db_user:
        weekly_infusions_list = db_user.weekly_infusions.split(", ") if db_user.weekly_infusions else []
        return schemas.UserPlotsData(
            initialPercentage=db_user.peak_level,
            decayTime=db_user.time_elapsed,
            decayRate=db_user.second_level_measurement,
            refillTimes=weekly_infusions_list,
            currentTime=""  # This needs to be set based on your logic
        )
    return None
