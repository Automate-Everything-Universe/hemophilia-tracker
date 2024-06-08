import numpy as np


def calculate_decay_constant(decay_rate: float, decay_time: float) -> float:
    return np.log(decay_rate / 100) / decay_time
