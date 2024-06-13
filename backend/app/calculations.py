import numpy as np


def calculate_decay_constant(peak_level: float, measured_level: float, time_elapsed: float) -> float:
    return (np.log(measured_level) - np.log(peak_level)) / time_elapsed
