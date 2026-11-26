import { useEffect, useRef, useState } from "react"
import "boopface"
import type { BoopFace } from "boopface"
import { cn } from "@/lib/utils"
import {
  AGENT_ROLE_META,
  skinSupportsEyeColor,
  useAgentAppearance,
  type AgentAppearance,
  type AgentRole,
  type AgentSemanticState,
} from "./agentConfig"

export interface AgentStickerAvatarProps {
  readonly role: AgentRole
  readonly state?: AgentSemanticState
  readonly size?: number
  readonly interactive?: boolean
  readonly appearanceOverride?: AgentAppearance
  readonly className?: string
  readonly label?: string
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  return reduced
}

export function AgentStickerAvatar({
  role,
  state = "idle",
  size = 40,
  interactive = true,
  appearanceOverride,
  className,
  label,
}: AgentStickerAvatarProps) {
  const faceRef = useRef<BoopFace | null>(null)
  const prevStateRef = useRef<AgentSemanticState>("idle")
  const { appearances } = useAgentAppearance()
  const reducedMotion = usePrefersReducedMotion()

  const appearance = appearanceOverride ?? appearances[role]
  const meta = AGENT_ROLE_META[role]

  // Only pass eye-color when supported by the skin or when transparent, preventing console warnings.
  const resolvedEyeColor =
    appearance.eyeColor === "transparent" || skinSupportsEyeColor(appearance.skin)
      ? appearance.eyeColor ?? undefined
      : undefined

  // Synchronize `view` via imperative API + attribute because `BoopFace.prototype.view`
  // is getter-only and React 19 custom element prop assignment throws on readonly getters.
  useEffect(() => {
    const face = faceRef.current
    if (!face) return
    face.setAttribute("view", appearance.view)
    face.setView?.(appearance.view)
  }, [appearance.view])

  useEffect(() => {
    const face = faceRef.current
    if (!face) return

    const prevState = prevStateRef.current
    prevStateRef.current = state

    if (prevState === state && state === "idle") return

    face.stopWaiting?.()

    if (reducedMotion) {
      if (state === "idle") {
        face.reset?.()
      } else if (state === "thinking") {
        void face.play?.("think")
      } else if (state === "speaking") {
        void face.play?.("speaking")
      } else if (state === "blocked") {
        void face.play?.("refuse")
      } else if (state === "warning") {
        void face.play?.("wary")
      } else if (state === "success") {
        void face.play?.("success")
      } else if (state === "nudge") {
        void face.play?.("wink")
      }
      return
    }

    switch (state) {
      case "thinking":
        void face.startWaiting?.({ variant: "spin" })
        break
      case "speaking":
        void face.startSpeaking?.()
        break
      case "blocked":
        void face.play?.("refuse")
        break
      case "warning":
        void face.play?.("wary")
        break
      case "success":
        void face.play?.("success")
        break
      case "nudge":
        void face.play?.("wink")
        break
      case "idle":
      default:
        face.reset?.()
        break
    }
  }, [state, reducedMotion])

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={label ?? meta.label}
    >
      <boop-face
        ref={faceRef}
        size={size}
        color={appearance.color}
        skin={appearance.skin ?? "none"}
        eye-color={resolvedEyeColor}
        eye-style={appearance.eyeStyle}
        antenna={appearance.antenna ? "true" : "false"}
        motion={reducedMotion ? "reduce" : "auto"}
        auto-sleep="0"
        petting={interactive ? "true" : "false"}
        press-squeeze={interactive ? "true" : "false"}
        antenna-drag={interactive ? "true" : "false"}
        idle-gaze={interactive ? "true" : "false"}
        className={cn(!interactive && "pointer-events-none")}
      />
    </span>
  )
}
