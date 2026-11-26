import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import brainImg from "@/assets/illustrations/brain.png"
import type { MyUnderstanding } from "../teamHomeData"

export interface UnderstandingDonutProps {
  readonly understandings: readonly MyUnderstanding[]
}

const RADIUS = 54
const STROKE_WIDTH = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~339.29
const GAP_ANGLE = 4 // degrees gap between segments

export function UnderstandingDonut({ understandings }: UnderstandingDonutProps) {
  const shouldReduceMotion = useReducedMotion()
  const totalCount = understandings.length
  const masteredCount = understandings.filter((u) => u.pL >= 0.7).length

  const [animatedCount, setAnimatedCount] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return

    const duration = 600
    const startTime = performance.now()

    const animateCount = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setAnimatedCount(Math.round(progress * masteredCount))

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }

    const frameId = requestAnimationFrame(animateCount)
    return () => cancelAnimationFrame(frameId)
  }, [masteredCount, shouldReduceMotion])

  const displayedCount = shouldReduceMotion ? masteredCount : animatedCount

  const segmentAngle = 360 / (totalCount || 1)
  const segmentArcAngle = Math.max(segmentAngle - GAP_ANGLE, 1)
  const segmentLength = (segmentArcAngle / 360) * CIRCUMFERENCE

  return (
    <div className="flex flex-col gap-3">
      {/* Header: Title + Lock chip */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-primary font-sans">
          Pemahamanmu
        </h3>
        <span className="flex items-center gap-1 text-xs font-medium text-ink-tertiary bg-surface-card/80 dark:bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full select-none border border-line-subtle/50">
          <Lock className="size-3 text-ink-tertiary shrink-0" aria-hidden="true" />
          <span>Hanya kamu</span>
        </span>
      </div>

      {/* Brain 3D illustration centered */}
      <div className="flex justify-center -my-1">
        <img
          src={brainImg}
          alt=""
          aria-hidden="true"
          className="size-16 sm:size-[72px] object-contain drop-shadow-[0_8px_16px_rgb(29_30_33/0.12)] pointer-events-none select-none"
        />
      </div>

      {/* Donut Graphic (Thin stroke 10px, round cap) */}
      <div
        role="img"
        aria-label={`Kamu menguasai ${masteredCount} dari ${totalCount} KC`}
        className="relative flex items-center justify-center py-1"
      >
        <svg viewBox="0 0 140 140" className="size-36 shrink-0 overflow-visible">
          {/* Subtle background track */}
          {understandings.map((_, i) => {
            const startAngle = i * segmentAngle - 90 + GAP_ANGLE / 2
            return (
              <circle
                key={`track-${i}`}
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke="var(--bg-well)"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                transform={`rotate(${startAngle} 70 70)`}
                strokeLinecap="round"
              />
            )
          })}

          {/* Active colored segments */}
          {understandings.map((kc, i) => {
            const startAngle = i * segmentAngle - 90 + GAP_ANGLE / 2

            // Colors:
            // < 0.5: kuning (#755700 / bg-warning)
            // 0.5–0.8: biru (#1a51c4 / bg-info)
            // >= 0.8: hijau (#006f31 / bg-success)
            const segmentColor =
              kc.pL >= 0.8
                ? "var(--bg-success)"
                : kc.pL >= 0.5
                  ? "var(--bg-brand)"
                  : "var(--bg-warning)"

            return (
              <motion.circle
                key={kc.kcId}
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke={segmentColor}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                transform={`rotate(${startAngle} 70 70)`}
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
          <span className="font-heading font-semibold text-2xl text-ink-primary tabular-nums tracking-tight">
            {displayedCount}/{totalCount}
          </span>
          <span className="text-xs text-ink-tertiary font-sans font-medium">
            KC dikuasai
          </span>
        </div>
      </div>

      {/* Legend Chips */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink-secondary pt-1 border-t border-line-subtle/50">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success shrink-0" aria-hidden="true" />
          <span>Paham</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand shrink-0" aria-hidden="true" />
          <span>Menengah</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-warning shrink-0" aria-hidden="true" />
          <span>Perlu cek</span>
        </span>
      </div>
    </div>
  )
}
