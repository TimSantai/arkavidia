"""Kontrak data modul AI (docs/blueprint/03-kontrak-api.md bagian 4).

Semua fungsi di `app.ai` murni: tidak membaca database. Input berupa konteks yang sudah
lolos policy, output berupa objek bertipe di bawah ini.
"""

from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MemoryType(StrEnum):
    DECISION = "decision"
    TASK = "task"
    RATIONALE = "rationale"
    NOTE = "note"


class Scope(StrEnum):
    PRIVATE = "private"
    TEAM = "team"


class Sensitivity(StrEnum):
    NORMAL = "normal"
    PII = "pii"


class _Strict(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


class ChatMessage(_Strict):
    id: UUID
    author_id: UUID | None
    author_name: str = "anggota"
    body: str
    created_at: datetime


class Member(_Strict):
    id: UUID
    name: str


class Evidence(_Strict):
    field: str
    message_id: UUID
    quote: str = Field(min_length=1)


class Alternative(_Strict):
    option: str
    reason: str | None = None


class DecisionContent(_Strict):
    title: str = Field(min_length=1, max_length=200)
    chosen_option: str | None = None
    rationale: str | None = None
    alternatives_rejected: list[Alternative] = Field(default_factory=list)
    pic_user_id: UUID | None = None
    due_date: date | None = None


class Candidate(_Strict):
    type: MemoryType
    content: dict[str, Any]
    evidence: list[Evidence] = Field(default_factory=list)
    kc_names: list[str] = Field(default_factory=list)


class ExtractionOutput(_Strict):
    candidates: list[Candidate] = Field(default_factory=list)


class GroundedCandidate(_Strict):
    candidate: Candidate
    dropped_fields: list[str]
    valid: bool
    reason: str | None = None


class KCTagOutput(_Strict):
    class Mapping(_Strict):
        kc_name: str = Field(min_length=1, max_length=160)
        is_new: bool = False

    kcs: list[Mapping] = Field(default_factory=list)


class RubricCriterion(_Strict):
    id: str
    description: str


class GeneratedQuestion(_Strict):
    stem: str = Field(min_length=5)
    bloom_level: int = Field(ge=1, le=3)
    reference_answer: str = Field(min_length=1)
    rubric: list[RubricCriterion] = Field(default_factory=list)


class QGenOutput(_Strict):
    questions: list[GeneratedQuestion] = Field(default_factory=list)


class AnswerabilityOutput(_Strict):
    answerable: bool
    reason: str = ""


class GradeSample(_Strict):
    criteria: dict[str, int] = Field(default_factory=dict)
    grade: int = Field(ge=0, le=2)
    feedback: str = ""


class AgentAnswerOutput(_Strict):
    answer: str
    cited_item_ids: list[UUID] = Field(default_factory=list)
    abstained: bool = False


class BriefingOutput(_Strict):
    reply: str
    cited_item_ids: list[UUID] = Field(default_factory=list)


class ContextItem(_Strict):
    """Satu item konteks yang sudah lolos policy, siap dikirim ke LLM."""

    item_id: UUID
    team_id: UUID
    scope: Scope
    sensitivity: Sensitivity = Sensitivity.NORMAL
    owner_id: UUID | None = None
    type: MemoryType
    text: str
    citations: list[Evidence] = Field(default_factory=list)
    score: float = 0.0
