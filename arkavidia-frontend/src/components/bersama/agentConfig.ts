import { useCallback, useEffect, useState } from "react"
import { SKINS, type BoopFaceSkin } from "boopface"

export type AgentRole = "team" | "private" | "tutor"

export type AgentSemanticState =
  | "idle"
  | "thinking"
  | "speaking"
  | "blocked"
  | "warning"
  | "success"
  | "nudge"

export interface AgentAppearance {
  readonly skin: BoopFaceSkin | null
  readonly color: string
  readonly eyeColor: string | null
  readonly eyeStyle: "round" | "sharp"
  readonly view: "2d" | "3d"
  readonly antenna: boolean
}

export type AgentAppearanceMap = Readonly<Record<AgentRole, AgentAppearance>>

export const AGENT_STORAGE_KEY = "bersama_agent_appearance_v1"
const AGENT_CHANGE_EVENT = "bersama:agent-appearance-changed"

export interface AgentRoleMetadata {
  readonly label: string
  readonly roomLabel: string
  readonly description: string
  readonly stickerBgClass: string
}

export const AGENT_ROLE_META: Readonly<Record<AgentRole, AgentRoleMetadata>> = {
  team: {
    label: "Team Agent",
    roomLabel: "Ruang Tim · M2",
    description: "Menjawab dari memori bersama M2 yang sudah dikonfirmasi tim.",
    stickerBgClass: "bg-[#f1f6ff] dark:bg-[#1e2d4f]",
  },
  private: {
    label: "Personal Agent",
    roomLabel: "Ruang Pribadi · M1",
    description: "Membantu refleksi privat tanpa membocorkan konteks M1 ke tim.",
    stickerBgClass: "bg-[#ece8ff] dark:bg-[#2d234d]",
  },
  tutor: {
    label: "Socratic Tutor",
    roomLabel: "Brain & Briefing",
    description: "Memandu Explain-Back, peta pemahaman, dan onboarding Socratic.",
    stickerBgClass: "bg-[#e0f7ff] dark:bg-[#163644]",
  },
}

export const DEFAULT_AGENT_APPEARANCES: AgentAppearanceMap = {
  team: {
    skin: null,
    color: "#2d6ae7",
    eyeColor: "#f1f6ff",
    eyeStyle: "round",
    view: "3d",
    antenna: true,
  },
  private: {
    skin: null,
    color: "#7f51db",
    eyeColor: "#f6f4ff",
    eyeStyle: "round",
    view: "3d",
    antenna: true,
  },
  tutor: {
    skin: null,
    color: "#007fa9",
    eyeColor: "#ebf8ff",
    eyeStyle: "round",
    view: "3d",
    antenna: true,
  },
}

export const COLOR_SWATCHES: readonly { readonly hex: string; readonly label: string }[] = [
  { hex: "#2d6ae7", label: "Cobalt" },
  { hex: "#1a51c4", label: "Deep Cobalt" },
  { hex: "#7f51db", label: "Cozy Violet" },
  { hex: "#007fa9", label: "Fresh Cyan" },
  { hex: "#16a64f", label: "Emerald" },
  { hex: "#323337", label: "Graphite" },
]

export const EYE_COLOR_SWATCHES: readonly { readonly value: string | null; readonly label: string }[] = [
  { value: "#ffffff", label: "Putih Cerah" },
  { value: "#f1f6ff", label: "Cobalt Tint" },
  { value: "#c4b3ff", label: "Violet Glow" },
  { value: "#73cdf8", label: "Cyan Glow" },
  { value: "#79d990", label: "Mint" },
  { value: "transparent", label: "Tembus Pandang" },
]

const CURATED_SKIN_IDS: readonly BoopFaceSkin[] = [
  "711",
  "709",
  "712",
  "701",
  "706",
  "102",
  "106",
  "301",
  "304",
  "310",
  "1301",
  "1606",
  "1703",
]

export interface CuratedSkinOption {
  readonly id: BoopFaceSkin
  readonly label: string
  readonly previewColor: string
  readonly supportsEyeColor: boolean
}

export const CURATED_SKIN_OPTIONS: readonly CuratedSkinOption[] = CURATED_SKIN_IDS.filter(
  (id) => Object.hasOwn(SKINS, id)
).map((id) => {
  const info = SKINS[id]
  return {
    id,
    label: info.titleEn,
    previewColor: info.base[1] ?? info.base[0] ?? "#2d6ae7",
    supportsEyeColor: info.eyeColor,
  }
})

export function isValidBoopFaceSkin(value: unknown): value is BoopFaceSkin {
  return typeof value === "string" && Object.hasOwn(SKINS, value)
}

export function skinSupportsEyeColor(skin: BoopFaceSkin | null): boolean {
  if (skin === null) return true
  return SKINS[skin]?.eyeColor ?? true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function sanitizeAppearance(
  raw: unknown,
  fallback: AgentAppearance
): AgentAppearance {
  if (!isRecord(raw)) return fallback

  const skin =
    raw.skin === null
      ? null
      : isValidBoopFaceSkin(raw.skin)
        ? raw.skin
        : fallback.skin

  const color =
    typeof raw.color === "string" && /^#[0-9a-f]{6}$/i.test(raw.color)
      ? raw.color
      : fallback.color

  const eyeColor =
    raw.eyeColor === null
      ? null
      : typeof raw.eyeColor === "string" &&
          (raw.eyeColor === "transparent" || /^#[0-9a-f]{3,8}$/i.test(raw.eyeColor))
        ? raw.eyeColor
        : fallback.eyeColor

  const eyeStyle = raw.eyeStyle === "sharp" ? "sharp" : "round"
  const view = raw.view === "2d" ? "2d" : "3d"
  const antenna = typeof raw.antenna === "boolean" ? raw.antenna : fallback.antenna

  return { skin, color, eyeColor, eyeStyle, view, antenna }
}

export function readStoredAgentAppearances(): AgentAppearanceMap {
  if (typeof window === "undefined") return DEFAULT_AGENT_APPEARANCES
  try {
    const raw = window.localStorage.getItem(AGENT_STORAGE_KEY)
    if (!raw) return DEFAULT_AGENT_APPEARANCES
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return DEFAULT_AGENT_APPEARANCES
    return {
      team: sanitizeAppearance(parsed.team, DEFAULT_AGENT_APPEARANCES.team),
      private: sanitizeAppearance(parsed.private, DEFAULT_AGENT_APPEARANCES.private),
      tutor: sanitizeAppearance(parsed.tutor, DEFAULT_AGENT_APPEARANCES.tutor),
    }
  } catch {
    return DEFAULT_AGENT_APPEARANCES
  }
}

function writeStoredAgentAppearances(next: AgentAppearanceMap): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(AGENT_CHANGE_EVENT, { detail: next }))
  } catch {
    // Ignore storage quota or private-browsing failures cleanly.
  }
}

export function useAgentAppearance() {
  const [appearances, setAppearances] = useState<AgentAppearanceMap>(() =>
    readStoredAgentAppearances()
  )

  useEffect(() => {
    const handleInternal = (event: Event) => {
      const custom = event as CustomEvent<AgentAppearanceMap>
      if (custom.detail) {
        setAppearances(custom.detail)
      } else {
        setAppearances(readStoredAgentAppearances())
      }
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AGENT_STORAGE_KEY) {
        setAppearances(readStoredAgentAppearances())
      }
    }

    window.addEventListener(AGENT_CHANGE_EVENT, handleInternal)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(AGENT_CHANGE_EVENT, handleInternal)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const updateAppearance = useCallback(
    (role: AgentRole, patch: Partial<AgentAppearance>) => {
      const current = readStoredAgentAppearances()
      const next: AgentAppearanceMap = {
        ...current,
        [role]: {
          ...current[role],
          ...patch,
        },
      }
      writeStoredAgentAppearances(next)
      setAppearances(next)
    },
    []
  )

  const resetAppearance = useCallback((role: AgentRole) => {
    const current = readStoredAgentAppearances()
    const next: AgentAppearanceMap = {
      ...current,
      [role]: DEFAULT_AGENT_APPEARANCES[role],
    }
    writeStoredAgentAppearances(next)
    setAppearances(next)
  }, [])

  return {
    appearances,
    updateAppearance,
    resetAppearance,
  }
}
