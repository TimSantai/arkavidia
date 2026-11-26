import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { CheckCircle2, Clock, GraduationCap } from "lucide-react"
import {
  MainWithAside,
  PageContainer,
  PageHeader,
} from "@/components/layout/page"
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
      <PageContainer width="wide" className="space-y-6 sm:space-y-8">
        <div className="h-32 rounded-2xl border border-brand-subtle bg-wash-brand p-5" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="h-72 rounded-2xl border border-line-subtle bg-surface-card p-5" />
          <div className="h-72 rounded-2xl border border-line-subtle bg-surface-card p-5" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="wide" className="space-y-6 sm:space-y-8">
      {/* 1. Standardized Unified Header */}
      <PageHeader
        title={
          <>
            Tutored <span className="font-display-oblique text-ink-link">Briefing</span>
          </>
        }
        description="Pahami alasan keputusan tim lewat dialog Socratic interaktif."
        badge={
          <Pill
            variant="secondary"
            className="border border-brand-subtle bg-wash-brand text-xs font-medium text-ink-link"
          >
            <PillIndicator variant="success" />
            <span>Sari Wulandari · Minggu ke-3</span>
          </Pill>
        }
        actions={
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-card px-3 py-1 text-xs font-medium text-ink-secondary shadow-xs">
            <Clock className="size-3.5 text-ink-link" aria-hidden="true" />
            <span>~10 menit</span>
          </div>
        }
      />

      {/* Progress & Stepper Section (Pastel Card) */}
      <section className="space-y-4 rounded-2xl border border-brand-subtle bg-wash-brand p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Progres Pemahaman
            </span>
            <p className="text-xs text-ink-secondary">
              {completedStepIds.size} dari {steps.length} konsep selesai
            </p>
          </div>

          <span className="kpi-hero text-3xl font-semibold text-ink-link">
            {completionPct}%
          </span>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {steps.map((s, idx) => {
            const isDone = completedStepIds.has(s.id)
            const isActive = idx === currentStepIndex

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={cn(
                  "flex min-h-12 items-center justify-between rounded-xl border bg-surface-card px-3.5 py-2.5 text-left transition-[border-color,background-color] duration-150 active:scale-[0.99]",
                  isActive
                    ? "border-line-active bg-surface-card shadow-xs"
                    : isDone
                      ? "border-success/40 bg-success-subtle/20"
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
                          ? "bg-brand text-on-brand"
                          : "bg-surface text-ink-secondary",
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

      {/* 2. Workspace View with MainWithAside Primitive */}
      {isAllCompleted ? (
        <BriefingCompletionCard teamId={teamId} onReset={handleReset} />
      ) : (
        <MainWithAside
          asideWidth="400px"
          sticky={true}
          stickyOffset="top-6"
          main={
            <div>
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
          }
          aside={
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
                <GraduationCap className="size-4 text-ink-link" aria-hidden="true" />
                <span>Referensi Project Brain</span>
              </div>

              <DecisionContextPanel
                decisionItem={currentDecision}
                isStepCompleted={Boolean(currentStep && completedStepIds.has(currentStep.id))}
              />
            </div>
          }
        />
      )}
    </PageContainer>
  )
}
