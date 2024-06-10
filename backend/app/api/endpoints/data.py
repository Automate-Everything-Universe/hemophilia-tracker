import math
from typing import List, Union
from datetime import datetime, timedelta
from dataclasses import dataclass

from fastapi import FastAPI, APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

import numpy as np
import pytz

from ... import schemas, crud
from ...dependencies import get_db
from ...schemas import DefaultValues

CET = pytz.timezone('Europe/Berlin')

NOW = datetime.now(CET)
CURRENT_YEAR = NOW.year
CURRENT_MONTH = NOW.month

app = FastAPI()


class FactorLevelSettings(BaseModel):
    initial_percentage: float = Field(..., alias='initialPercentage')
    decay_time: float = Field(..., alias='decayTime')
    decay_rate: float = Field(..., alias='decayRate')
    refill_times: List[str] = Field(..., alias='refillTimes')
    current_level: str = Field(..., alias='currentTime')  # Add currentTime field

    class Config:
        populate_by_name = True


@dataclass
class FactorCalculationParameters:
    initial_percentage: float
    decay_constant: float
    refill_hours: List[float]
    week_duration: int


router = APIRouter()


def convert_to_datetime(date_str):
    time_part = ' '.join(date_str.split()[1:])  # Gets "10:05 AM"
    datetime_obj = datetime.strptime(time_part, '%I:%M %p')
    datetime_obj = datetime_obj.replace(year=CURRENT_YEAR, month=CURRENT_MONTH)

    weekday_str = date_str.split()[0]  # Gets "Monday"
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    target_weekday = weekdays.index(weekday_str)
    current_weekday = NOW.weekday()

    days_difference = target_weekday - current_weekday
    correct_date = NOW + timedelta(days=days_difference)

    final_datetime = datetime_obj.replace(day=correct_date.day)

    return CET.localize(final_datetime)


def calculate_decay_constant(decay_rate: float, decay_time: float) -> float:
    return np.log(decay_rate / 100) / decay_time


def generate_refill_hours(refill_times: List[str], start_of_week: datetime) -> List[float]:
    refill_times_in_datetime_format = generate_refill_times_in_datetime_format(refill_times, start_of_week)
    refill_hours = generate_refill_times_in_hour_format(refill_times_in_datetime_format, start_of_week)
    return refill_hours


def generate_refill_times_in_hour_format(refill_times_in_datetime_format, start_of_week):
    refill_hours_in_numbers = []
    for refill_time_in_datetime in refill_times_in_datetime_format:
        refill_time_in_hour = (refill_time_in_datetime - start_of_week).total_seconds() / 3600
        refill_hours_in_numbers.append(refill_time_in_hour)
    return refill_hours_in_numbers


def generate_refill_times_in_datetime_format(refill_times, start_of_week):
    refill_datetimes = []

    for time_str in refill_times:
        refill_time_in_datetime = parse_refill_time(time_str, start_of_week)
        refill_datetimes.append(refill_time_in_datetime)

    return refill_datetimes


def parse_refill_time(time_str: str, start_of_week: datetime) -> datetime:
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_part, *time_part = time_str.split()
    day_of_week = weekdays.index(day_part)
    time_part = " ".join(time_part)
    time_obj = datetime.strptime(time_part, "%I:%M %p")
    time_obj = time_obj.replace(year=CURRENT_YEAR, month=CURRENT_MONTH)
    day_datetime = start_of_week + timedelta(days=day_of_week)
    return day_datetime.replace(hour=time_obj.hour, minute=time_obj.minute)


def calculate_percentage(week_hours: List[float], params: FactorCalculationParameters) -> List[float]:
    refill_hours = params.refill_hours
    initial_percentage = params.initial_percentage
    decay_constant = params.decay_constant
    week_duration = params.week_duration

    levels = []

    peak_value = initial_percentage

    for hour in week_hours:
        if not refill_hours:
            levels.append(0.0)
            continue

        if hour < refill_hours[0]:
            previous_week_last_refill = refill_hours[-1] - week_duration
            levels.append(initial_percentage * np.exp(decay_constant * (hour - previous_week_last_refill)))
            continue

        for i in range(len(refill_hours)):
            if hour == refill_hours[i]:
                if i == 0:
                    previous_week_last_refill = refill_hours[-1] - week_duration
                    previous_hour = (hour - 0.1)
                    previous_level_value = peak_value * np.exp(
                        decay_constant * (previous_hour - previous_week_last_refill))
                    level_value = initial_percentage + previous_level_value
                    peak_value = level_value
                    levels.append(level_value)
                else:
                    previous_hour = (hour - 0.1)
                    last_refill_hour = refill_hours[i - 1]
                    previous_value = peak_value * np.exp(decay_constant * (previous_hour - last_refill_hour))
                    level_value = initial_percentage + previous_value
                    levels.append(level_value)
                    peak_value = level_value
                break

            if hour < refill_hours[i]:
                if i == 0:
                    previous_week_last_refill = refill_hours[-1] - week_duration
                    level_value = initial_percentage * np.exp(decay_constant * (hour - previous_week_last_refill))
                    levels.append(level_value)
                else:
                    level_value = peak_value * np.exp(decay_constant * (hour - refill_hours[i - 1]))
                    levels.append(level_value)
                break

        if hour > refill_hours[-1]:
            levels.append(peak_value * np.exp(decay_constant * (hour - refill_hours[-1])))

    return levels


@router.post("/update-factor-levels", response_model=dict)
async def get_factor_levels(settings: FactorLevelSettings) -> dict:
    hours_in_a_week = 24 * 7

    start_of_week = CET.localize(
        datetime.combine(datetime.now(CET).date() - timedelta(days=datetime.now(CET).date().weekday()),
                         datetime.min.time()))

    decay_constant = calculate_decay_constant(settings.decay_rate, settings.decay_time)

    refill_hours = generate_refill_hours(settings.refill_times, start_of_week)

    week_hours = np.arange(0, hours_in_a_week, 0.1).round(2)
    week_hours = week_hours.tolist()

    params = FactorCalculationParameters(
        refill_hours=refill_hours,
        initial_percentage=settings.initial_percentage,
        decay_constant=decay_constant,
        week_duration=hours_in_a_week
    )

    levels = calculate_percentage(week_hours=week_hours, params=params)

    current_time = convert_to_datetime(settings.current_level)
    current_hour = [(current_time - start_of_week).total_seconds() / 3600]

    current_factor_level = calculate_percentage(week_hours=current_hour, params=params)

    return {
        "hours": week_hours,
        "start_of_week": start_of_week.isoformat(),
        "levels": levels,
        "current_time": current_time.isoformat(),
        "current_factor_level": [current_hour[0], current_factor_level[0]]
    }


@router.get("/default-values", response_model=DefaultValues)
async def get_default_values(db: Session = Depends(get_db)):
    username = "stefanjosan"
    user_defaults = crud.get_user_default_values(db, username)
    if user_defaults:
        default_values = DefaultValues()
        default_values.initial_percentage = user_defaults.peak_level
        default_values.decay_time = user_defaults.time_elapsed
        default_values.decay_rate = user_defaults.second_level_measurement
        default_values.refill_times = user_defaults.weekly_infusions
        return default_values
    raise HTTPException(status_code=404, detail="User not found")


app.include_router(router)
