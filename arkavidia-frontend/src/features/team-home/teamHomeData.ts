import { SEED_KCS, SEED_USERS } from "@/mocks/seedData"
import type { KnowledgeComponent, User } from "@/types/bersama"

export interface WeeklyTask {
  readonly id: string
  readonly kind: "explain-back" | "pairing" | "confirm-decision"
  readonly title: string
  readonly meta: string
  readonly statBig: string
  readonly statLabel: string
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

export const KC_SHORT_LABELS: Record<string, string> = {
  "all": "Semua",
  "kc-mvc": "MVC",
  "kc-jwt": "JWT",
  "kc-db": "Skema DB",
  "kc-api": "REST",
}

export const TEAM_HOME_KCS: readonly KnowledgeComponent[] = [
  ...SEED_KCS,
  {
    id: "kc-orm",
    teamId: "team-pbo-01",
    code: "KC-05",
    name: "DAO & Transaksi",
    description: "Pengelolaan isolasi transaksi dan rollback otomatis saat persistensi gagal.",
    criticality: "medium",
  },
  {
    id: "kc-test",
    teamId: "team-pbo-01",
    code: "KC-06",
    name: "Unit Testing",
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
      title: "Jelaskan ulang DEC-02",
      meta: "Tenggat Jumat · ≤ 5 menit",
      statBig: "0/3",
      statLabel: "pertanyaan",
      kcId: "kc-jwt",
      to: `/teams/${teamId}/check`,
      cta: "Mulai 3 pertanyaan",
    },
    {
      id: "task-pair-01",
      kind: "pairing",
      title: "Pairing JWT dengan Dimas",
      meta: "Jadwal fleksibel · 15 menit",
      statBig: "10 mnt",
      statLabel: "estimasi",
      kcId: "kc-jwt",
      people: ["user-dimas"],
      to: `/teams/${teamId}/understanding`,
      cta: "Jadwalkan dengan Dimas",
    },
    {
      id: "task-dec-01",
      kind: "confirm-decision",
      title: "Tinjau usulan DEC-03",
      meta: "Tenggat Senin · 10 menit",
      statBig: "2 alternatif",
      statLabel: "ditinjau",
      kcId: "kc-db",
      to: `/teams/${teamId}/brain`,
      cta: "Tinjau usulan DEC-03",
    },
  ]
}

export function getDecisionProgressList(): readonly DecisionProgress[] {
  return [
    {
      id: "DEC-01",
      title: "Pola arsitektur MVC untuk pemisahan Model, View & Controller",
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
