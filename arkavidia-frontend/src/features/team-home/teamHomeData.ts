import { SEED_KCS, SEED_USERS } from "@/mocks/seedData"
import type { KnowledgeComponent, User } from "@/types/bersama"

export interface WeeklyTask {
  readonly id: string
  readonly kind: "explain-back" | "pairing" | "confirm-decision"
  readonly title: string
  readonly meta: string
  readonly kcId: string
  readonly people?: readonly string[]
  readonly to: string
  readonly cta: string
}

export interface DecisionProgress {
  readonly id: string
  readonly title: string
  readonly kcId: string
  readonly changedAt: string
  readonly teamUnderstood: number
  readonly teamTotal: number
  readonly youUnderstood: boolean
}

export interface MyUnderstanding {
  readonly kcId: string
  readonly label: string
  readonly pL: number
}

export interface TeamHealth {
  readonly coverage: number
  readonly busFactor: number
}

export interface UserStats {
  readonly confirmedDecisions: number
  readonly passedExplainBacks: number
  readonly pairingSessions: number
}

/**
 * 6 Knowledge Components for the team home dashboard (matching 4/6 mastered in specification).
 */
export const TEAM_HOME_KCS: readonly KnowledgeComponent[] = [
  ...SEED_KCS,
  {
    id: "kc-orm",
    teamId: "team-pbo-01",
    code: "KC-05",
    name: "DAO & Transaksi Antrean",
    description: "Pengelolaan isolasi transaksi dan rollback otomatis saat persistensi gagal.",
    criticality: "medium",
  },
  {
    id: "kc-test",
    teamId: "team-pbo-01",
    code: "KC-06",
    name: "Unit Testing & Mocking",
    description: "Pengujian unit independen dengan mock service untuk alur antrean.",
    criticality: "low",
  },
]

export function getGreetingTime(date: Date = new Date()): "pagi" | "siang" | "sore" | "malam" {
  const hour = date.getHours()
  if (hour >= 4 && hour < 11) return "pagi"
  if (hour >= 11 && hour < 15) return "siang"
  if (hour >= 15 && hour < 18) return "sore"
  return "malam"
}

export function getWeeklyTasks(teamId: string): readonly WeeklyTask[] {
  return [
    {
      id: "task-eb-01",
      kind: "explain-back",
      title: "Jelaskan ulang DEC-02: Modul login JWT stateless",
      meta: "3 pertanyaan · ≤ 5 menit",
      kcId: "kc-jwt",
      to: `/teams/${teamId}/check`,
      cta: "Mulai",
    },
    {
      id: "task-pair-01",
      kind: "pairing",
      title: "Sesi Pairing: Atasi Silo Autentikasi JWT",
      meta: "Diskusi konsep · 15 menit",
      kcId: "kc-jwt",
      people: ["user-dimas", "user-sari"],
      to: `/teams/${teamId}/understanding`,
      cta: "Jadwalkan",
    },
    {
      id: "task-dec-01",
      kind: "confirm-decision",
      title: "Tinjau Usulan DEC-03: Constraint Database",
      meta: "Usulan baru · 2 alternatif ditolak",
      kcId: "kc-db",
      to: `/teams/${teamId}/brain`,
      cta: "Tinjau",
    },
  ]
}

export function getDecisionProgressList(): readonly DecisionProgress[] {
  return [
    {
      id: "DEC-01",
      title: "Pola arsitektur MVC untuk pemisahan tanggung jawab Model & Controller",
      kcId: "kc-mvc",
      changedAt: "2026-11-24T10:15:00+07:00",
      teamUnderstood: 3,
      teamTotal: 4,
      youUnderstood: true,
    },
    {
      id: "DEC-02",
      title: "Modul login memakai JWT stateless untuk klien web dan mobile",
      kcId: "kc-jwt",
      changedAt: "2026-11-21T14:20:00+07:00",
      teamUnderstood: 1,
      teamTotal: 4,
      youUnderstood: false,
    },
    {
      id: "DEC-03",
      title: "Constraint unik (poli_id, tanggal, nomor_urut) di PostgreSQL",
      kcId: "kc-db",
      changedAt: "2026-11-18T19:00:00+07:00",
      teamUnderstood: 2,
      teamTotal: 4,
      youUnderstood: true,
    },
    {
      id: "DEC-04",
      title: "Standardisasi error response envelope dan status code REST API",
      kcId: "kc-api",
      changedAt: "2026-11-16T11:00:00+07:00",
      teamUnderstood: 2,
      teamTotal: 4,
      youUnderstood: false,
    },
  ]
}

export function getMyUnderstanding(): readonly MyUnderstanding[] {
  // Exactly 4 out of 6 KCs mastered (pL >= 0.70 threshold)
  // KC-01: 0.92 (>= 0.8 -> hijau)
  // KC-02: 0.42 (< 0.5 -> kuning)
  // KC-03: 0.72 (0.5-0.8 -> biru)
  // KC-04: 0.78 (0.5-0.8 -> biru)
  // KC-05: 0.65 (0.5-0.8 -> biru)
  // KC-06: 0.85 (>= 0.8 -> hijau)
  return [
    { kcId: "kc-mvc", label: "KC-01 MVC", pL: 0.92 },
    { kcId: "kc-jwt", label: "KC-02 JWT", pL: 0.42 },
    { kcId: "kc-db", label: "KC-03 DB", pL: 0.72 },
    { kcId: "kc-api", label: "KC-04 API", pL: 0.78 },
    { kcId: "kc-orm", label: "KC-05 DAO", pL: 0.65 },
    { kcId: "kc-test", label: "KC-06 Test", pL: 0.85 },
  ]
}

export const TEAM_HEALTH_DATA: TeamHealth = {
  coverage: 0.71,
  busFactor: 1,
}

export const USER_STATS_DATA: UserStats = {
  confirmedDecisions: 12,
  passedExplainBacks: 5,
  pairingSessions: 3,
}

export function getUserById(id: string): User | undefined {
  return SEED_USERS.find((u) => u.id === id)
}
