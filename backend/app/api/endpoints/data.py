import numpy as np

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from datetime import datetime, timedelta

router = APIRouter()


def calculate_decay_constant(decay_rate, decay_time):
    return np.log(decay_rate / 100) / decay_time


def get_refill_hours(refill_times, start_time_format):
    start_of_week = datetime.strptime(refill_times[0], start_time_format)
    return [(datetime.strptime(time, start_time_format) - start_of_week).total_seconds() / 3600 for time in
            refill_times], start_of_week


def calculate_factor_levels(initial_percentage, decay_constant, week_hours, refill_hours):
    def calculate_level(hour):
        for start in reversed(refill_hours):
            if hour >= start:
                return initial_percentage * np.exp(decay_constant * (hour - start))
        return initial_percentage

    return [calculate_level(hour) for hour in week_hours]

def get_factor_levels():
    INITIAL_PERCENTAGE = 100
    DECAY_RATE = 15
    DECAY_TIME = 30
    WEEK_DURATION = 24 * 7
    HOUR_INCR = 0.1

    current_date = datetime.now().date()
    this_monday = current_date - timedelta(days=current_date.weekday())
    this_wednesday = this_monday + timedelta(days=2)
    this_friday = this_monday + timedelta(days=4)

    refill_times = [
        this_monday.strftime("%Y-%m-%d") + " 07:30",
        this_wednesday.strftime("%Y-%m-%d") + " 07:30",
        this_friday.strftime("%Y-%m-%d") + " 07:30"
    ]
    start_of_week = datetime.strptime(refill_times[0], "%Y-%m-%d %H:%M")

    decay_constant = np.log(DECAY_RATE / 100) / DECAY_TIME
    refill_hours = [(datetime.strptime(time, "%Y-%m-%d %H:%M") - start_of_week).total_seconds() / 3600 for time in
                    refill_times]

    def calculate_X_with_refill(hour):
        for start in reversed(refill_hours):
            if hour >= start:
                return INITIAL_PERCENTAGE * np.exp(decay_constant * (hour - start))
        return 100

    week_hours = np.arange(0, WEEK_DURATION, HOUR_INCR)
    levels = np.array([calculate_X_with_refill(hour) for hour in week_hours])

    current_time = datetime.now()
    current_hour = (current_time - start_of_week).total_seconds() / 3600
    current_factor_level = calculate_X_with_refill(current_hour)

    below_5_first_occurrence = next(((hour, level) for hour, level in zip(week_hours, levels) if level < 5),
                                    (None, None))

    return JSONResponse(content={
        "hours": week_hours.tolist(),
        "start_of_week": start_of_week.isoformat(),
        "levels": levels.tolist(),
        "current_time": current_time.isoformat(),
        "current_factor_level": current_factor_level,
        "below_5_first_occurrence": below_5_first_occurrence,
        "current_factor_level": [current_hour,current_factor_level]
    })


router.get("/factor-levels", response_model=dict)(get_factor_levels)
