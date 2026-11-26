import { useRef, type ReactNode } from "react"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import type { WeeklyCyclePhase } from "../../landingData"

const GLOW_STYLES: Readonly<
  Record<WeeklyCyclePhase["glow"], { readonly blob: string }>
> = {
  brand: { blob: "bg-[#9fc1ff] dark:bg-[#4784ff]" },
  violet: { blob: "bg-[#c4b3ff] dark:bg-[#9669f8]" },
  amber: { blob: "bg-[#f1d69b] dark:bg-[#c59b37]" },
  cyan: { blob: "bg-[#73cdf8] dark:bg-[#3dafe0]" },
}

export function CycleCard({
  phase,
  index,
  renderIllustration,
}: {
  readonly phase: WeeklyCyclePhase
  readonly index: number
  readonly renderIllustration: (opts: {
    readonly active: boolean
    readonly reducedMotion: boolean
  }) => ReactNode
}) {
  const cardRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(cardRef, { amount: 0.4 })
  const hasEntered = useInView(cardRef, { once: true, amount: 0.25 })
  const prefersReducedMotion = useReducedMotion() ?? false

  const palette = GLOW_STYLES[phase.glow]
  const isWide = phase.size === "wide"

  return (
    <motion.article
      ref={cardRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={hasEntered ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      className={cn(
        "group/card relative flex min-h-[320px] flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-[#dce7fb] bg-gradient-to-b from-white to-[#f7faff] p-6 shadow-[0_4px_16px_-10px_rgb(29_30_33/0.08)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#c6daff] hover:shadow-[0_10px_24px_-14px_rgb(26_81_196/0.16)] sm:min-h-[340px] sm:p-8 dark:border-[#4784ff]/20 dark:from-[#161c2e] dark:to-[#131826] dark:shadow-card dark:hover:border-[#4784ff]/35",
        isWide ? "md:col-span-4" : "md:col-span-2"
      )}
    >
      {/* Subtle pastel corner ambient glow behind illustration */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 size-[260px] rounded-full opacity-25 blur-[92px] transition-opacity duration-200 group-hover/card:opacity-38 dark:opacity-18 dark:group-hover/card:opacity-28",
          isWide ? "-right-16" : "-left-16",
          palette.blob
        )}
      />

      {/* Upper Illustration Area */}
      <div
        className={cn(
          "relative z-10 flex w-full origin-top-left scale-95 sm:scale-100",
          isWide ? "justify-start sm:justify-end" : "justify-start"
        )}
      >
        {renderIllustration({
          active: isInView,
          reducedMotion: prefersReducedMotion,
        })}
      </div>

      {/* Bottom Copy + Demo Link */}
      <div className="relative z-10 flex flex-col gap-3">
        <span className="font-sans text-xs font-semibold tracking-wider tabular-nums text-[#1a51c4] dark:text-[#9fc1ff]">
          {phase.step}
        </span>

        <p className="font-sans text-base leading-relaxed text-ink-secondary text-pretty sm:text-[17px] dark:text-[#bec0c5]">
          <strong className="font-display text-xl font-semibold text-[#141518] dark:text-[#f4f6f9]">
            {phase.title}
          </strong>{" "}
          {phase.shortSummary}
        </p>

        <div className="pt-1">
          <Link
            to={phase.demoPath}
            className="inline-flex items-center gap-1.5 rounded-md font-sans text-sm font-medium text-[#1a51c4] transition-colors duration-150 hover:text-[#0c3c9f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-[#9fc1ff] dark:hover:text-white"
          >
            <span>{phase.demoCta}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
