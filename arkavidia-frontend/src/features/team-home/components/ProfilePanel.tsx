import { useEffect, useState } from "react"
import { CheckCircle2, FileCheck, Users } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import type { User } from "@/types/bersama"
import { TeamHealthTiles } from "./TeamHealthTiles"
import { UnderstandingDonut } from "./UnderstandingDonut"
import type {
  MyUnderstanding,
  TeamHealth,
  UserStats,
} from "../teamHomeData"

export interface ProfilePanelProps {
  readonly user: User
  readonly teamId: string
  readonly stats: UserStats
  readonly understandings: readonly MyUnderstanding[]
  readonly health: TeamHealth
}

function useAnimatedNumber(target: number, duration = 600): number {
  const shouldReduceMotion = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return

    const startTime = performance.now()
    const update = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    const frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [target, duration, shouldReduceMotion])

  return shouldReduceMotion ? target : value
}

export function ProfilePanel({
  user,
  teamId,
  stats,
  understandings,
  health,
}: ProfilePanelProps) {
  const avatarUrl = USER_AVATAR_MAP[user.id]

  const animatedDecisions = useAnimatedNumber(stats.confirmedDecisions)
  const animatedExplainBack = useAnimatedNumber(stats.passedExplainBacks)
  const animatedPairing = useAnimatedNumber(stats.pairingSessions)

  return (
    <aside aria-label="Profil dan Metrik Pemahaman">
      {/* ================= DESKTOP LAYOUT (>= 1024px) ================= */}
      <div className="hidden lg:flex flex-col gap-3 rounded-3xl bg-surface border border-line-subtle shadow-card p-3">
        {/* 1. Kartu Profil */}
        <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-4 flex flex-col items-center text-center">
          <Avatar className="size-[88px] ring-4 ring-surface-raised rounded-full shadow-card overflow-hidden">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-xl font-heading bg-muted text-ink-primary font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>

          <h2 className="font-heading font-semibold text-[22px] text-ink-primary leading-tight mt-3">
            {user.name}
          </h2>
          <p className="text-xs text-ink-secondary mt-1 font-sans">
            {user.moduleFocus || "Backend · Kelompok 4"}
          </p>
        </div>

        {/* 2. 3 Stat Tiles */}
        <div className="grid grid-cols-3 gap-2">
          {/* Stat 1: Keputusan dikonfirmasi */}
          <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-2.5 flex flex-col items-center text-center">
            <span
              className="size-8 rounded-xl bg-info-subtle text-text-info flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <FileCheck className="size-4" />
            </span>
            <span className="font-heading text-2xl font-semibold text-ink-primary tabular-nums mt-1.5 leading-none">
              {animatedDecisions}
            </span>
            <span className="text-xs text-ink-tertiary mt-1 leading-tight line-clamp-2">
              Keputusan dikonfirmasi
            </span>
          </div>

          {/* Stat 2: Explain-back lulus */}
          <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-2.5 flex flex-col items-center text-center">
            <span
              className="size-8 rounded-xl bg-success-subtle text-text-success flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <CheckCircle2 className="size-4" />
            </span>
            <span className="font-heading text-2xl font-semibold text-ink-primary tabular-nums mt-1.5 leading-none">
              {animatedExplainBack}
            </span>
            <span className="text-xs text-ink-tertiary mt-1 leading-tight line-clamp-2">
              Explain-back lulus
            </span>
          </div>

          {/* Stat 3: Sesi pairing */}
          <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-2.5 flex flex-col items-center text-center">
            <span
              className="size-8 rounded-xl bg-error-subtle text-text-error flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Users className="size-4" />
            </span>
            <span className="font-heading text-2xl font-semibold text-ink-primary tabular-nums mt-1.5 leading-none">
              {animatedPairing}
            </span>
            <span className="text-xs text-ink-tertiary mt-1 leading-tight line-clamp-2">
              Sesi pairing
            </span>
          </div>
        </div>

        {/* 3. Understanding Donut */}
        <UnderstandingDonut understandings={understandings} />

        {/* 4. Team Health Tiles */}
        <TeamHealthTiles health={health} teamId={teamId} />
      </div>

      {/* ================= MOBILE & TABLET LAYOUT (< 1024px) ================= */}
      <div className="flex lg:hidden flex-col gap-4 mb-2">
        {/* Compact Profile + 3 Stats in single row */}
        <div className="rounded-3xl bg-surface border border-line-subtle shadow-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-16 ring-4 ring-surface-raised rounded-full shadow-card shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
              <AvatarFallback className="text-base font-heading bg-muted text-ink-primary font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-heading font-semibold text-xl text-ink-primary leading-tight">
                {user.name}
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5 font-sans">
                {user.moduleFocus || "Backend · Kelompok 4"}
              </p>
            </div>
          </div>

          {/* 3 Stats inline */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <div className="rounded-xl bg-surface-raised border border-line-subtle p-2 flex flex-col items-center text-center">
              <span className="font-heading text-xl font-semibold text-ink-primary tabular-nums">
                {animatedDecisions}
              </span>
              <span className="text-xs text-ink-tertiary mt-0.5 leading-tight">
                Keputusan
              </span>
            </div>
            <div className="rounded-xl bg-surface-raised border border-line-subtle p-2 flex flex-col items-center text-center">
              <span className="font-heading text-xl font-semibold text-ink-primary tabular-nums">
                {animatedExplainBack}
              </span>
              <span className="text-xs text-ink-tertiary mt-0.5 leading-tight">
                Lulus
              </span>
            </div>
            <div className="rounded-xl bg-surface-raised border border-line-subtle p-2 flex flex-col items-center text-center">
              <span className="font-heading text-xl font-semibold text-ink-primary tabular-nums">
                {animatedPairing}
              </span>
              <span className="text-xs text-ink-tertiary mt-0.5 leading-tight">
                Pairing
              </span>
            </div>
          </div>
        </div>

        {/* Carousel / 2-card layout for Donut and Team Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnderstandingDonut understandings={understandings} />
          <div className="rounded-3xl bg-surface border border-line-subtle shadow-card p-3 flex flex-col justify-center">
            <TeamHealthTiles health={health} teamId={teamId} />
          </div>
        </div>
      </div>
    </aside>
  )
}
