"""Bayesian Knowledge Tracing dengan forgetting (blueprint 04 bagian 5.4).

Parameter default tetap (tidak di-fit). Dengan jawaban benar terus-menerus, P(L) konvergen
ke ~0,94 karena p_F, sehingga ambang tau harus < 0,94.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class BKTParams:
    p_init: float = 0.2
    p_transit: float = 0.15
    p_guess: float = 0.2
    p_slip: float = 0.1
    p_forget: float = 0.05

    def __post_init__(self) -> None:
        for name in ("p_init", "p_transit", "p_guess", "p_slip", "p_forget"):
            v = getattr(self, name)
            if not 0.0 < v < 1.0:
                raise ValueError(f"{name} harus di (0, 1), dapat {v}")
        if self.p_guess >= 0.5 or self.p_slip >= 0.5:
            raise ValueError("p_guess dan p_slip harus < 0,5 agar model tidak degeneratif")


DEFAULT_PARAMS = BKTParams()
MASTERY_TAU = 0.7


def posterior(p: float, correct: bool, params: BKTParams = DEFAULT_PARAMS) -> float:
    if correct:
        num = p * (1 - params.p_slip)
        den = num + (1 - p) * params.p_guess
    else:
        num = p * params.p_slip
        den = num + (1 - p) * (1 - params.p_guess)
    return num / den


def update(p: float, correct: bool, params: BKTParams = DEFAULT_PARAMS) -> float:
    if not 0.0 <= p <= 1.0:
        raise ValueError("p harus di [0, 1]")
    q = posterior(p, correct, params)
    nxt = q * (1 - params.p_forget) + (1 - q) * params.p_transit
    return min(max(nxt, 0.0), 1.0)
