import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { CheckCircle2, Clock, GraduationCap } from "lucide-react"
import { Pill, PillIndicator } from "@/components/kibo-ui/pill"
import { cn } from "@/lib/utils"
import { bersamaApi } from "@/services/api"
import type { BriefingStep, MemoryItem } from "@/types/bersama"
import { BriefingCompletionCard } from "./components/BriefingCompletionCard"
import { DecisionContextPanel } from "./components/DecisionContextPanel"
import { SocraticChatCard } from "./components/SocraticChatCard"

export function TutoredBriefingPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [steps, setSteps] = useState<readonly BriefingStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set())
  const [brainItems, setBrainItems] = useState<readonly MemoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    Promise.all([
      bersamaApi.getBriefingSteps(),
      bersamaApi.getProjectBrain(teamId),
    ])
      .then(([fetchedSteps, fetchedBrain]) => {
        if (isCancelled) return
        setSteps(fetchedSteps)
        setBrainItems(fetchedBrain)
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [teamId])

  const currentStep = steps[currentStepIndex]
  const isAllCompleted = steps.length > 0 && completedStepIds.size >= steps.length
  const completionPct = steps.length > 0
    ? Math.round((completedStepIds.size / steps.length) * 100)
    : 0

  const currentDecision =
    brainItems.find(
      (item) => item.code === currentStep?.decisionCode && item.status === "confirmed",
    ) ??
    brainItems.find((item) => item.code === currentStep?.decisionCode) ??
    null

  const handleStepComplete = (stepId: string) => {
    setCompletedStepIds((prev) => new Set([...prev, stepId]))
  }

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index)
  }

  const handleReset = () => {
    setCompletedStepIds(new Set())
    setCurrentStepIndex(0)
  }

  if (isLoading || steps.length === 0) {
    return (
      <div className="space-y-4 pb-16" role="status" aria-label="Menyiapkan modul Tutored Briefing">
        <div className="h-32 rounded-2xl border border-cyan-subtle bg-wash-cyan p-5 shadow-card" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-72 rounded-xl border border-line-subtle bg-surface-card p-5 shadow-card lg:col-span-7" />
          <div className="h-72 rounded-xl border border-line-subtle bg-surface-card p-5 shadow-card lg:col-span-5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Fresh Cyan Header & Progress Strip */}
      <section className="space-y-4 rounded-2xl border border-cyan-subtle bg-wash-cyan p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Pill
            variant="secondary"
            className="border border-cyan-subtle bg-surface-card text-xs font-medium text-ink-secondary shadow-badge"
          >
            <PillIndicator variant="success" />
            <span>Sari Wulandari · Minggu ke-3</span>
          </Pill>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-subtle bg-surface-card px-3 py-1 text-xs font-medium text-ink-secondary shadow-badge">
            <Clock className="size-3.5 text-ink-cyan" aria-hidden="true" />
            <span>~10 menit</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold text-ink-primary sm:text-3xl">
              Tutored <span className="font-display-oblique text-ink-cyan">Briefing</span>
            </h1>
            <p className="text-sm text-ink-secondary">
              Pahami alasan keputusan tim lewat dialog Socratic interaktif.
            </p>
          </div>

          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0.5">
            <span className="kpi-hero text-[36px] leading-none font-semibold text-ink-cyan">
              {completionPct}%
            </span>
            <span className="text-xs font-medium text-ink-secondary tabular-nums">
              {completedStepIds.size}/{steps.length} konsep selesai
            </span>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {steps.map((s, idx) => {
            const isDone = completedStepIds.has(s.id)
            const isActive = idx === currentStepIndex

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={cn(
                  "flex min-h-12 items-center justify-between rounded-xl border bg-surface-card px-3.5 py-2.5 text-left shadow-card transition-[border-color,background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.99]",
                  isActive
                    ? "border-tertiary bg-surface-card"
                    : isDone
                      ? "border-success/40 bg-success-subtle/30"
                      : "border-line-subtle hover:border-line-default",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                      isDone
                        ? "bg-success text-on-success"
                        : isActive
                          ? "bg-tertiary text-on-tertiary"
                          : "bg-muted text-ink-secondary",
                    )}
                  >
                    {isDone ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : idx + 1}
                  </span>

                  <span className="text-sm font-semibold text-ink-primary">
                    {s.decisionCode}
                  </span>
                </div>

                <span className="text-xs font-medium text-ink-secondary">
                  {idx === 0 ? "MVC Pattern" : "JWT Auth"}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. Workspace View */}
      {isAllCompleted ? (
        <BriefingCompletionCard teamId={teamId} onReset={handleReset} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Socratic Interactive Chat (7 cols) */}
          <div className="lg:col-span-7">
            {currentStep && (
              <SocraticChatCard
                key={currentStep.id}
                step={currentStep}
                totalSteps={steps.length}
                isCompleted={completedStepIds.has(currentStep.id)}
                onStepComplete={handleStepComplete}
                onNextStep={handleNextStep}
                hasNextStep={currentStepIndex < steps.length - 1}
              />
            )}
          </div>

          {/* Right Column: Project Brain Context Reference Panel (5 cols) */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
              <GraduationCap className="size-4 text-ink-cyan" aria-hidden="true" />
              <span>Referensi Project Brain</span>
            </div>

            <DecisionContextPanel
              decisionItem={currentDecision}
              isStepCompleted={Boolean(currentStep && completedStepIds.has(currentStep.id))}
            />
          </div>
        </div>
      )}
    </div>
  )
}
