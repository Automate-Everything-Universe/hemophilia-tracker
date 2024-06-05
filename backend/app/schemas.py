from pydantic import BaseModel, Field
from typing import Optional, List


class DefaultValues(BaseModel):
    initial_percentage: Optional[float] = Field(None)
    decay_time: Optional[float] = Field(None)
    decay_rate: Optional[float] = Field(None)
    refill_times: Optional[list[str]] = Field(None)


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


class UserPlotsData(BaseModel):
    initial_percentage: float = Field(..., alias='initialPercentage')
    decay_time: float = Field(..., alias='decayTime')
    decay_rate: float = Field(..., alias='decayRate')
    refill_times: List[str] = Field(..., alias='refillTimes')
    current_level: str = Field(..., alias='currentTime')

    class Config:
        populate_by_name = True
