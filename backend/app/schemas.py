from pydantic import BaseModel
from datetime import datetime


class FactorLevelBase(BaseModel):
    factor_level: float
    timestamp: datetime


class FactorLevelCreate(FactorLevelBase):
    pass


class FactorLevel(FactorLevelBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


class FactorLevelDisplay(BaseModel):
    factor_level: float
    timestamp: datetime


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        orm_mode = True
