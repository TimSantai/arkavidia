from decimal import Decimal
from uuid import uuid4

import pytest
from pydantic import BaseModel

from app import billing
from app.ai import prompts
from app.errors import AIUnavailable, InvalidAIOutput, PolicyDenied, QuotaExceeded
from app.gateway.base import DataLabels, NullRecorder, Route, TeamContext
from app.gateway.fake import FakeProvider
from app.gateway.providers import HashingEmbedder
from app.gateway.router import Gateway, parse_json_object


class Out(BaseModel):
    answer: str


def _gw(*providers, recorder=None, replay=False):
    routes = {"default": [Route(p, "m") for p in providers]}
    return Gateway({"free": routes, "pro": routes}, HashingEmbedder(768),
                   recorder or NullRecorder(), replay=replay)


PROMPT = prompts.RenderedPrompt("t@v1", [{"role": "user", "content": "hai"}], {})
TEAM = TeamContext(uuid4(), "free")


async def test_fallback_to_second_provider():
    bad = FakeProvider("a", fail_tasks={"*"})
    good = FakeProvider("b", handlers={"x": lambda p, t, i: {"answer": "ok"}})
    rec = NullRecorder()
    res = await _gw(bad, good, recorder=rec).structured("x", PROMPT, Out, team=TEAM)
    assert res.value.answer == "ok" and res.provider == "b"
    assert [r.status for r in rec.records] == ["error", "ok"]


async def test_all_providers_fail():
    with pytest.raises(AIUnavailable):
        await _gw(FakeProvider(fail_tasks={"*"})).structured("x", PROMPT, Out, team=TEAM)


async def test_invalid_output_retries_once_then_fails():
    calls = []

    def h(p, t, i):
        calls.append(i)
        return "bukan json" if len(calls) == 1 else {"answer": "pulih"}

    res = await _gw(FakeProvider(handlers={"x": h})).structured("x", PROMPT, Out, team=TEAM)
    assert res.value.answer == "pulih" and len(calls) == 2
    with pytest.raises(InvalidAIOutput):
        await _gw(FakeProvider(handlers={"x": lambda p, t, i: "{}"})).structured(
            "x", PROMPT, Out, team=TEAM)


async def test_free_tier_data_rule():
    gw = _gw(FakeProvider(handlers={"x": lambda p, t, i: {"answer": "a"}}))
    with pytest.raises(PolicyDenied):
        await gw.structured("x", PROMPT, Out, team=TEAM, labels=DataLabels(has_private=True))
    res = await gw.structured("x", PROMPT, Out, team=TeamContext(uuid4(), "pro"),
                              labels=DataLabels(has_private=True))
    assert res.value.answer == "a"


async def test_quota_and_replay():
    class FullRecorder(NullRecorder):
        async def tokens_used_today(self, team_id):
            return 10, 10

    with pytest.raises(QuotaExceeded):
        await _gw(FakeProvider(), recorder=FullRecorder()).structured("x", PROMPT, Out, team=TEAM)

    rec = NullRecorder()
    live = FakeProvider(handlers={"x": lambda p, t, i: {"answer": "rekam"}})
    await _gw(live, recorder=rec).structured("x", PROMPT, Out, team=TEAM)
    dead = FakeProvider(fail_tasks={"*"})
    res = await _gw(dead, recorder=rec, replay=True).structured("x", PROMPT, Out, team=TEAM)
    assert res.value.answer == "rekam" and res.provider == "replay"


def test_parse_json_with_fence():
    assert parse_json_object('```json\n{"a": 1}\n```') == {"a": 1}
    assert parse_json_object('Berikut: {"a": 2} selesai') == {"a": 2}


async def test_hashing_embedder_dim_and_similarity():
    e = HashingEmbedder(768)
    a, b, c = await e.embed(["pakai supabase untuk auth", "supabase untuk auth", "makan siang"])
    assert len(a) == 768
    dot = lambda x, y: sum(i * j for i, j in zip(x, y, strict=True))  # noqa: E731
    assert dot(a, b) > dot(a, c)


PRICE = billing.Price(None, Decimal("0.30"), Decimal("2.50"), Decimal("16500"), Decimal("1.05"),
                      Decimal("0.30"), Decimal("1"))


def test_price_formulas():
    # c = (1000*0.30 + 500*2.50)/1e6 = 0.00155 USD -> *1.3*16500*1.05 = 34.91 + 1 -> ceil 36
    assert billing.provider_cost_usd(PRICE, 1000, 500) == Decimal("0.00155")
    assert billing.team_price_idr(PRICE, 1000, 500) == 36
    hold = billing.hold_amount_idr(PRICE, 1000, 1500)
    assert hold >= billing.team_price_idr(PRICE, 1000, 500)


def test_ledger_sign_convention_nets_to_minus_p():
    h, p = 120, 36
    entries = [{"entry_type": "hold", "amount_idr": -h}, {"entry_type": "release", "amount_idr": h},
               {"entry_type": "charge", "amount_idr": -p}]
    assert sum(e["amount_idr"] for e in entries) == -p
