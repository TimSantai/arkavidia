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
      {/* 1. Kartu Pastel Tinggi bergradien lembut #f1f6ff ke #ffffff */}
      <div className="rounded-3xl bg-gradient-to-b from-[#f1f6ff] to-white dark:from-info-subtle/30 dark:to-surface border border-[#eef0f3] dark:border-line-subtle p-5">
        <UnderstandingDonut understandings={understandings} />
      </div>

      {/* 2. Satu Kartu Plain: 3 Angka Berjajar dengan Pemisah Vertikal */}
      <div className="rounded-2xl bg-white dark:bg-surface border border-[#eef0f3] dark:border-line-subtle p-4">
        <div className="grid grid-cols-3 divide-x divide-[#eef0f3] dark:divide-line-subtle/50 text-center">
          {/* Stat 1: Keputusan dikonfirmasi */}
          <div className="px-1.5 flex flex-col items-center">
            <span className="font-sans font-semibold text-2xl text-ink-primary tabular-nums leading-none">
              {animatedDecisions}
            </span>
            <span className="text-xs text-ink-tertiary mt-1.5 leading-snug line-clamp-2">
              Keputusan
            </span>
          </div>

          {/* Stat 2: Explain-back lulus */}
          <div className="px-1.5 flex flex-col items-center">
            <span className="font-sans font-semibold text-2xl text-ink-primary tabular-nums leading-none">
              {animatedExplainBack}
            </span>
            <span className="text-xs text-ink-tertiary mt-1.5 leading-snug line-clamp-2">
              EB Lulus
            </span>
          </div>

          {/* Stat 3: Sesi pairing */}
          <div className="px-1.5 flex flex-col items-center">
            <span className="font-sans font-semibold text-2xl text-ink-primary tabular-nums leading-none">
              {animatedPairing}
            </span>
            <span className="text-xs text-ink-tertiary mt-1.5 leading-snug line-clamp-2">
              Pairing
            </span>
          </div>
        </div>
      </div>

      {/* 3. Dua Tile Tinted Kecil: Coverage Tim & Bus Factor */}
      <TeamHealthTiles health={health} teamId={teamId} />
    </aside>
  )
}
