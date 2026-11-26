import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Send,
} from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import type { BriefingStep } from "@/types/bersama"

interface SocraticChatCardProps {
  readonly step: BriefingStep
  readonly totalSteps: number
  readonly isCompleted: boolean
  readonly onStepComplete: (stepId: string, answer: string) => void
  readonly onNextStep: () => void
  readonly hasNextStep: boolean
  readonly className?: string
}

export function SocraticChatCard({
  step,
  totalSteps,
  isCompleted,
  onStepComplete,
  onNextStep,
  hasNextStep,
  className,
}: SocraticChatCardProps) {
  const [answer, setAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState("")
  const [feedbackState, setFeedbackState] = useState<"idle" | "nudge" | "success">(
    isCompleted ? "success" : "idle",
  )

  const tutorState =
    feedbackState === "success"
      ? "success"
      : feedbackState === "nudge"
        ? "nudge"
        : showHint
          ? "speaking"
          : "idle"

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = answer.trim()
    if (!trimmed) return

    setLastSubmittedAnswer(trimmed)

    if (trimmed.length < 15) {
      setFeedbackState("nudge")
    } else {
      setFeedbackState("success")
      onStepComplete(step.id, trimmed)
    }
  }

  const handleFillDemoAnswer = () => {
    if (step.order === 1) {
      setAnswer(
        "Dengan MVC, logika terpisah dari tampilan sehingga modul antrean bisa diuji unit test tanpa terikat UI, dan 4 anggota bisa kerja paralel tanpa konflik.",
      )
    } else {
      setAnswer(
        "JWT bersifat stateless sehingga server tidak perlu menyimpan session di RAM, sangat cocok karena aplikasi antrean kita akan diakses web dan mobile sekaligus.",
      )
    }
  }

  const handleFillShortAnswer = () => {
    setAnswer("Biar rapi aja.")
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-brand-subtle bg-surface-card py-0 shadow-card transition-[border-color,box-shadow] duration-150 ease-out",
        className,
      )}
    >
      <CardHeader className="border-b border-line-subtle bg-wash-brand/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand px-2.5 py-0.5 text-xs font-semibold text-on-brand tabular-nums">
              Langkah {step.order}/{totalSteps}
            </span>
            <span className="text-xs font-semibold text-ink-link">
              {step.decisionCode}
            </span>
          </div>

          {isCompleted ? (
            <Badge
              variant="outline"
              className="gap-1.5 border-success/40 bg-success-subtle text-xs font-medium text-text-success"
            >
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              <span>Dipahami</span>
            </Badge>
          ) : (
            <span className="rounded-full border border-brand-subtle bg-surface-card px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
              Dialog Socratic
            </span>
          )}
        </div>

        <CardTitle className="font-sans pt-2 text-lg font-semibold text-ink-primary">
          Refleksi {step.decisionCode}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* 1. Tutor Socratic Prompt Bubble */}
        <div className="flex items-start gap-3.5 rounded-xl border border-brand-subtle bg-wash-brand/45 p-4">
          <AgentStickerAvatar
            role="tutor"
            state={tutorState}
            size={44}
            label="Socratic Tutor"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-primary">
                Socratic Tutor
              </span>
              <span className="text-xs text-ink-link">Mentor AI</span>
            </div>

            <p className="text-sm leading-relaxed text-ink-primary">
              {step.tutorPrompt}
            </p>

            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-link hover:underline"
            >
              <Lightbulb className="size-3.5" aria-hidden="true" />
              <span>{showHint ? "Tutup Petunjuk" : "Lihat Petunjuk"}</span>
            </button>

            {showHint && (
              <div className="rounded-lg border border-info/30 bg-info-subtle p-3 text-xs leading-relaxed text-text-info animate-in fade-in-50 duration-150">
                <div className="flex items-center gap-1.5 pb-0.5 font-semibold">
                  <HelpCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Petunjuk:</span>
                </div>
                <p>{step.hint}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Student Response Bubble */}
        {lastSubmittedAnswer && (
          <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-surface p-4">
            <Avatar className="size-9 border border-line-subtle shadow-badge">
              <AvatarImage
                src={USER_AVATAR_MAP["user-sari"]}
                alt="Sari Wulandari"
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-semibold">SW</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-primary">
                  Sari Wulandari
                </span>
                <span className="text-xs text-ink-tertiary">Baru saja</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                "{lastSubmittedAnswer}"
              </p>
            </div>
          </div>
        )}

        {/* 3. Follow-Up Nudge */}
        {feedbackState === "nudge" && (
          <div className="flex items-start gap-3.5 rounded-xl border border-warning/40 bg-warning-subtle/40 p-4 animate-in fade-in-50 duration-200">
            <AgentStickerAvatar
              role="tutor"
              state="nudge"
              size={40}
              label="Tutor AI mengajak berpikir lebih dalam"
            />

            <div className="space-y-1">
              <p className="text-xs font-semibold text-ink-primary">
                Perdalam Sedikit Lagi
              </p>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Coba kaitkan dengan <strong className="text-ink-primary">{step.hint}</strong> dan
                dampaknya ke kolaborasi 4 anggota tim.
              </p>
            </div>
          </div>
        )}

        {/* 4. Praise & Synthesis */}
        {feedbackState === "success" && (
          <div className="flex items-start gap-3.5 rounded-xl border border-success/40 bg-success-subtle/35 p-4 animate-in fade-in-50 duration-200">
            <AgentStickerAvatar
              role="tutor"
              state="success"
              size={40}
              label="Tutor AI mengonfirmasi pemahaman"
            />

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-primary">
                  Pemahaman Tepat
                </p>
                <Badge
                  variant="outline"
                  className="border-success/40 bg-success-subtle text-xs font-medium text-text-success"
                >
                  Konsep Dikuasai
                </Badge>
              </div>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Inti keputusan: <strong className="text-ink-primary">{step.expectedConcept}</strong>.
                Konteks ini otomatis masuk ke Personal Agent kamu.
              </p>

              {hasNextStep && (
                <div className="pt-1">
                  <Button type="button" size="sm" onClick={onNextStep}>
                    <span>
                      Lanjut {step.order === 1 ? "DEC-02 JWT" : "Berikutnya"}
                    </span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Input Form */}
        {feedbackState !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label
                htmlFor="socratic-answer-input"
                className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary"
              >
                <MessageSquare className="size-3.5 text-ink-link" aria-hidden="true" />
                <span>Jawabanmu</span>
              </label>

              <Textarea
                id="socratic-answer-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tulis alasan keputusan arsitektur ini menurut pemahamanmu..."
                className="min-h-[100px] border-line-default bg-surface-card text-base leading-relaxed text-ink-primary sm:text-sm"
              />
            </div>

            {/* Quick Simulation Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-ink-tertiary">Simulasi:</span>
              <button
                type="button"
                onClick={handleFillDemoAnswer}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-success/35 bg-success-subtle/50 px-3 py-1 text-xs font-medium text-text-success transition-[background-color,transform] duration-150 hover:bg-success-subtle active:scale-[0.98]"
              >
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Jawaban Reflektif (Lulus)</span>
              </button>
              <button
                type="button"
                onClick={handleFillShortAnswer}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-warning/35 bg-warning-subtle/50 px-3 py-1 text-xs font-medium text-text-warning transition-[background-color,transform] duration-150 hover:bg-warning-subtle active:scale-[0.98]"
              >
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Jawaban Singkat (Nudge)</span>
              </button>
            </div>

            <div className="flex items-center justify-end border-t border-line-subtle pt-3">
              <Button type="submit" disabled={!answer.trim()}>
                <Send className="size-3.5" aria-hidden="true" />
                <span>Kirim Jawaban</span>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
