import { useState } from "react"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WEEKLY_CYCLES, type WeeklyCyclePhase } from "../landingData"

export function WeeklyCycleSection() {
  const [selectedId, setSelectedId] = useState<WeeklyCyclePhase["id"]>("capture")
  const activePhase =
    WEEKLY_CYCLES.find((phase) => phase.id === selectedId) ?? WEEKLY_CYCLES[0]

  return (
    <section id="cara-kerja" className="scroll-mt-20 py-14 sm:py-16">
      <div className="max-w-2xl space-y-2.5">
        <p className="font-mono text-xs font-medium tracking-wide text-ink-tertiary">
          SIKLUS MINGGUAN
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
          Tangkap → Petakan → Uji Paham → Tutup Celah
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Pilih salah satu fase di bawah ini untuk melihat mekanisme AI dan statistik yang berjalan di balik layar tanpa menggantikan diskusi manusia.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Siklus mingguan BERSAMA"
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {WEEKLY_CYCLES.map((phase) => {
          const isSelected = phase.id === activePhase.id
          return (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedId(phase.id)}
              className={cn(
                "flex flex-col rounded-xl border p-4 text-left transition-[border-color,box-shadow,background-color] duration-150 ease-out",
                isSelected
                  ? "border-line-active bg-surface shadow-raised"
                  : "border-line-subtle bg-surface/80 shadow-surface hover:border-line-default"
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-xs font-medium tabular-nums",
                    isSelected ? "text-ink-link" : "text-ink-tertiary"
                  )}
                >
                  FASE {phase.step}
                </span>
                <span
                  className={cn(
                    "size-2 rounded-full transition-colors duration-150",
                    isSelected ? "bg-brand" : "bg-muted"
                  )}
                />
              </div>
              <span className="mt-2 font-heading text-base font-semibold text-ink-primary">
                {phase.title}
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-ink-secondary text-pretty">
                {phase.shortSummary}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 min-h-[240px] rounded-xl border border-line-subtle bg-surface p-5 shadow-surface sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-12"
          >
            <div className="space-y-3 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-info">
                  FASE {activePhase.step} • {activePhase.title.toUpperCase()}
                </span>
                <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                  {activePhase.formulaTag}
                </span>
              </div>

              <h3 className="font-heading text-lg font-semibold text-ink-primary sm:text-xl">
                {activePhase.mechanismTitle}
              </h3>

              <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-[15px]">
                {activePhase.mechanismPlain}
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-lg border border-line-subtle bg-canvas p-4 lg:col-span-5">
              <div className="space-y-2">
                <p className="font-mono text-[11px] font-medium text-ink-tertiary">
                  {activePhase.scenarioLabel}
                </p>
                <p className="text-sm leading-relaxed text-ink-primary text-pretty">
                  {activePhase.scenarioDetail}
                </p>
              </div>

              <div>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link to={activePhase.demoPath}>
                    {activePhase.demoCta}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
