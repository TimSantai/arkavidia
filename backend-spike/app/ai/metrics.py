"""Metrik tim: coverage, bus factor eksak, Gini ternormalisasi, pairing eksak
(blueprint 04 bagian 6). Dirancang untuk tim <= 6 anggota; di atas itu memakai greedy.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from itertools import combinations

# mastery[user_id][kc_id] = P(L). Nilai yang tidak ada dianggap 0.
MasteryMatrix = Mapping[str, Mapping[str, float]]

EXACT_PAIRING_MAX_MEMBERS = 6


def covered_by(mastery: MasteryMatrix, members: Sequence[str], kc: str, tau: float) -> list[str]:
    return [u for u in members if mastery.get(u, {}).get(kc, 0.0) >= tau]


def coverage(
    mastery: MasteryMatrix, members: Sequence[str], kcs: Sequence[str], tau: float
) -> dict[str, int]:
    return {k: len(covered_by(mastery, members, k, tau)) for k in kcs}


def bus_factor(
    mastery: MasteryMatrix,
    members: Sequence[str],
    critical_kcs: Sequence[str],
    tau: float,
    loss_fraction: float = 0.5,
) -> int | None:
    """Jumlah anggota paling sedikit yang, bila keluar, membuat >= loss_fraction KC kritis
    tidak dipahami siapa pun. None bila tidak ada KC kritis. Eksak lewat enumerasi subset."""
    if not critical_kcs:
        return None
    holders = {k: set(covered_by(mastery, members, k, tau)) for k in critical_kcs}
    threshold = loss_fraction * len(critical_kcs)
    for size in range(len(members) + 1):
        for removed in combinations(members, size):
            gone = set(removed)
            lost = sum(1 for k in critical_kcs if not (holders[k] - gone))
            if lost >= threshold:
                return size
    return len(members)  # tidak tercapai secara teori: semua keluar => semua hilang


def gini(values: Sequence[float]) -> float:
    """Gini ternormalisasi ke [0, 1]: G * n/(n-1). 0 untuk n <= 1 atau rata-rata 0."""
    n = len(values)
    if n <= 1:
        return 0.0
    mean = sum(values) / n
    if mean <= 0:
        return 0.0
    diff = sum(abs(x - y) for x in values for y in values)
    g = diff / (2 * n * n * mean)
    return min(g * n / (n - 1), 1.0)


@dataclass(frozen=True, slots=True)
class Pair:
    explainer: str
    learner: str
    kc: str
    gain: float


def _objective(base_cov: Mapping[str, int], crit: Mapping[str, float], pairs: Sequence[Pair],
               target: int) -> float:
    cov = dict(base_cov)
    for p in pairs:
        cov[p.kc] = cov.get(p.kc, 0) + 1
    return sum(crit.get(k, 1.0) * min(c, target) for k, c in cov.items())


def _options(mastery: MasteryMatrix, a: str, b: str, kcs: Sequence[str], tau: float):
    for k in kcs:
        pa, pb = mastery.get(a, {}).get(k, 0.0), mastery.get(b, {}).get(k, 0.0)
        if pa >= tau > pb:
            yield (a, b, k)
        elif pb >= tau > pa:
            yield (b, a, k)


def suggest_pairs(
    mastery: MasteryMatrix,
    members: Sequence[str],
    kcs: Sequence[str],
    criticality: Mapping[str, float],
    tau: float,
    target: int = 2,
) -> list[Pair]:
    """Maksimalkan f(S) = sum_k c_k * min(cov_k + delta_k(S), T); tiap anggota maks 1 pasangan."""
    base = coverage(mastery, members, kcs, tau)
    base_value = _objective(base, criticality, [], target)
    members = sorted(members)

    if len(members) > EXACT_PAIRING_MAX_MEMBERS:
        return _greedy_pairs(mastery, members, kcs, criticality, tau, target, base)

    best: tuple[float, list[tuple[str, str, str]]] = (base_value, [])

    def dfs(remaining: list[str], chosen: list[tuple[str, str, str]]) -> None:
        nonlocal best
        if not remaining:
            pairs = [Pair(e, lr, k, 0.0) for e, lr, k in chosen]
            val = _objective(base, criticality, pairs, target)
            if val > best[0] + 1e-12:
                best = (val, list(chosen))
            return
        head, rest = remaining[0], remaining[1:]
        dfs(rest, chosen)  # head tidak dipasangkan
        for i, other in enumerate(rest):
            for opt in _options(mastery, head, other, kcs, tau):
                chosen.append(opt)
                dfs(rest[:i] + rest[i + 1 :], chosen)
                chosen.pop()

    dfs(members, [])
    return _with_marginal_gain(best[1], base, criticality, target)


def _with_marginal_gain(chosen, base, criticality, target) -> list[Pair]:
    out: list[Pair] = []
    acc: list[Pair] = []
    prev = _objective(base, criticality, acc, target)
    for e, lr, k in chosen:
        acc.append(Pair(e, lr, k, 0.0))
        cur = _objective(base, criticality, acc, target)
        out.append(Pair(e, lr, k, round(cur - prev, 6)))
        prev = cur
    return [p for p in out if p.gain > 0]


def _greedy_pairs(mastery, members, kcs, criticality, tau, target, base) -> list[Pair]:
    used: set[str] = set()
    chosen: list[tuple[str, str, str]] = []
    while True:
        cur = _objective(base, criticality, [Pair(*c, 0.0) for c in chosen], target)
        best_gain, best_opt = 0.0, None
        for a, b in combinations([m for m in members if m not in used], 2):
            for opt in _options(mastery, a, b, kcs, tau):
                val = _objective(base, criticality, [Pair(*c, 0.0) for c in [*chosen, opt]], target)
                if val - cur > best_gain + 1e-12:
                    best_gain, best_opt = val - cur, opt
        if best_opt is None:
            break
        chosen.append(best_opt)
        used.update(best_opt[:2])
    return _with_marginal_gain(chosen, base, criticality, target)
