import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { CheckCircle2, Clock, GraduationCap } from "lucide-react"
import { Pill, PillIndicator } from "@/components/kibo-ui/pill"
import { bersamaApi } from "@/services/api"
import { cn } from "@/lib/utils"
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

  // Load briefing steps & Project Brain decisions on mount
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

  // Find decision in Project Brain matching currentStep.decisionCode
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
        <div className="h-24 rounded-xl border border-line-subtle bg-surface p-5 shadow-surface" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-72 rounded-xl border border-line-subtle bg-surface p-5 shadow-surface lg:col-span-5" />
          <div className="h-72 rounded-xl border border-line-subtle bg-surface p-5 shadow-surface lg:col-span-7" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Onboarding Progress Header */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent-violet uppercase">
              TRACK B · FITUR F8 · SOCRATIC ONBOARDING
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Pill
              variant="secondary"
              className="border border-line-subtle bg-surface shadow-surface text-ink-secondary font-mono text-[11px]"
            >
              <PillIndicator variant="success" />
              <span>Skenario Sari Wulandari · Minggu ke-3</span>
            </Pill>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-ink-primary sm:text-3xl">
              Tutored Briefing
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-ink-secondary sm:text-sm">
              Mentoring Socratic 10 menit untuk menuntun anggota baru memahami keputusan arsitektur tim
              secara mendalam, bukan membaca rangkuman pasif.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1 font-mono text-xs text-ink-tertiary shadow-surface">
            <Clock className="size-3.5 text-brand" />
            <span>~10 menit sesi reflektif</span>
          </div>
        </div>

        {/* Step Stepper Tabs */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
            <span>
              Progres Konsep: {completedStepIds.size} dari {steps.length} Selesai
            </span>
            <span>{isAllCompleted ? "Semua Konsep Dikuasai" : `Sedang Membahas Langkah 0${currentStepIndex + 1}`}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {steps.map((s, idx) => {
              const isDone = completedStepIds.has(s.id)
              const isActive = idx === currentStepIndex

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStep(idx)}
                  className={cn(
                    "flex min-h-11 items-center justify-between rounded-xl border p-2.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99]",
                    isActive
                      ? "border-brand bg-brand/5 shadow-xs dark:bg-brand/10"
                      : isDone
                        ? "border-success/40 bg-success-subtle/20"
                        : "border-line-subtle bg-surface hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[10px] font-mono font-semibold",
                        isDone
                          ? "bg-success text-on-success"
                          : isActive
                            ? "bg-brand text-on-brand"
                            : "bg-muted text-ink-tertiary",
                      )}
                    >
                      {isDone ? <CheckCircle2 className="size-3" /> : idx + 1}
                    </span>

                    <span className="font-heading text-xs font-semibold text-ink-primary">
                      {s.decisionCode}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-ink-tertiary">
                    {idx === 0 ? "MVC Pattern" : "JWT Auth"}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Workspace View: All Completed Summary OR 2-Column Socratic Workspace */}
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
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-tertiary">
              <GraduationCap className="size-4 text-brand" />
              <span>Konteks Keputusan Project Brain Terkait:</span>
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
