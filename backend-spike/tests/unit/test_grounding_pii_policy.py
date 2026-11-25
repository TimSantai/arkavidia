from datetime import UTC, datetime
from uuid import uuid4

import pytest

from app import policy, retrieval
from app.ai import pii
from app.ai.grounding import normalize, verify_grounding
from app.ai.schemas import Candidate, ChatMessage, ContextItem, Evidence, MemoryType, Scope, Sensitivity


def _msg(body):
    return ChatMessage(id=uuid4(), author_id=uuid4(), body=body, created_at=datetime.now(UTC))


def test_normalize():
    assert normalize("  Kita   PAKAI  “Supabase”\n") == 'kita pakai "supabase"'


def test_grounding_drops_unsupported_and_fabricated_fields():
    m = _msg("Oke kita pakai Supabase karena RLS-nya bawaan.")
    c = Candidate(type=MemoryType.DECISION,
                  content={"title": "Pakai Supabase", "chosen_option": "Supabase",
                           "rationale": "lebih murah", "pic_user_id": str(uuid4())},
                  evidence=[Evidence(field="title", message_id=m.id, quote="kita pakai Supabase"),
                            Evidence(field="chosen_option", message_id=m.id, quote="Supabase"),
                            Evidence(field="rationale", message_id=m.id, quote="lebih murah")])
    g = verify_grounding(c, {m.id: m})
    assert g.valid
    assert set(g.dropped_fields) == {"rationale", "pic_user_id"}
    assert "rationale" not in g.candidate.content


def test_grounding_rejects_unknown_message_and_missing_required():
    m = _msg("kita pakai Postgres")
    c = Candidate(type=MemoryType.DECISION, content={"title": "x", "chosen_option": "Postgres"},
                  evidence=[Evidence(field="title", message_id=uuid4(), quote="kita pakai Postgres"),
                            Evidence(field="chosen_option", message_id=m.id, quote="Postgres")])
    g = verify_grounding(c, {m.id: m})
    assert not g.valid and "title" in g.reason


def test_pii_scan_and_mask():
    text = "Hubungi 0812-3456-7890 atau +6281234567890, email rani@kampus.ac.id, NIK 3273012345678901."
    kinds = [s.kind for s in pii.scan(text)]
    assert kinds == ["phone", "phone", "email", "nik"]
    masked = pii.mask(text, pii.scan(text))
    assert "0812" not in masked and "rani@" not in masked and "3273" not in masked
    assert masked.count("[TELEPON]") == 2


def test_pii_names_and_no_false_positive_on_short_numbers():
    assert pii.scan("rapat jam 08 tanggal 12") == []
    spans = pii.scan("Tanya Pak Budi Santoso dulu", names=["Budi Santoso"])
    assert [s.kind for s in spans] == ["name"]


def _ci(scope, owner=None, team=None, sens=Sensitivity.NORMAL):
    return ContextItem(item_id=uuid4(), team_id=team, scope=scope, owner_id=owner,
                       type=MemoryType.NOTE, text="x", sensitivity=sens)


def test_policy_matrix():
    me, other, team = uuid4(), uuid4(), uuid4()
    mine = _ci(Scope.PRIVATE, me, team)
    theirs = _ci(Scope.PRIVATE, other, team)
    shared = _ci(Scope.TEAM, other, team)
    foreign = _ci(Scope.TEAM, other, uuid4())
    kw = {"user_id": me, "team_id": team, "member_team_ids": [team]}
    P, T = policy.AgentKind.PERSONAL, policy.AgentKind.TEAM
    assert policy.authorize_context_item(agent=P, item=mine, **kw).allowed
    assert not policy.authorize_context_item(agent=T, item=mine, **kw).allowed
    assert not policy.authorize_context_item(agent=P, item=theirs, **kw).allowed
    assert policy.authorize_context_item(agent=T, item=shared, **kw).allowed
    assert not policy.authorize_context_item(agent=P, item=foreign, **kw).allowed


def test_free_tier_strips_private_and_pii():
    me, team = uuid4(), uuid4()
    items = [_ci(Scope.PRIVATE, me, team), _ci(Scope.TEAM, me, team, Sensitivity.PII),
             _ci(Scope.TEAM, me, team)]
    kept, denied = policy.filter_bundle(user_id=me, team_id=team, member_team_ids=[team],
                                        agent=policy.AgentKind.PERSONAL, tier="free", items=items)
    assert len(kept) == 1 and len(denied) == 2
    kept_pro, _ = policy.filter_bundle(user_id=me, team_id=team, member_team_ids=[team],
                                       agent=policy.AgentKind.PERSONAL, tier="pro", items=items)
    assert len(kept_pro) == 3


def test_taint_is_computed_from_bundle():
    me, team = uuid4(), uuid4()
    assert policy.compute_taint([_ci(Scope.TEAM, me, team)]) == policy.Taint.NONE
    assert policy.compute_taint([_ci(Scope.TEAM, me, team), _ci(Scope.PRIVATE, me, team)]) \
        == policy.Taint.PRIVATE
    assert not policy.authorize_post_to_team(policy.Taint.PRIVATE).allowed


def test_rrf_and_pack():
    a, b, c = uuid4(), uuid4(), uuid4()
    fused = retrieval.rrf([[a, b], [b, c]])
    assert fused[0][0] == b
    assert fused[0][1] == pytest.approx(1 / 62 + 1 / 61)
    items = [ContextItem(item_id=uuid4(), team_id=uuid4(), scope=Scope.TEAM, type=MemoryType.NOTE,
                         text="x" * 400) for _ in range(3)]
    assert len(retrieval.pack(items, 250)) == 2

