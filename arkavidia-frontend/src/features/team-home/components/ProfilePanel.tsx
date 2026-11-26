import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
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

// Q: "Bagaimana kondisiku dan kontribusiku secara keseluruhan?"
export function ProfilePanel({
  teamId,
  stats,
  understandings,
  health,
}: ProfilePanelProps) {
  const animatedDecisions = useAnimatedNumber(stats.confirmedDecisions)
  const animatedExplainBack = useAnimatedNumber(stats.passedExplainBacks)
  const animatedPairing = useAnimatedNumber(stats.pairingSessions)

  return (
    <aside aria-label="Panel Sorotan Pemahaman" className="flex flex-col gap-4">
      {/* 1. Kartu Sorotan Pastel (Donut Pemahaman Individu) */}
      <div className="rounded-3xl bg-wash-brand border border-brand-subtle p-5">
        <UnderstandingDonut understandings={understandings} />
      </div>

      {/* 2. Kartu Metrik Plain (Beberapa angka jujur dalam satu kartu) */}
      <div className="rounded-3xl bg-surface-card border border-line-subtle py-4 px-3">
        <div className="grid grid-cols-3 divide-x divide-line-subtle text-center">
          {/* Stat 1: Keputusan dikonfirmasi */}
          <div className="px-2 flex flex-col items-center">
            <span className="font-sans font-semibold text-2xl text-ink-primary tabular-nums leading-none">
              {animatedDecisions}
            </span>
            <span className="text-xs text-ink-tertiary mt-1.5 leading-snug line-clamp-2">
              keputusan · semester ini
            </span>
          </div>

          {/* Stat 2: Explain-back lulus */}
          <div className="px-2 flex flex-col items-center">
            <span className="font-sans font-semibold text-2xl text-ink-primary tabular-nums leading-none">
              {animatedExplainBack}
            </span>
            <span className="text-xs text-ink-tertiary mt-1.5 leading-snug line-clamp-2">
              explain-back · lulus
            </span>
          </div>

          {/* Stat 3: Sesi pairing */}
          <div className="px-2 flex flex-col items-center">
            <span className="font-sans font-semibold text-2xl text-ink-primary tabular-nums leading-none">
              {animatedPairing}
            </span>
            <span className="text-xs text-ink-tertiary mt-1.5 leading-snug line-clamp-2">
              sesi pairing · selesai
            </span>
          </div>
        </div>
      </div>

      {/* 3. Dua Tile Status Tinted: Coverage Tim & Bus Factor */}
      <TeamHealthTiles health={health} teamId={teamId} />
    </aside>
  )
}
