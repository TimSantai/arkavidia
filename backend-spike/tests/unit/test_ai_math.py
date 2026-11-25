import math

import pytest

from app.ai import bkt, conformal, irt, metrics


# ── IRT ──
def test_prob_and_information_at_b():
    assert irt.prob_correct(0.0, 1.0, 0.0) == pytest.approx(0.5)
    assert irt.fisher_information(0.0, 1.0, 0.0) == pytest.approx(0.25)  # a^2 * 0.25
    assert irt.fisher_information(0.0, 2.0, 0.0) == pytest.approx(1.0)


def test_extreme_theta_is_numerically_stable():
    assert 0.0 <= float(irt.prob_correct(1e6, 50, 0)) <= 1.0
    assert irt.fisher_information(1e6, 50, 0) >= 0.0


def test_eap_prior_and_direction():
    theta, se = irt.estimate_theta([])
    assert theta == pytest.approx(0.0, abs=1e-9)
    assert se == pytest.approx(1.0, abs=0.02)  # sd prior N(0,1) pada grid
    up, _ = irt.estimate_theta([irt.Response(1, 0, True)] * 3)
    down, _ = irt.estimate_theta([irt.Response(1, 0, False)] * 3)
    assert up > 0 > down
    assert up == pytest.approx(-down, abs=1e-9)


def test_select_prefers_matching_difficulty_then_weight():
    cands = [irt.CandidateQuestion("easy", 1, -1, 1.0), irt.CandidateQuestion("mid", 1, 0, 1.0)]
    assert irt.select_next(0.0, cands).question_id == "mid"
    cands.append(irt.CandidateQuestion("easy-heavy", 1, -1, 2.0))
    assert irt.select_next(0.0, cands).question_id == "easy-heavy"
    assert irt.select_next(0.0, []) is None


def test_priority_weight():
    assert irt.priority_weight(not_own_kc=False, ai_assisted=False, centrality=0) == 1.0
    assert irt.priority_weight(not_own_kc=True, ai_assisted=True, centrality=5) == 3.0


# ── BKT: angka uji kewajaran blueprint 04 bagian 5.4 ──
def test_bkt_reference_numbers():
    p1 = bkt.update(0.2, True)
    assert p1 == pytest.approx(0.5735, abs=1e-4)
    assert bkt.update(p1, True) == pytest.approx(0.8366, abs=1e-4)
    assert bkt.update(0.2, False) == pytest.approx(0.1742, abs=1e-4)


def test_bkt_ceiling_below_one():
    p = 0.2
    for _ in range(200):
        p = bkt.update(p, True)
    assert 0.93 < p < 0.95


@pytest.mark.parametrize("kwargs", [{"p_guess": 0.5}, {"p_slip": 0.6}, {"p_forget": 0.0}])
def test_bkt_rejects_degenerate_params(kwargs):
    with pytest.raises(ValueError):
        bkt.BKTParams(**kwargs)


# ── Conformal & self-consistency ──
def test_summarize_mode_and_tie_break():
    s = conformal.summarize([2, 2, 2, 2, 1])
    assert (s.grade, s.uncertainty) == (2, pytest.approx(0.2))
    tie = conformal.summarize([2, 1])
    assert tie.grade == 1 and tie.uncertainty == pytest.approx(0.5)


def test_heuristic_lambda():
    assert conformal.heuristic_lambda(5) == pytest.approx(0.2)
    assert conformal.heuristic_lambda(3) == 0.0
    assert conformal.accept(0.2, 0.2) and not conformal.accept(0.4, 0.2)
    assert not conformal.accept(0.0, None)


def test_conformal_needs_minimum_n():
    # n = 8 < 1/alpha - 1 = 9: tidak ada lambda yang lolos -> selalu abstain.
    cal = [conformal.CalibrationPoint(0.0, False)] * 8
    assert conformal.conformal_lambda(cal, 0.1, conformal.possible_lambdas(5)) is None
    cal9 = [conformal.CalibrationPoint(0.0, False)] * 9
    assert conformal.conformal_lambda(cal9, 0.1, conformal.possible_lambdas(5)) == 1.0


def test_conformal_picks_largest_valid_lambda():
    # 100 titik: s=0 selalu benar; s=0.2 ada 5 salah; s=0.4 ada 20 salah.
    cal = ([conformal.CalibrationPoint(0.0, False)] * 60
           + [conformal.CalibrationPoint(0.2, True)] * 5 + [conformal.CalibrationPoint(0.2, False)] * 15
           + [conformal.CalibrationPoint(0.4, True)] * 20)
    lam = conformal.conformal_lambda(cal, 0.1, conformal.possible_lambdas(5))
    # lambda=0.2: (5+1)/101 = 0.059 <= 0.1 lolos; lambda=0.4: (25+1)/101 = 0.257 gagal.
    assert lam == pytest.approx(0.2)


# ── Metrik tim ──
M = {"a": {"k1": 0.9, "k2": 0.9}, "b": {"k1": 0.8}, "c": {}}


def test_coverage_and_bus_factor():
    assert metrics.coverage(M, ["a", "b", "c"], ["k1", "k2"], 0.7) == {"k1": 2, "k2": 1}
    # Keluarnya "a" menghilangkan k2 (50% KC kritis) -> bus factor 1.
    assert metrics.bus_factor(M, ["a", "b", "c"], ["k1", "k2"], 0.7) == 1
    assert metrics.bus_factor(M, ["a", "b", "c"], [], 0.7) is None
    assert metrics.bus_factor({}, ["a"], ["k1"], 0.7) == 0  # sudah tak tercakup


def test_bus_factor_needs_two():
    m = {"a": {"k1": 0.9}, "b": {"k1": 0.9}}
    assert metrics.bus_factor(m, ["a", "b"], ["k1"], 0.7) == 2


def test_gini_normalized():
    assert metrics.gini([0.5, 0.5, 0.5]) == 0.0
    assert metrics.gini([1.0, 0.0, 0.0]) == pytest.approx(1.0)
    assert metrics.gini([0.0, 0.0]) == 0.0
    assert metrics.gini([0.3]) == 0.0


def test_pairing_exact_respects_one_pair_per_member_and_criticality():
    m = {"a": {"k1": 0.9, "k2": 0.9}, "b": {}, "c": {}}
    pairs = metrics.suggest_pairs(m, ["a", "b", "c"], ["k1", "k2"], {"k1": 3, "k2": 1}, 0.7)
    assert len(pairs) == 1
    p = pairs[0]
    assert p.explainer == "a" and p.kc == "k1" and p.gain == pytest.approx(3.0)


def test_pairing_saturates_at_target():
    m = {"a": {"k1": 0.9}, "b": {"k1": 0.9}, "c": {}, "d": {}}
    assert metrics.suggest_pairs(m, list(m), ["k1"], {"k1": 1}, 0.7) == []


def test_pairing_greedy_fallback_for_large_team():
    m = {f"u{i}": ({"k1": 0.9} if i == 0 else {}) for i in range(8)}
    pairs = metrics.suggest_pairs(m, list(m), ["k1"], {"k1": 1}, 0.7)
    assert len(pairs) == 1 and pairs[0].explainer == "u0"
    assert math.isclose(pairs[0].gain, 1.0)
