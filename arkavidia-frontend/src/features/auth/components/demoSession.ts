import { CURRENT_USER, SEED_USERS } from "@/mocks/seedData"
import type { User } from "@/types/bersama"

export const DEMO_USER_STORAGE_KEY = "bersama-demo-user-id"
export const DEMO_CONSENT_STORAGE_KEY = "bersama-uupdp-consent"

export interface ConsentState {
  readonly mandatoryAccepted: boolean
  readonly voiceProcessingAccepted: boolean
  readonly acceptedAt: string
}

export function getStoredDemoUser(): User {
  if (typeof window === "undefined") {
    return CURRENT_USER
  }
  const savedId = window.localStorage.getItem(DEMO_USER_STORAGE_KEY)
  if (!savedId) {
    return CURRENT_USER
  }
  return SEED_USERS.find((user) => user.id === savedId) ?? CURRENT_USER
}

export function setStoredDemoUser(userId: string): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(DEMO_USER_STORAGE_KEY, userId)
}

export function getStoredConsent(): ConsentState {
  const fallback: ConsentState = {
    mandatoryAccepted: false,
    voiceProcessingAccepted: false,
    acceptedAt: "",
  }
  if (typeof window === "undefined") {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(DEMO_CONSENT_STORAGE_KEY)
    if (!raw) {
      return fallback
    }
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    return {
      mandatoryAccepted: Boolean(parsed.mandatoryAccepted),
      voiceProcessingAccepted: Boolean(parsed.voiceProcessingAccepted),
      acceptedAt: typeof parsed.acceptedAt === "string" ? parsed.acceptedAt : "",
    }
  } catch {
    return fallback
  }
}

export function setStoredConsent(consent: Omit<ConsentState, "acceptedAt">): void {
  if (typeof window === "undefined") {
    return
  }
  const payload: ConsentState = {
    ...consent,
    acceptedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(DEMO_CONSENT_STORAGE_KEY, JSON.stringify(payload))
}
