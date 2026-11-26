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
  Record<
    WeeklyCyclePhase["glow"],
    { readonly blob: string; readonly link: string }
  >
> = {
  brand: { blob: "bg-[#4784ff]", link: "text-[#9fc1ff] hover:text-white" },
  violet: { blob: "bg-[#9669f8]", link: "text-[#c4b3ff] hover:text-white" },
  amber: { blob: "bg-[#c59b37]", link: "text-[#f1d69b] hover:text-white" },
  cyan: { blob: "bg-[#3dafe0]", link: "text-[#73cdf8] hover:text-white" },
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
        "group/card relative flex min-h-[320px] flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-white/10 bg-[#1d1e21] p-6 shadow-raised transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/20 sm:min-h-[340px] sm:p-8 dark:bg-[#121316]",
        isWide ? "md:col-span-4" : "md:col-span-2"
      )}
    >
      {/* Corner ambient light blob (never sits behind readable text) */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 size-[300px] rounded-full opacity-35 blur-[90px] transition-opacity duration-200 group-hover/card:opacity-50",
          isWide ? "-right-16" : "-left-16",
          palette.blob
        )}
      />

      {/* Upper Illustration Area (isolated above text so it never overlaps copy) */}
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
        <span className="font-sans text-xs font-semibold tracking-wider tabular-nums text-[#9fa2a7]">
          {phase.step}
        </span>

        <p className="font-sans text-base leading-relaxed text-[#bec0c5] text-pretty sm:text-[17px]">
          <strong className="font-display text-xl font-semibold text-[#f4f6f9]">
            {phase.title}
          </strong>{" "}
          {phase.shortSummary}
        </p>

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Link
              to={phase.demoPath}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md font-sans text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ea0ff]",
                palette.link
              )}
            >
              <span>{phase.demoCta}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={detailsOpen}
                aria-controls={panelId}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-sans text-[13px] font-medium text-[#9fa2a7] transition-colors duration-150 hover:text-[#e9ebef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ea0ff]"
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
            <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-sans text-xs font-semibold text-[#f4f6f9]">
                  {phase.mechanismTitle}
                </p>
                <span className="rounded-md bg-white/[0.08] px-2 py-0.5 font-sans text-xs font-medium tabular-nums text-[#bec0c5]">
                  {phase.formulaTag}
                </span>
              </div>
              <p className="font-sans text-[13px] leading-relaxed text-[#bec0c5]">
                {phase.mechanismPlain}
              </p>
              <p className="font-sans text-xs text-[#9fa2a7]">
                {phase.technicalNote}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.article>
  )
}
