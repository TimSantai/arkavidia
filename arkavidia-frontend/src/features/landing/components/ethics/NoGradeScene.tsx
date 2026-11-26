import { useEffect, useState } from "react"
import { ArrowRight, Ban } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const EASE = [0.2, 0.8, 0.2, 1] as const

export function NoGradeScene({
  playKey,
  isStatic,
}: {
  readonly playKey: number
  readonly isStatic: boolean
}) {
  // step 0: empty, 1: bar filling, 2: arrow hits barrier, 3: arrow recoils & grade struck
  const [step, setStep] = useState(isStatic ? 3 : 0)
  const [score, setScore] = useState(isStatic ? 0.78 : 0)

  useEffect(() => {
    if (isStatic || playKey === 0) return

    const timers: number[] = []
    let frameId = 0

    timers.push(
      window.setTimeout(() => {
        setStep(0)
        setScore(0)
      }, 0)
    )

    timers.push(
      window.setTimeout(() => {
        setStep(1)
        const startedAt = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - startedAt) / 800)
          setScore(Number((0.78 * t).toFixed(2)))
          if (t < 1) {
            frameId = window.requestAnimationFrame(tick)
          }
        }
        frameId = window.requestAnimationFrame(tick)
      }, 200)
    )

    timers.push(window.setTimeout(() => setStep(2), 1100))
    timers.push(window.setTimeout(() => setStep(3), 1550))

    return () => {
      for (const id of timers) window.clearTimeout(id)
      window.cancelAnimationFrame(frameId)
    }
  }, [playKey, isStatic])

  const currentStep = isStatic ? 3 : step
  const displayScore = isStatic ? 0.78 : score

  return (
    <div className="flex h-full w-full items-center justify-between gap-2 px-1">
      {/* Left: Formative understanding bar */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2 font-sans text-xs">
          <span className="font-semibold text-ink-primary">Skor paham</span>
          <span className="font-semibold tabular-nums text-text-success">
            {Math.round(displayScore * 100)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
          <motion.div
            animate={{ width: currentStep >= 1 ? "78%" : "0%" }}
            transition={{ duration: isStatic ? 0 : 0.8, ease: EASE }}
            className="h-full rounded-full bg-success"
          />
        </div>
        <span className="block font-sans text-xs text-ink-tertiary">
          Latihan formatif
        </span>
      </div>

      {/* Center: Blocked dashed arrow + firewall shield */}
      <div className="flex shrink-0 items-center gap-1.5">
        <motion.div
          animate={
            currentStep === 2
              ? { x: 8, opacity: 1 }
              : currentStep >= 3
                ? { x: 0, opacity: 1 }
                : { x: -6, opacity: 0.25 }
          }
          transition={{ duration: isStatic ? 0 : 0.35, ease: EASE }}
          className="flex items-center text-ink-tertiary"
        >
          <span className="h-px w-4 border-t border-dashed border-current" />
          <ArrowRight className="-ml-1 size-3.5" />
        </motion.div>
        <div className="relative flex flex-col items-center">
          <span className="h-12 w-0.5 rounded-full bg-error/65" />
          <span className="absolute top-1/2 -translate-y-1/2 rounded-full bg-error-subtle p-1 text-text-error">
            <Ban className="size-3" />
          </span>
        </div>
      </div>

      {/* Right: Academic grade box crossed out */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span
          className={cn(
            "rounded-lg border px-2.5 py-1 font-sans text-xs font-medium transition-colors duration-300",
            currentStep >= 3
              ? "border-line-subtle bg-surface text-ink-tertiary line-through"
              : "border-line-default bg-surface-card text-ink-primary"
          )}
        >
          Nilai A/B/C
        </span>
        <span
          className={cn(
            "font-sans text-xs font-medium transition-opacity duration-300",
            currentStep >= 3 ? "text-text-error opacity-100" : "opacity-0"
          )}
        >
          Terputus
        </span>
      </div>
    </div>
  )
}
