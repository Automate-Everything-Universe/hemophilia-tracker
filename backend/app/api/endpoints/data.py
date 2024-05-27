from typing import List

from fastapi import FastAPI, APIRouter
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import pytz

import numpy as np

CET = pytz.timezone('Europe/Berlin')

app = FastAPI()


class DefaultValues(BaseModel):
    initial_percentage: float = 60
    decay_time: float = 30
    decay_rate: float = 15
    refill_times: list[str] = ["Monday 07:30 AM", "Wednesday 07:30 AM", "Friday 07:30 AM"]


class FactorLevelSettings(BaseModel):
    initial_percentage: float = Field(..., alias='initialPercentage')
    decay_time: float = Field(..., alias='decayTime')
    decay_rate: float = Field(..., alias='decayRate')
    refill_times: List[str] = Field(..., alias='refillTimes')
    current_level: str = Field(..., alias='currentLevel')  # Add currentLevel field

    class Config:
        allow_population_by_field_name = True


router = APIRouter()


def convert_to_datetime(date_str):
    # Current date details
    now = datetime.now(CET)
    current_year = now.year
    current_month = now.month

    # Parse time and AM/PM from the string (ignore the weekday for now)
    time_part = ' '.join(date_str.split()[1:])  # Gets "10:05 AM"
    # Construct a datetime object from the time part
    datetime_obj = datetime.strptime(time_part, '%I:%M %p')
    # Replace the year and month with current values
    datetime_obj = datetime_obj.replace(year=current_year, month=current_month)

    # Handling the weekday to ensure it matches the correct date in the current week
    weekday_str = date_str.split()[0]  # Gets "Monday"
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    target_weekday = weekdays.index(weekday_str)
    current_weekday = now.weekday()

    # Calculate the difference in days and adjust the date
    days_difference = target_weekday - current_weekday
    correct_date = now + timedelta(days=days_difference)

    # Ensure the datetime object matches the correct day, keeping time and AM/PM
    final_datetime = datetime_obj.replace(day=correct_date.day)

    return CET.localize(final_datetime)


def parse_refill_time(time_str: str, start_of_week: datetime) -> datetime:
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_part, *time_part = time_str.split()
    day_of_week = weekdays.index(day_part)
    time_part = " ".join(time_part)
    time_obj = datetime.strptime(time_part, "%I:%M %p")
    day_datetime = start_of_week + timedelta(days=day_of_week)
    return day_datetime.replace(hour=time_obj.hour, minute=time_obj.minute)


def calculate_decay_constant(decay_rate: float, decay_time: float) -> float:
    return np.log(decay_rate / 100) / decay_time


def generate_refill_hours(refill_times: List[str], start_of_week: datetime) -> List[float]:
    refill_datetimes = [parse_refill_time(time_str, start_of_week) for time_str in refill_times]
    return [(dt - start_of_week).total_seconds() / 3600 for dt in refill_datetimes]


def calculate_percentage(hour: float, refill_hours: List[float], initial_percentage: float, decay_constant: float,
                         week_duration: int) -> float:
    if not refill_hours or hour < refill_hours[0]:
        previous_week_last_refill = refill_hours[-1] - week_duration
        return initial_percentage * np.exp(decay_constant * (hour - previous_week_last_refill))
    for i in range(len(refill_hours)):
        if hour < refill_hours[i]:
            if i == 0:
                previous_week_last_refill = refill_hours[-1] - week_duration
                return initial_percentage * np.exp(decay_constant * (hour - previous_week_last_refill))
            return initial_percentage * np.exp(decay_constant * (hour - refill_hours[i - 1]))
    return initial_percentage * np.exp(decay_constant * (hour - refill_hours[-1]))


@router.post("/update-factor-levels", response_model=dict)
async def get_factor_levels(settings: FactorLevelSettings) -> dict:
    WEEK_DURATION = 24 * 7  # hours in a week
    HOUR_INCR = 0.1  # time step in hours

    start_of_week = CET.localize(
        datetime.combine(datetime.now(CET).date() - timedelta(days=datetime.now(CET).date().weekday()),
                         datetime.min.time()))
    decay_constant = calculate_decay_constant(settings.decay_rate, settings.decay_time)
    refill_hours = generate_refill_hours(settings.refill_times, start_of_week)

    week_hours = np.arange(0, WEEK_DURATION, HOUR_INCR)
    levels = [calculate_percentage(hour, refill_hours, settings.initial_percentage, decay_constant, WEEK_DURATION) for
              hour in week_hours]

    current_time = convert_to_datetime(settings.current_level)

    current_hour = (current_time - start_of_week).total_seconds() / 3600
    current_factor_level = calculate_percentage(current_hour, refill_hours, settings.initial_percentage, decay_constant,
                                                WEEK_DURATION)

    return {
        "hours": week_hours.tolist(),
        "start_of_week": start_of_week.isoformat(),
        "levels": levels,
        "current_time": current_time.isoformat(),
        "current_factor_level": [current_hour, current_factor_level]
    }


@router.get("/default-values", response_model=DefaultValues)
async def get_default_values():
    return DefaultValues()


app.include_router(router)
