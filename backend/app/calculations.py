import numpy as np


def calculate_decay_constant(factor_measured_level: float, time_elapsed_until_measurement: float) -> float:
    return np.log(factor_measured_level / 100) / time_elapsed_until_measurement
