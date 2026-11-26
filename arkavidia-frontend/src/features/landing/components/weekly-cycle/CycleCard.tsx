import { useId, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router"
import { ArrowRight, ChevronDown } from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const panelId = useId()

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
        "group/card relative flex min-h-[320px] flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-[#c6daff] bg-gradient-to-b from-[#f8fbff] to-[#eef4ff] p-6 shadow-[0_14px_34px_-22px_rgb(26_81_196/0.32)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#9fc1ff] hover:shadow-[0_18px_40px_-20px_rgb(26_81_196/0.4)] sm:min-h-[340px] sm:p-8 dark:border-[#4784ff]/20 dark:from-[#161c2e] dark:to-[#131826] dark:shadow-raised dark:hover:border-[#4784ff]/40",
        isWide ? "md:col-span-4" : "md:col-span-2"
      )}
    >
      {/* Subtle pastel corner ambient glow behind illustration */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 size-[280px] rounded-full opacity-45 blur-[88px] transition-opacity duration-200 group-hover/card:opacity-65 dark:opacity-22 dark:group-hover/card:opacity-35",
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

      {/* Bottom Copy + Demo Link + "Di balik layar" Technical Collapsible */}
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

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Link
              to={phase.demoPath}
              className="inline-flex items-center gap-1.5 rounded-md font-sans text-sm font-medium text-[#1a51c4] transition-colors duration-150 hover:text-[#0c3c9f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-[#9fc1ff] dark:hover:text-white"
            >
              <span>{phase.demoCta}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={detailsOpen}
                aria-controls={panelId}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-sans text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-[#bec0c5] dark:hover:text-white"
              >
                <span>Di balik layar</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    detailsOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent id={panelId} className="pt-3">
            <div className="space-y-1.5 rounded-xl border border-[#c6daff]/80 bg-white/90 p-3.5 shadow-badge dark:border-white/10 dark:bg-white/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-sans text-xs font-semibold text-ink-primary dark:text-[#f4f6f9]">
                  {phase.mechanismTitle}
                </p>
                <span className="rounded-md bg-wash-brand px-2 py-0.5 font-sans text-xs font-medium tabular-nums text-ink-link dark:bg-white/10 dark:text-[#c6daff]">
                  {phase.formulaTag}
                </span>
              </div>
              <p className="font-sans text-[13px] leading-relaxed text-ink-secondary dark:text-[#bec0c5]">
                {phase.mechanismPlain}
              </p>
              <p className="font-sans text-xs text-ink-tertiary dark:text-[#9fa2a7]">
                {phase.technicalNote}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.article>
  )
}
