import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const CIRCUMFERENCE = 37.7

function getCoverageColors(understood: number) {
  if (understood <= 1) {
    return { stroke: "#c59b37", textClass: "text-text-warning" }
  }
  if (understood === 2) {
    return { stroke: "#2d6ae7", textClass: "text-ink-link" }
  }
  return { stroke: "#16a64f", textClass: "text-text-success" }
}

export function CoverageRing({
  understood,
  total,
  animate = true,
  delay = 0,
}: {
  readonly understood: number
  readonly total: number
  readonly animate?: boolean
  readonly delay?: number
}) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const ratio = Math.max(0, Math.min(1, understood / Math.max(1, total)))
  const targetDash = CIRCUMFERENCE * ratio
  const { stroke, textClass } = getCoverageColors(understood)
  const shouldAnimate = animate && !prefersReducedMotion

  return (
    <span className="inline-flex w-[92px] shrink-0 items-center gap-1.5">
      <svg
        viewBox="0 0 16 16"
        className="size-4 shrink-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#e9ebef] dark:text-white/12"
        />
        <motion.circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          initial={
            shouldAnimate
              ? { strokeDasharray: `0 ${CIRCUMFERENCE}` }
              : { strokeDasharray: `${targetDash} ${CIRCUMFERENCE}` }
          }
          animate={{ strokeDasharray: `${targetDash} ${CIRCUMFERENCE}` }}
          transition={{
            duration: shouldAnimate ? 0.8 : 0.25,
            delay: shouldAnimate ? delay : 0,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        />
      </svg>
      <span
        className={cn(
          "font-sans text-xs font-medium whitespace-nowrap tabular-nums",
          textClass
        )}
      >
        {understood}/{total} paham
      </span>
    </span>
  )
}
