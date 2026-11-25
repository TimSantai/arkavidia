import {
  CURRENT_USER,
  SEED_BRIEFING_STEPS,
  SEED_CHECK_ATTEMPTS,
  SEED_KCS,
  SEED_MASTERY,
  SEED_MEMORY_ITEMS,
  SEED_PRIVATE_MESSAGES,
  SEED_QUESTIONS,
  SEED_TEAM_MESSAGES,
  SEED_TEAMS,
  SEED_USERS,
} from "@/mocks/seedData"
import type {
  BriefingStep,
  ChatMessage,
  CheckAttempt,
  ExplainBackQuestion,
  KcCoverageSummary,
  MasteryRecord,
  MemoryItem,
  PairingSuggestion,
  PassportPreview,
  PiiMatch,
  Team,
  TeamUnderstandingMetrics,
} from "@/types/bersama"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"
const MASTERY_THRESHOLD = 0.7

// In-memory mutable reference holding immutable arrays for seamless local prototype interaction
let teamMessagesStore: readonly ChatMessage[] = SEED_TEAM_MESSAGES
let privateMessagesStore: readonly ChatMessage[] = SEED_PRIVATE_MESSAGES
let memoryItemsStore: readonly MemoryItem[] = SEED_MEMORY_ITEMS
let masteryStore: readonly MasteryRecord[] = SEED_MASTERY
let checkAttemptsStore: readonly CheckAttempt[] = SEED_CHECK_ATTEMPTS

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`)
  }
  return (await response.json()) as T
}

function computeGini(values: readonly number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const total = sorted.reduce((acc, v) => acc + v, 0)
  if (total === 0) return 0
  const weightedSum = sorted.reduce(
    (acc, val, idx) => acc + (2 * (idx + 1) - sorted.length - 1) * val,
    0,
  )
  return Number((weightedSum / (sorted.length * total)).toFixed(2))
}

function detectIndonesianPii(text: string): {
  redacted: string
  matches: readonly PiiMatch[]
} {
  const matches: PiiMatch[] = []
  let redacted = text

  const phoneRegex = /(\+62|08)[0-9\-\s]{8,14}/g
  redacted = redacted.replace(phoneRegex, (match) => {
    matches.push({ kind: "phone", original: match, redacted: "[NO_HP_DISAMARKAN]" })
    return "[NO_HP_DISAMARKAN]"
  })

  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
  redacted = redacted.replace(emailRegex, (match) => {
    matches.push({ kind: "email", original: match, redacted: "[EMAIL_DISAMARKAN]" })
    return "[EMAIL_DISAMARKAN]"
  })

  const nikRegex = /\b\d{16}\b/g
  redacted = redacted.replace(nikRegex, (match) => {
    matches.push({ kind: "nik", original: match, redacted: "[NIK_DISAMARKAN]" })
    return "[NIK_DISAMARKAN]"
  })

  return { redacted, matches }
}

export const bersamaApi = {
  async getTeams(): Promise<readonly Team[]> {
    if (!USE_MOCK) return requestJson<readonly Team[]>("/teams")
    return SEED_TEAMS
  },

  async getTeamById(teamId: string): Promise<Team | undefined> {
    const teams = await this.getTeams()
    return teams.find((t) => t.id === teamId) ?? teams[0]
  },

  async getTeamMessages(teamId: string): Promise<readonly ChatMessage[]> {
    if (!USE_MOCK) return requestJson<readonly ChatMessage[]>(`/teams/${teamId}/messages?room=team`)
    return teamMessagesStore.filter((m) => m.teamId === teamId)
  },

  async getPrivateMessages(teamId: string): Promise<readonly ChatMessage[]> {
    if (!USE_MOCK) return requestJson<readonly ChatMessage[]>(`/teams/${teamId}/messages?room=private`)
    return privateMessagesStore.filter((m) => m.teamId === teamId)
  },

  async sendTeamMessage(teamId: string, body: string): Promise<readonly ChatMessage[]> {
    if (!USE_MOCK) {
      return requestJson<readonly ChatMessage[]>(`/teams/${teamId}/messages`, {
        method: "POST",
        body: JSON.stringify({ room: "team", body }),
      })
    }

    const userMsg: ChatMessage = {
      id: `msg-team-${Date.now()}`,
      teamId,
      room: "team",
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      isAgent: false,
      body,
      createdAt: new Date().toISOString(),
      scope: "team",
    }
    teamMessagesStore = [...teamMessagesStore, userMsg]

    // Simulate IFC Guardrail when someone asks Team Agent about another member's M1 Private Space
    if (/ruang pribadi|memori pribadi|catatan pribadi/i.test(body)) {
      const blockedReply: ChatMessage = {
        id: `msg-team-ifc-${Date.now() + 1}`,
        teamId,
        room: "team",
        authorId: "agent-team",
        authorName: "Team Agent",
        isAgent: true,
        agentKind: "team",
        body: "Akses ditolak oleh Information-Flow Control (RLS + Cedar Policy). Team Agent hanya dapat membaca memori tim terkonfirmasi (M2) dan tidak memiliki akses ke Ruang Pribadi (M1) anggota mana pun.",
        createdAt: new Date().toISOString(),
        scope: "team",
        policyBlocked: true,
      }
      teamMessagesStore = [...teamMessagesStore, blockedReply]
    }

    return teamMessagesStore.filter((m) => m.teamId === teamId)
  },

  async askPersonalAgent(teamId: string, body: string): Promise<readonly ChatMessage[]> {
    if (!USE_MOCK) {
      return requestJson<readonly ChatMessage[]>("/agents/me/ask", {
        method: "POST",
        body: JSON.stringify({ team_id: teamId, body }),
      })
    }

    const userMsg: ChatMessage = {
      id: `msg-priv-${Date.now()}`,
      teamId,
      room: "private",
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      isAgent: false,
      body,
      createdAt: new Date().toISOString(),
      scope: "private",
      taintedPrivate: true,
    }

    const agentReply: ChatMessage = {
      id: `msg-priv-ai-${Date.now() + 1}`,
      teamId,
      room: "private",
      authorId: "agent-personal",
      authorName: `Personal Agent (${CURRENT_USER.name.split(" ")[0]})`,
      isAgent: true,
      agentKind: "personal",
      body: "Berdasarkan memori tim M2 (DEC-01 MVC & DEC-02 JWT) dan catatan pribadimu (M1), perubahan terbaru yang paling menyangkut tugasmu adalah penambahan refresh token pada modul login. Respons ini berlabel `M1 PRIVATE` dan tidak dibagikan ke tim tanpa Context Passport.",
      createdAt: new Date().toISOString(),
      scope: "private",
      taintedPrivate: true,
    }

    privateMessagesStore = [...privateMessagesStore, userMsg, agentReply]
    return privateMessagesStore.filter((m) => m.teamId === teamId)
  },

  async previewPassport(sourceMessageId: string, rawText: string): Promise<PassportPreview> {
    if (!USE_MOCK) {
      return requestJson<PassportPreview>("/passport/preview", {
        method: "POST",
        body: JSON.stringify({ source_message_id: sourceMessageId, text: rawText }),
      })
    }

    const { redacted, matches } = detectIndonesianPii(rawText)
    return {
      sourceMessageId,
      originalText: rawText,
      redactedSummary: redacted,
      detectedPii: matches,
      suggestedTitle: "Ringkasan dari Ruang Pribadi",
      suggestedRationale: "Dibagikan secara selektif setelah penyamaran PII dan persetujuan pemilik.",
      targetKcId: "kc-mvc",
    }
  },

  async sharePassport(teamId: string, preview: PassportPreview): Promise<MemoryItem> {
    if (!USE_MOCK) {
      return requestJson<MemoryItem>("/passport/share", {
        method: "POST",
        body: JSON.stringify({ team_id: teamId, ...preview }),
      })
    }

    const newItem: MemoryItem = {
      id: `mem-passport-${Date.now()}`,
      code: `DEC-0${memoryItemsStore.length + 1}`,
      teamId,
      type: "decision",
      content: {
        title: preview.suggestedTitle,
        summary: preview.redactedSummary,
        rationale: preview.suggestedRationale,
        rejectedAlternatives: [],
        assigneeId: CURRENT_USER.id,
      },
      ownerId: CURRENT_USER.id,
      scope: "team",
      sensitivity: "normal",
      status: "proposed",
      aiAssisted: false,
      provenance: `Dibagikan oleh ${CURRENT_USER.name.split(" ")[0]} dari Ruang Pribadi (Context Passport)`,
      kcIds: [preview.targetKcId],
      sourceMessageIds: [preview.sourceMessageId],
      validFrom: new Date().toISOString(),
      validTo: null,
      recordedAt: new Date().toISOString(),
    }

    memoryItemsStore = [newItem, ...memoryItemsStore]
    return newItem
  },

  async getProjectBrain(teamId: string, asOf?: string): Promise<readonly MemoryItem[]> {
    if (!USE_MOCK) {
      const query = asOf ? `?as_of=${encodeURIComponent(asOf)}` : ""
      return requestJson<readonly MemoryItem[]>(`/teams/${teamId}/brain${query}`)
    }

    const items = memoryItemsStore.filter((item) => item.teamId === teamId)
    if (!asOf) return items
    const targetTime = new Date(asOf).getTime()
    return items.filter((item) => {
      const from = new Date(item.validFrom).getTime()
      const to = item.validTo ? new Date(item.validTo).getTime() : Number.POSITIVE_INFINITY
      return from <= targetTime && targetTime < to
    })
  },

  async confirmMemoryItem(memoryId: string): Promise<MemoryItem | undefined> {
    if (!USE_MOCK) {
      return requestJson<MemoryItem>(`/memory/${memoryId}/confirm`, { method: "POST" })
    }

    let updated: MemoryItem | undefined
    memoryItemsStore = memoryItemsStore.map((item) => {
      if (item.id !== memoryId) return item
      updated = { ...item, status: "confirmed" }
      return updated
    })
    return updated
  },

  async getNextCheck(): Promise<ExplainBackQuestion> {
    if (!USE_MOCK) return requestJson<ExplainBackQuestion>("/checks/next")
    return SEED_QUESTIONS[0]
  },

  async getAllChecks(): Promise<readonly ExplainBackQuestion[]> {
    return SEED_QUESTIONS
  },

  async getCheckAttempts(): Promise<readonly CheckAttempt[]> {
    return checkAttemptsStore
  },

  async submitCheckAnswer(
    questionId: string,
    answer: string,
    inputMode: "text" | "voice",
  ): Promise<CheckAttempt> {
    if (!USE_MOCK) {
      return requestJson<CheckAttempt>(`/checks/${questionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ answer, input_mode: inputMode }),
      })
    }

    const question = SEED_QUESTIONS.find((q) => q.id === questionId) ?? SEED_QUESTIONS[0]
    const lower = answer.toLowerCase()
    const isAmbiguous = answer.trim().length < 25 || /mungkin|kurang yakin|entah/i.test(lower)
    const isStrong =
      (lower.includes("stateless") || lower.includes("mobile") || lower.includes("ram")) &&
      answer.trim().length >= 35

    const attempt: CheckAttempt = isAmbiguous
      ? {
          id: `att-${Date.now()}`,
          userId: CURRENT_USER.id,
          questionId,
          answer,
          inputMode,
          grade: null,
          gradeLabel: "abstain",
          uncertainty: 0.42,
          abstained: true,
          gradedBy: "peer",
          assignedPeerId: question.decisionAuthorId,
          feedback:
            "Ketidakpastian grader (s = 0.42) melampaui ambang conformal risk. AI abstain dan meneruskan pertanyaan ini ke penulis keputusan untuk sesi penjelasan singkat.",
          createdAt: new Date().toISOString(),
        }
      : {
          id: `att-${Date.now()}`,
          userId: CURRENT_USER.id,
          questionId,
          answer,
          inputMode,
          grade: isStrong ? 2 : 1,
          gradeLabel: isStrong ? "paham" : "sebagian",
          uncertainty: isStrong ? 0.08 : 0.16,
          abstained: false,
          gradedBy: "ai",
          feedback: isStrong
            ? "Penjelasan kuat dan tepat sasaran! Probabilitas penguasaan P(L) kamu pada KC ini diperbarui."
            : "Sudah menangkap sebagian inti, namun tambahkan trade-off terhadap alternatif yang ditolak tim.",
          createdAt: new Date().toISOString(),
        }

    checkAttemptsStore = [attempt, ...checkAttemptsStore]

    if (attempt.grade === 2) {
      masteryStore = masteryStore.map((m) =>
        m.userId === CURRENT_USER.id && m.kcId === question.kcId
          ? { ...m, pMastery: Math.min(0.95, Number((m.pMastery + 0.35).toFixed(2))), lastEvidenceAt: new Date().toISOString() }
          : m,
      )
    }

    return attempt
  },

  async getTeamUnderstanding(teamId: string): Promise<TeamUnderstandingMetrics> {
    if (!USE_MOCK) {
      return requestJson<TeamUnderstandingMetrics>(`/teams/${teamId}/understanding`)
    }

    const coverageByKc: KcCoverageSummary[] = SEED_KCS.map((kc) => {
      const records = masteryStore.filter((m) => m.kcId === kc.id)
      const experts = records
        .filter((r) => r.pMastery >= MASTERY_THRESHOLD)
        .map((r) => SEED_USERS.find((u) => u.id === r.userId))
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
      const needsSupport = records
        .filter((r) => r.pMastery < MASTERY_THRESHOLD)
        .map((r) => SEED_USERS.find((u) => u.id === r.userId))
        .filter((u): u is NonNullable<typeof u> => Boolean(u))
      const averageMastery =
        records.reduce((sum, r) => sum + r.pMastery, 0) / Math.max(1, records.length)

      return {
        kc,
        understoodCount: experts.length,
        totalMembers: SEED_USERS.length,
        averageMastery: Number(averageMastery.toFixed(2)),
        isSilo: experts.length <= 1,
        experts,
        needsSupport,
      }
    })

    const pairingSuggestions: PairingSuggestion[] = coverageByKc
      .filter((c) => c.experts.length > 0 && c.needsSupport.length > 0)
      .slice(0, 2)
      .map((c, idx) => ({
        id: `pair-${idx + 1}`,
        kcId: c.kc.id,
        kcName: c.kc.name,
        mentor: c.experts[0],
        learner: c.needsSupport[0],
        durationMinutes: 10,
        projectedCoverageBefore: `${c.understoodCount}/${c.totalMembers}`,
        projectedCoverageAfter: `${Math.min(c.totalMembers, c.understoodCount + 1)}/${c.totalMembers}`,
        reason: `${c.experts[0].name.split(" ")[0]} dapat membantu menjelaskan ${c.kc.name} ke ${c.needsSupport[0].name.split(" ")[0]} untuk menaikkan coverage tim terbesar.`,
      }))

    const totalUnderstood = coverageByKc.reduce((acc, c) => acc + c.understoodCount, 0)
    const totalCells = coverageByKc.length * SEED_USERS.length
    const hasHighCriticalitySilo = coverageByKc.some(
      (c) => c.kc.criticality === "high" && c.isSilo,
    )

    return {
      teamId,
      masteryThreshold: MASTERY_THRESHOLD,
      busFactor: hasHighCriticalitySilo ? 1 : 2,
      giniCoefficient: computeGini(masteryStore.map((m) => m.pMastery)),
      overallCoveragePercent: Math.round((totalUnderstood / Math.max(1, totalCells)) * 100),
      coverageByKc,
      pairingSuggestions,
      masteryMatrix: masteryStore,
    }
  },

  async getBriefingSteps(): Promise<readonly BriefingStep[]> {
    return SEED_BRIEFING_STEPS
  },
}
