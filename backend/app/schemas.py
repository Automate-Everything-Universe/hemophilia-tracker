from pydantic import BaseModel, Field
from typing import Optional, List


class UserSignup(BaseModel):
    first_name: Optional[str] = Field(None, alias='firstName')
    last_name: Optional[str] = Field(None, alias='lastName')
    username: str
    password: str
    email: Optional[str] = None
    peak_level: Optional[float] = Field(None, alias='peakLevel')
    time_elapsed: Optional[float] = Field(None, alias='timeElapsed')
    second_level_measurement: Optional[float] = Field(None, alias='secondLevelMeasurement')
    weekly_infusions: Optional[List[str]] = None

    class Config:
        populate_by_name = True


class UserBase(BaseModel):
    first_name: str = None
    last_name: str = None
    username: str
    email: Optional[str] = None
    peak_level: Optional[float] = 60
    time_elapsed: Optional[float] = 30
    second_level_measurement: Optional[float] = 15
    weekly_infusions: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        from_attributes = True
