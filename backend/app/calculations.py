import numpy as np


def calculate_decay_constant(initial_factor_level: float, measured_level: float, time_elapsed: float) -> float:
    return (np.log(measured_level) - np.log(initial_factor_level)) / time_elapsed
