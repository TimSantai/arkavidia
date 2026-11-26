import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import type { MyUnderstanding } from "../teamHomeData"

export interface UnderstandingDonutProps {
  readonly understandings: readonly MyUnderstanding[]
}

const RADIUS = 64
const STROKE_WIDTH = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~402.12
const GAP_ANGLE = 4 // degrees gap between segments

export function UnderstandingDonut({ understandings }: UnderstandingDonutProps) {
  const shouldReduceMotion = useReducedMotion()
  const totalCount = understandings.length
  // User masters KC if pL >= 0.70
  const masteredCount = understandings.filter((u) => u.pL >= 0.7).length

  // Count up animation for displayed mastered count
  const [animatedCount, setAnimatedCount] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return

    const duration = 600
    const startTime = performance.now()

    const animateCount = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.round(progress * masteredCount)
      setAnimatedCount(current)

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }

    const frameId = requestAnimationFrame(animateCount)
    return () => cancelAnimationFrame(frameId)
  }, [masteredCount, shouldReduceMotion])

  const displayedCount = shouldReduceMotion ? masteredCount : animatedCount

  // Segment geometry
  const segmentAngle = 360 / (totalCount || 1)
  const segmentArcAngle = Math.max(segmentAngle - GAP_ANGLE, 1)
  const segmentLength = (segmentArcAngle / 360) * CIRCUMFERENCE

  return (
    <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-primary font-sans">
          Pemahamanmu
        </h3>
        <span className="flex items-center gap-1 text-xs text-ink-tertiary bg-well/70 px-2.5 py-0.5 rounded-full select-none">
          <Lock className="size-3 text-ink-tertiary shrink-0" aria-hidden="true" />
          <span>Hanya kamu yang melihat ini</span>
        </span>
      </div>

      {/* Donut Graphic */}
      <div
        role="img"
        aria-label={`Kamu menguasai ${masteredCount} dari ${totalCount} KC`}
        className="relative flex items-center justify-center py-2"
      >
        <svg
          viewBox="0 0 180 180"
          className="size-44 shrink-0 overflow-visible"
        >
          {/* Subtle background track for all segments */}
          {understandings.map((_, i) => {
            const startAngle = i * segmentAngle - 90 + GAP_ANGLE / 2
            return (
              <circle
                key={`track-${i}`}
                cx="90"
                cy="90"
                r={RADIUS}
                fill="none"
                stroke="var(--bg-well)"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                transform={`rotate(${startAngle} 90 90)`}
                strokeLinecap="round"
              />
            )
          })}

          {/* Active colored segments */}
          {understandings.map((kc, i) => {
            const startAngle = i * segmentAngle - 90 + GAP_ANGLE / 2

            // Colors:
            // < 0.5: kuning (bg-warning)
            // 0.5–0.8: biru (bg-info)
            // >= 0.8: hijau (bg-success)
            const segmentColor =
              kc.pL >= 0.8
                ? "var(--bg-success)"
                : kc.pL >= 0.5
                  ? "var(--bg-info)"
                  : "var(--bg-warning)"

            return (
              <motion.circle
                key={kc.kcId}
                cx="90"
                cy="90"
                r={RADIUS}
                fill="none"
                stroke={segmentColor}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                transform={`rotate(${startAngle} 90 90)`}
                strokeLinecap="round"
                initial={shouldReduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.6,
                  delay: shouldReduceMotion ? 0 : i * 0.08,
                  ease: "easeOut",
                }}
              />
            )
          })}
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="font-heading font-semibold text-[44px] leading-none text-ink-primary tabular-nums tracking-tight">
            {displayedCount}/{totalCount}
          </span>
          <span className="text-xs text-ink-tertiary font-sans font-medium mt-1">
            KC dikuasai
          </span>
        </div>
      </div>

      {/* Legend Chips */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 border-t border-line-subtle/40 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success shrink-0" aria-hidden="true" />
          <span>≥ 0.8 Paham</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-info shrink-0" aria-hidden="true" />
          <span>0.5–0.8 Menengah</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-warning shrink-0" aria-hidden="true" />
          <span>&lt; 0.5 Perlu cek</span>
        </span>
      </div>
    </div>
  )
}
