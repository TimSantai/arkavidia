"""Ambang abstain grader (blueprint 04 bagian 5.3).

Dua mode:
- heuristik (default, tanpa set kalibrasi): terima bila ketidaksepakatan s <= floor(0,2k)/k.
- conformal risk control (Angelopoulos et al., ICLR 2024): aktif bila set kalibrasi berlabel
  manusia tersedia. Loss L_i(lambda) = 1{salah_i} * 1{s_i <= lambda}, tidak turun terhadap
  lambda. lambda_hat = max{lambda : (n * R_n(lambda) + 1)/(n + 1) <= alpha}.
  Jaminan: E[L_{n+1}] <= alpha, yaitu P(salah DAN diterima) <= alpha, dengan syarat data
  kalibrasi dan uji exchangeable.
"""

from __future__ import annotations

import math
from collections import Counter
from collections.abc import Sequence
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class SampleSummary:
    grade: int
    uncertainty: float
    k: int


def summarize(grades: Sequence[int]) -> SampleSummary:
    """Modus sampel (seri -> nilai terendah, konservatif) dan s = 1 - frekuensi_modus/k."""
    if not grades:
        raise ValueError("butuh minimal satu sampel")
    counts = Counter(grades)
    top = max(counts.values())
    mode = min(g for g, c in counts.items() if c == top)
    return SampleSummary(grade=mode, uncertainty=1.0 - top / len(grades), k=len(grades))


def heuristic_lambda(k: int) -> float:
    return math.floor(0.2 * k + 1e-9) / k


def possible_lambdas(k: int) -> list[float]:
    return [i / k for i in range(k + 1)]


@dataclass(frozen=True, slots=True)
class CalibrationPoint:
    uncertainty: float
    wrong: bool


def conformal_lambda(
    calibration: Sequence[CalibrationPoint], alpha: float, lambdas: Sequence[float]
) -> float | None:
    """lambda_hat terbesar yang memenuhi batas CRC; None = selalu abstain."""
    if not 0 < alpha < 1:
        raise ValueError("alpha harus di (0, 1)")
    n = len(calibration)
    if n == 0:
        return None
    best: float | None = None
    for lam in sorted(lambdas):
        risk_sum = sum(1 for c in calibration if c.wrong and c.uncertainty <= lam + 1e-12)
        if (risk_sum + 1) / (n + 1) <= alpha:
            best = lam
        else:
            break  # loss monoton: lambda lebih besar tidak mungkin lolos
    return best


def accept(uncertainty: float, lam: float | None) -> bool:
    return lam is not None and uncertainty <= lam + 1e-12
