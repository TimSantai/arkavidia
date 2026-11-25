"""Pemilihan soal adaptif IRT 2PL dengan parameter prior (blueprint 04 bagian 5.2).

Catatan jujur: dengan a seragam dan tiga nilai b, informasi Fisher hampir hanya memilih
level Bloom terdekat dengan theta; urutan soal didominasi bobot w_j. Struktur ini disiapkan
agar parameter bisa dikalibrasi saat data cukup, bukan klaim IRT terkalibrasi.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np

BLOOM_TO_B: dict[int, float] = {1: -1.0, 2: 0.0, 3: 1.0}
_GRID = np.round(np.arange(-4.0, 4.0 + 1e-9, 0.1), 10)
_PRIOR_LOG = -0.5 * _GRID**2  # N(0,1) tanpa konstanta normalisasi


def prob_correct(theta: float | np.ndarray, a: float, b: float) -> float | np.ndarray:
    z = np.clip(a * (np.asarray(theta) - b), -35.0, 35.0)
    return 1.0 / (1.0 + np.exp(-z))


def fisher_information(theta: float, a: float, b: float) -> float:
    p = float(prob_correct(theta, a, b))
    return a * a * p * (1.0 - p)


@dataclass(frozen=True, slots=True)
class Response:
    a: float
    b: float
    correct: bool


def estimate_theta(responses: Sequence[Response]) -> tuple[float, float]:
    """EAP pada grid [-4, 4] langkah 0,1 dengan prior N(0,1). Mengembalikan (theta, SE)."""
    log_post = _PRIOR_LOG.copy()
    for r in responses:
        p = np.clip(prob_correct(_GRID, r.a, r.b), 1e-12, 1 - 1e-12)
        log_post += np.log(p) if r.correct else np.log1p(-p)
    log_post -= log_post.max()
    w = np.exp(log_post)
    w /= w.sum()
    mean = float((w * _GRID).sum())
    sd = float(np.sqrt((w * (_GRID - mean) ** 2).sum()))
    return mean, sd


def priority_weight(*, not_own_kc: bool, ai_assisted: bool, centrality: float) -> float:
    """w_j awal (heuristik, perlu disetel): 1 + 1·[bukan KC sendiri] + 0,5·[dibantu AI] + 0,5·c."""
    c = min(max(centrality, 0.0), 1.0)
    return 1.0 + (1.0 if not_own_kc else 0.0) + (0.5 if ai_assisted else 0.0) + 0.5 * c


@dataclass(frozen=True, slots=True)
class CandidateQuestion:
    question_id: str
    a: float
    b: float
    w: float


@dataclass(frozen=True, slots=True)
class Selection:
    question_id: str
    information: float
    score: float


def select_next(theta: float, candidates: Sequence[CandidateQuestion]) -> Selection | None:
    best: Selection | None = None
    for c in candidates:
        info = fisher_information(theta, c.a, c.b)
        score = info * c.w
        # Tie-break deterministik pada id agar hasil bisa direproduksi.
        if best is None or score > best.score + 1e-12 or (
            abs(score - best.score) <= 1e-12 and c.question_id < best.question_id
        ):
            best = Selection(c.question_id, info, score)
    return best
