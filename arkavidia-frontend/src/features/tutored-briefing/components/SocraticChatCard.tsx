import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Send,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { BriefingStep } from "@/types/bersama"
import avatarSari from "@/features/landing/assets/avatar-sari.jpg"

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = answer.trim()
    if (!trimmed) return

    setLastSubmittedAnswer(trimmed)

    // Socratic responsive evaluation
    if (trimmed.length < 15) {
      // Follow-up nudge: not failed, but encourages deeper reflection
      setFeedbackState("nudge")
    } else {
      // Adequate answer: praise and complete step
      setFeedbackState("success")
      onStepComplete(step.id, trimmed)
    }
  }

  // Quick Demo Simulator
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
        "overflow-hidden border border-line-subtle bg-surface shadow-surface transition-[border-color,box-shadow] duration-150 ease-out",
        className,
      )}
    >
      <CardHeader className="border-b border-line-subtle bg-canvas/30 p-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand dark:bg-brand/20">
              LANGKAH 0{step.order} / 0{totalSteps}
            </span>
            <span className="font-mono text-xs text-ink-tertiary">
              {step.decisionCode}
            </span>
          </div>

          {isCompleted ? (
            <Badge
              variant="outline"
              className="gap-1 border-success/40 bg-success-subtle font-mono text-xs font-medium text-text-success"
            >
              <CheckCircle2 className="size-3.5" />
              Selesai Dipahami
            </Badge>
          ) : (
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-ink-tertiary">
              Sesi Tanya Jawab Socratic
            </span>
          )}
        </div>

        <CardTitle className="font-heading pt-2 text-base font-semibold text-ink-primary sm:text-lg">
          Onboarding Reflektif: {step.decisionCode}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* 1. Tutor Socratic Prompt Bubble */}
        <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-canvas/40 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand shadow-xs">
            <Bot className="size-5" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold text-ink-primary">
                Tutor AI (Mentor Socratic)
              </span>
              <span className="font-mono text-[10px] text-ink-tertiary">Pemandu Onboarding</span>
            </div>

            <p className="text-xs leading-relaxed text-ink-primary sm:text-sm">
              {step.tutorPrompt}
            </p>

            {/* Hint Toggle Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
              >
                <Lightbulb className="size-3.5" />
                {showHint ? "Sembunyikan Petunjuk" : "Tampilkan Petunjuk (Hint)"}
              </button>
            </div>

            {/* Collapsible Hint Card (bg-info-subtle text-text-info) */}
            {showHint && (
              <div className="rounded-lg border border-info/30 bg-info-subtle p-3 text-xs leading-relaxed text-text-info animate-in fade-in-50 duration-150">
                <div className="flex items-center gap-1.5 font-semibold pb-0.5">
                  <HelpCircle className="size-3.5 shrink-0" />
                  <span>Petunjuk Diskusi:</span>
                </div>
                <p>{step.hint}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. User Response History (if already submitted) */}
        {lastSubmittedAnswer && (
          <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-surface p-4">
            <Avatar className="size-9 border border-line-subtle shadow-xs">
              <AvatarImage src={avatarSari} alt="Sari Wulandari" className="object-cover" />
              <AvatarFallback className="text-xs font-semibold">SW</AvatarFallback>
            </Avatar>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold text-ink-primary">
                  Sari Wulandari (Kamu)
                </span>
                <span className="font-mono text-[10px] text-ink-tertiary">Baru saja</span>
              </div>
              <p className="text-xs leading-relaxed text-ink-secondary">
                "{lastSubmittedAnswer}"
              </p>
            </div>
          </div>
        )}

        {/* 3. Follow-Up Nudge (Short Answer Response) */}
        {feedbackState === "nudge" && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-subtle/40 p-4 animate-in fade-in-50 duration-200">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-subtle text-text-warning">
              <Lightbulb className="size-4" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <p className="font-heading text-xs font-semibold text-ink-primary">
                Tutor AI: Pertanyaan Lanjutan (Follow-Up Nudge)
              </p>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Jawabanmu menarik, namun masih terlalu singkat! Coba pikirkan lebih dalam:{" "}
                <strong className="text-ink-primary">{step.hint}</strong>. Menurutmu, bagaimana
                pilihan arsitektur ini mempermudah pembagian tugas antara 4 anggota?
              </p>
            </div>
          </div>
        )}

        {/* 4. Praise & Synthesis (Adequate Answer Response) */}
        {feedbackState === "success" && (
          <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success-subtle/30 p-4 animate-in fade-in-50 duration-200">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-on-success">
              <CheckCircle2 className="size-4" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-heading text-xs font-semibold text-ink-primary">
                  Tutor AI: Pemikiran yang Tepat!
                </p>
                <Badge
                  variant="outline"
                  className="border-success/40 bg-success-subtle font-mono text-[10px] text-text-success"
                >
                  Konsep Dikuasai
                </Badge>
              </div>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Tepat sekali! Inti arsitektural keputusannya adalah:{" "}
                <strong className="text-ink-primary">{step.expectedConcept}</strong>. Sekarang
                Personal Agent kamu telah menyinkronkan konteks ini.
              </p>

              {hasNextStep && (
                <div className="pt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={onNextStep}
                    className="bg-brand text-on-brand hover:bg-brand-hover text-xs font-medium shadow-sm"
                  >
                    Lanjut ke Konsep Berikutnya ({step.order === 1 ? "DEC-02 JWT" : "Selesai"})
                    <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Input Area (Active when not yet completed or iterating on nudge) */}
        {feedbackState !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label
                htmlFor="socratic-answer-input"
                className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary"
              >
                <MessageSquare className="size-3.5 text-brand" />
                Refleksikan alasan keputusan menurut sudut pandangmu:
              </label>

              <Textarea
                id="socratic-answer-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tulis alasan mengapa kelompok memilih arsitektur ini berdasarkan petunjuk di atas..."
                className="min-h-[100px] border-line-subtle bg-surface text-sm leading-relaxed text-ink-primary shadow-xs"
              />

              <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
                <span>Minimal ~15 karakter untuk membentuk argumen yang solid.</span>
                <span className="font-mono tabular-nums">{answer.length} karakter</span>
              </div>
            </div>

            {/* Quick Demo Simulator Buttons */}
            <div className="rounded-lg border border-dashed border-line-subtle bg-canvas/30 p-2.5">
              <div className="flex items-center justify-between pb-1 text-[11px] text-ink-tertiary">
                <span className="font-semibold text-ink-secondary">Bantuan Cepat Skenario Demo:</span>
                <span>Uji 2 respon Socratic</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleFillDemoAnswer}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-success/30 bg-success-subtle/40 px-2.5 py-1 text-[11px] font-medium text-text-success transition-colors duration-150 hover:bg-success-subtle active:scale-[0.98]"
                >
                  <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                  <span>Isi Jawaban Reflektif (Lulus)</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillShortAnswer}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-warning/30 bg-warning-subtle/40 px-2.5 py-1 text-[11px] font-medium text-text-warning transition-colors duration-150 hover:bg-warning-subtle active:scale-[0.98]"
                >
                  <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
                  <span>Isi Jawaban Singkat (Picu Nudge)</span>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between border-t border-line-subtle pt-3">
              <span className="text-[11px] text-ink-tertiary">
                Bebas menjawab dengan pemahamanmu sendiri tanpa takut salah.
              </span>

              <Button
                type="submit"
                disabled={!answer.trim()}
                className="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm font-medium text-xs"
              >
                <Send className="size-3.5 mr-1.5" />
                Kirim Jawaban
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
