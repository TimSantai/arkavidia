import { useEffect, useState } from "react"
import { Lock, Users } from "lucide-react"
import { motion } from "motion/react"

const MEMBER_DOTS = [
  { initials: "RK", score: "0.92" },
  { initials: "DP", score: "0.34" },
  { initials: "BS", score: "0.78" },
  { initials: "SW", score: "0.81" },
] as const

const EASE = [0.2, 0.8, 0.2, 1] as const

export function AggregateScene({
  playKey,
  isStatic,
}: {
  readonly playKey: number
  readonly isStatic: boolean
}) {
  // stage 0: individual only, 1: dots blurring/moving, 2: aggregated on right
  const [stage, setStage] = useState(isStatic ? 2 : 0)

  useEffect(() => {
    if (isStatic || playKey === 0) return

    const timers: number[] = []
    timers.push(window.setTimeout(() => setStage(0), 0))
    timers.push(window.setTimeout(() => setStage(1), 400))
    timers.push(window.setTimeout(() => setStage(2), 1300))

    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [playKey, isStatic])

  const currentStage = isStatic ? 2 : stage

  return (
    <div className="grid h-full w-full grid-cols-[1fr_1fr] items-center gap-2.5 px-0.5">
      {/* Left: Individual scores locked to owner */}
      <div className="flex h-full flex-col justify-between rounded-lg border border-line-subtle bg-surface-card p-2.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {MEMBER_DOTS.map((dot, idx) => (
              <motion.span
                key={dot.initials}
                animate={
                  currentStage === 1
                    ? { x: 14, opacity: 0.45 }
                    : { x: 0, opacity: 1 }
                }
                transition={{
                  duration: isStatic ? 0 : 0.45,
                  delay: isStatic ? 0 : idx * 0.08,
                  ease: EASE,
                }}
                className="inline-flex size-6 items-center justify-center rounded-full bg-wash-brand font-sans text-xs font-semibold text-ink-link"
              >
                {dot.initials[0]}
              </motion.span>
            ))}
          </div>
          <Lock className="size-3.5 shrink-0 text-ink-tertiary" />
        </div>

        <motion.p
          animate={
            currentStage === 1
              ? { filter: "blur(4px)", opacity: 0.35 }
              : { filter: "blur(0px)", opacity: 1 }
          }
          transition={{ duration: isStatic ? 0 : 0.4 }}
          className="truncate font-sans text-xs tabular-nums text-ink-secondary"
        >
          0.92 · 0.34 · 0.78 · 0.81
        </motion.p>

        <span className="font-sans text-xs font-medium text-ink-tertiary">
          Individu · terkunci
        </span>
      </div>

      {/* Right: Lecturer aggregate view only */}
      <div className="flex h-full flex-col justify-between rounded-lg border border-brand-subtle bg-wash-brand p-2.5">
        <div className="flex items-center justify-between gap-1">
          <span className="font-sans text-xs font-semibold text-ink-primary">
            Tampilan Dosen
          </span>
          <Users className="size-3.5 text-ink-link" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-sans text-xs">
            <span className="text-ink-secondary">Agregat tim</span>
            <motion.span
              animate={{ opacity: currentStage >= 2 ? 1 : 0.25 }}
              transition={{ duration: isStatic ? 0 : 0.35 }}
              className="font-semibold tabular-nums text-ink-link"
            >
              71%
            </motion.span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-card">
            <motion.div
              animate={{ width: currentStage >= 2 ? "71%" : "0%" }}
              transition={{ duration: isStatic ? 0 : 0.65, ease: EASE }}
              className="h-full rounded-full bg-brand"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
