"""Fungsi worker AI (kontrak Abu -> Rifki). Murni terhadap database: hanya memakai gateway."""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from uuid import UUID

from app.ai import conformal, prompts
from app.ai.grounding import verify_grounding
from app.ai.irt import BLOOM_TO_B
from app.ai.schemas import (
    AgentAnswerOutput,
    AnswerabilityOutput,
    BriefingOutput,
    ChatMessage,
    ContextItem,
    ExtractionOutput,
    GeneratedQuestion,
    GradeSample,
    GroundedCandidate,
    KCTagOutput,
    Member,
    QGenOutput,
    Scope,
    Sensitivity,
)
from app.gateway.base import DataLabels, TeamContext
from app.gateway.router import Gateway


@dataclass(frozen=True, slots=True)
class ExtractResult:
    grounded: list[GroundedCandidate]
    prompt_version: str
    model: str


async def extract(gw: Gateway, team: TeamContext, messages: Sequence[ChatMessage],
                  members: Sequence[Member], existing_titles: Sequence[str]) -> ExtractResult:
    prompt = prompts.extract(
        [m.model_dump(mode="json") for m in messages],
        [m.model_dump(mode="json") for m in members], list(existing_titles))
    # Pesan Ruang Tim adalah M2. Tidak ada M1 di jalur ini.
    res = await gw.structured("extract", prompt, ExtractionOutput, team=team, temperature=0.0)
    by_id = {m.id: m for m in messages}
    grounded = [verify_grounding(c, by_id) for c in res.value.candidates]
    return ExtractResult(grounded, res.prompt_version, f"{res.provider}/{res.model}")


def cosine(a: Sequence[float], b: Sequence[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return 0.0 if na == 0 or nb == 0 else dot / (na * nb)


DEDUPE_THRESHOLD = 0.85  # [SPECULATIVE] setel pada data seed


def dedupe(vector: Sequence[float], neighbors: Sequence[tuple[UUID, Sequence[float]]],
           threshold: float = DEDUPE_THRESHOLD) -> tuple[str, UUID | None, float]:
    best_id, best_sim = None, -1.0
    for nid, nvec in neighbors:
        sim = cosine(vector, nvec)
        if sim > best_sim:
            best_id, best_sim = nid, sim
    if best_id is not None and best_sim >= 0.98:
        return "duplicate", best_id, best_sim
    if best_id is not None and best_sim >= threshold:
        return "update", best_id, best_sim
    return "new", None, best_sim


async def tag_kc(gw: Gateway, team: TeamContext, item_text: str,
                 existing: Sequence[str]) -> KCTagOutput:
    res = await gw.structured("tag_kc", prompts.tag_kc(item_text, list(existing)), KCTagOutput,
                              team=team)
    return res.value


@dataclass(frozen=True, slots=True)
class QuestionDraft:
    question: GeneratedQuestion
    answerable: bool
    irt_a: float
    irt_b: float
    prompt_version: str


async def generate_questions(gw: Gateway, team: TeamContext, item: dict, kc_name: str,
                             evidence_quotes: Sequence[str], has_dependency: bool
                             ) -> list[QuestionDraft]:
    levels = [1, 2, 3] if has_dependency else [1, 2]
    res = await gw.structured("qgen", prompts.qgen(item, kc_name, levels), QGenOutput, team=team)
    drafts = []
    for q in res.value.questions:
        chk = await gw.structured(
            "answerable", prompts.answerable(q.stem, q.reference_answer, list(evidence_quotes)),
            AnswerabilityOutput, team=team)
        drafts.append(QuestionDraft(q, chk.value.answerable, 1.0, BLOOM_TO_B[q.bloom_level],
                                    res.prompt_version))
    return drafts


@dataclass(frozen=True, slots=True)
class GradeResult:
    ai_grade: int
    sample_grades: list[int]
    uncertainty: float
    abstained: bool
    feedback: str
    lambda_used: float | None
    prompt_version: str


async def grade(gw: Gateway, team: TeamContext, *, stem: str, rubric: list[dict],
                reference_answer: str, answer: str, k: int, lam: float | None) -> GradeResult:
    prompt = prompts.grade(stem, rubric, reference_answer, answer)
    temperature = 0.7 if k > 1 else 0.0
    samples = await gw.samples("grade", prompt, GradeSample, k, team=team,
                               temperature=temperature)
    grades = [s.value.grade for s in samples]
    summary = conformal.summarize(grades)
    feedback = next((s.value.feedback for s in samples if s.value.grade == summary.grade), "")
    abstained = not conformal.accept(summary.uncertainty, lam)
    return GradeResult(summary.grade, grades, summary.uncertainty, abstained, feedback, lam,
                       prompt.prompt_id)


def labels_for(bundle: Sequence[ContextItem]) -> DataLabels:
    return DataLabels(
        has_private=any(i.scope == Scope.PRIVATE for i in bundle),
        has_pii=any(i.sensitivity == Sensitivity.PII for i in bundle),
    )


async def answer(gw: Gateway, team: TeamContext, *, kind: str, question: str,
                 bundle: Sequence[ContextItem], mastery_summary: list[str] | None = None
                 ) -> AgentAnswerOutput:
    rows = [{"item_id": str(i.item_id), "scope": i.scope.value, "text": i.text} for i in bundle]
    res = await gw.structured("agent", prompts.agent(kind, question, rows, mastery_summary),
                              AgentAnswerOutput, team=team, labels=labels_for(bundle))
    allowed = {i.item_id for i in bundle}
    value = res.value
    cited = [c for c in value.cited_item_ids if c in allowed]  # buang sitasi karangan
    return value.model_copy(update={"cited_item_ids": cited})


async def briefing_turn(gw: Gateway, team: TeamContext, history: list[dict[str, str]],
                        bundle: Sequence[ContextItem]) -> BriefingOutput:
    rows = [{"item_id": str(i.item_id), "text": i.text} for i in bundle]
    res = await gw.structured("briefing", prompts.briefing(history, rows), BriefingOutput,
                              team=team, labels=labels_for(bundle))
    allowed = {i.item_id for i in bundle}
    return res.value.model_copy(
        update={"cited_item_ids": [c for c in res.value.cited_item_ids if c in allowed]})
