from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app import policy
from app.ai import pipeline
from app.auth import CurrentUser
from app.config import Settings
from app.db import Database, elevate
from app.deps import db, gateway, settings
from app.errors import NotFound, PolicyDenied
from app.gateway.router import Gateway
from app.services.common import audit, require_member, team_context
from app.services.context import build_bundle

router = APIRouter(prefix="/v1", tags=["agents"])
DB = Annotated[Database, Depends(db)]
GW = Annotated[Gateway, Depends(gateway)]
CFG = Annotated[Settings, Depends(settings)]


class AskIn(BaseModel):
    team_id: UUID
    question: str = Field(min_length=2, max_length=1000)


class BriefingIn(BaseModel):
    team_id: UUID
    history: list[dict[str, str]] = Field(default_factory=list, max_length=40)
    message: str = Field(min_length=1, max_length=1000)


async def _ask(kind: policy.AgentKind, body: AskIn, user, database: Database, gw: Gateway,
               cfg: Settings) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, body.team_id)
        team = await team_context(conn, body.team_id, user.user_id)
        bundle = await build_bundle(conn, gw, cfg, user_id=user.user_id, team_id=body.team_id,
                                    tier=team.tier, question=body.question, agent=kind)
        decision = policy.authorize_provider(team.tier, bundle.items)
        if not decision.allowed:  # pertahanan berlapis; filter_bundle seharusnya sudah membuang
            raise PolicyDenied(decision.reason)
        summary = None
        if kind == policy.AgentKind.PERSONAL:
            rows = await conn.fetch(
                """select k.name, m.p_mastery from mastery m join knowledge_components k on k.id = m.kc_id
                   where m.user_id = $1 and k.team_id = $2 order by m.p_mastery""",
                user.user_id, body.team_id)
            summary = [f"{r['name']}: {'paham' if r['p_mastery'] >= cfg.mastery_tau else 'belum'}"
                       for r in rows]
        out = await pipeline.answer(gw, team, kind=kind.value, question=body.question,
                                    bundle=bundle.items, mastery_summary=summary)
        taint = policy.compute_taint(bundle.items)
        by_id = {i.item_id: i for i in bundle.items}
        citations = [{"item_id": str(cid),
                      "quotes": [c.model_dump(mode="json") for c in by_id[cid].citations][:3]}
                     for cid in out.cited_item_ids]
        row = await conn.fetchrow(
            """insert into agent_answers (team_id, user_id, agent, question, answer, citations,
                 taint, context_item_ids, abstained)
               values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id""",
            body.team_id, user.user_id, kind.value, body.question, out.answer, citations,
            taint.value, [i.item_id for i in bundle.items], out.abstained)
        await elevate(conn)
        await audit(conn, team_id=body.team_id, actor=user.user_id, agent=kind.value,
                    action="agent.ask", object_type="agent_answer", object_id=row["id"],
                    allowed=True, reason=f"items={len(bundle.items)} denied={len(bundle.denied)}")
    return {"id": row["id"], "answer": out.answer, "citations": citations, "taint": taint.value,
            "abstained": out.abstained}


@router.post("/agents/me/ask")
async def ask_personal(body: AskIn, user: CurrentUser, database: DB, gw: GW, cfg: CFG) -> dict:
    return await _ask(policy.AgentKind.PERSONAL, body, user, database, gw, cfg)


@router.post("/agents/team/ask")
async def ask_team(body: AskIn, user: CurrentUser, database: DB, gw: GW, cfg: CFG) -> dict:
    return await _ask(policy.AgentKind.TEAM, body, user, database, gw, cfg)


@router.post("/agents/answers/{answer_id}/post", status_code=status.HTTP_201_CREATED)
async def post_answer(answer_id: UUID, user: CurrentUser, database: DB) -> dict:
    async with database.user_tx(user.claims) as conn:
        ans = await conn.fetchrow("select * from agent_answers where id = $1 and user_id = $2",
                                  answer_id, user.user_id)
        if ans is None:
            raise NotFound("Jawaban tidak ditemukan")
        decision = policy.authorize_post_to_team(policy.Taint(ans["taint"]))
        if not decision.allowed:
            await elevate(conn)
            await audit(conn, team_id=ans["team_id"], actor=user.user_id, agent=ans["agent"],
                        action="agent.post", object_type="agent_answer", object_id=answer_id,
                        allowed=False, reason=decision.reason)
            raise PolicyDenied(decision.reason)
        key = f"agent-answer:{answer_id}"
        msg = await conn.fetchrow(
            """insert into messages (team_id, room, author_id, body, client_msg_id)
               values ($1, 'team', $2, $3, $4)
               on conflict (author_id, client_msg_id) do nothing returning id""",
            ans["team_id"], user.user_id, f"[{ans['agent'].title()} Agent] {ans['answer']}", key)
        if msg is None:
            msg = await conn.fetchrow(
                "select id from messages where author_id = $1 and client_msg_id = $2",
                user.user_id, key)
        await conn.execute("update agent_answers set posted_message_id = $1 where id = $2",
                           msg["id"], answer_id)
    return {"message_id": msg["id"]}


@router.post("/briefing/turn")
async def briefing(body: BriefingIn, user: CurrentUser, database: DB, gw: GW, cfg: CFG) -> dict:
    async with database.user_tx(user.claims) as conn:
        await require_member(conn, body.team_id)
        team = await team_context(conn, body.team_id, user.user_id)
        bundle = await build_bundle(conn, gw, cfg, user_id=user.user_id, team_id=body.team_id,
                                    tier=team.tier, question=body.message,
                                    agent=policy.AgentKind.TEAM)
        out = await pipeline.briefing_turn(
            gw, team, [*body.history, {"role": "user", "content": body.message}], bundle.items)
    return {"reply": out.reply, "cited_item_ids": out.cited_item_ids}
