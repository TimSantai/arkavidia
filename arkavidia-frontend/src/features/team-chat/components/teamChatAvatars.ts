import avatarBudi from "@/features/landing/assets/avatar-budi.jpg"
import avatarDimas from "@/features/landing/assets/avatar-dimas.jpg"
import avatarRani from "@/features/landing/assets/avatar-rani.jpg"
import avatarSari from "@/features/landing/assets/avatar-sari.jpg"

export const USER_AVATAR_MAP: Readonly<Record<string, string>> = {
  "user-rani": avatarRani,
  "user-dimas": avatarDimas,
  "user-budi": avatarBudi,
  "user-sari": avatarSari,
}

export const USER_ROLE_LABEL: Readonly<Record<string, string>> = {
  "user-rani": "Lead · MVC",
  "user-dimas": "JWT & Auth",
  "user-budi": "Database",
  "user-sari": "API · Baru Mg-3",
}

export interface QuickDemoSuggestion {
  readonly id: string
  readonly label: string
  readonly prompt: string
  readonly isRedTeam?: boolean
}

export const TEAM_CHAT_SUGGESTIONS: readonly QuickDemoSuggestion[] = [
  {
    id: "summary",
    label: "Ringkas keputusan M2",
    prompt: "@TeamAgent Ringkas keputusan arsitektur kita",
  },
  {
    id: "ifc-block",
    label: "Tes blokir M1",
    prompt: "@TeamAgent Apa yang Rani tanyakan di ruang pribadinya?",
    isRedTeam: true,
  },
  {
    id: "propose-redis",
    label: "Usul: Redis rate limit",
    prompt: "Usul: kita pakai Redis untuk rate limiting API",
  },
]
