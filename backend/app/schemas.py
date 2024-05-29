from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    first_name: str = None
    last_name: str = None
    username: str
    email: Optional[str] = None
    peak_level: Optional[float] = 60
    time_elapsed: Optional[float] = 30
    second_level_measurement: Optional[float] = 15
    weekly_infusions: Optional[str] = 'Monday 07:30 AM, Wednesday 01:30 PM, Friday 07:30 AM'


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        from_attributes = True
