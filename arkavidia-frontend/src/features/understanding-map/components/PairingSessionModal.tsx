import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { bersamaApi } from "@/services/api"
import { cn } from "@/lib/utils"
import type { MemoryItem, PairingSuggestion } from "@/types/bersama"

const TOTAL_SESSION_SECONDS = 600 // 10 minutes (10:00)

interface PairingSessionModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly suggestion: PairingSuggestion | null
  readonly teamId: string
}

interface PairingSessionModalBodyProps {
  readonly suggestion: PairingSuggestion
  readonly teamId: string
  readonly onOpenChange: (open: boolean) => void
}

function PairingSessionModalBody({
  suggestion,
  teamId,
  onOpenChange,
}: PairingSessionModalBodyProps) {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(TOTAL_SESSION_SECONDS)
  const [isRunning, setIsRunning] = useState(true)
  const [decisionItem, setDecisionItem] = useState<MemoryItem | null>(null)
  const [isLoadingDecision, setIsLoadingDecision] = useState(true)
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
  })

  useEffect(() => {
    let isCancelled = false

    void bersamaApi
      .getProjectBrain(teamId)
      .then((items) => {
        if (isCancelled) return
        const matched =
          items.find((i) => i.kcIds.includes(suggestion.kcId) && i.status === "confirmed") ??
          items.find((i) => i.kcIds.includes(suggestion.kcId)) ??
          items[0]
        setDecisionItem(matched ?? null)
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingDecision(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [suggestion.kcId, teamId])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, timeLeft])

  const toggleTimer = () => setIsRunning((prev) => !prev)
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(TOTAL_SESSION_SECONDS)
  }

  const togglePoint = (index: number) => {
    setCheckedPoints((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const progressPercent = Math.round(
    ((TOTAL_SESSION_SECONDS - timeLeft) / TOTAL_SESSION_SECONDS) * 100,
  )

  const handleFinishAndNavigate = () => {
    onOpenChange(false)
    void navigate(`/teams/${teamId}/check`)
  }

  const summaryText =
    decisionItem?.content.summary ??
    "Modul autentikasi login menggunakan JWT dengan masa berlaku akses singkat dan refresh token."
  const rationaleText =
    decisionItem?.content.rationale ??
    "API dikonsumsi klien web serta aplikasi mobile tanpa shared server-side session store."
  const rejectedText =
    decisionItem?.content.rejectedAlternatives.length
      ? decisionItem.content.rejectedAlternatives.join(", ")
      : "Server-side Session di RAM, Basic Auth"

  const checklistItems = [
    {
      title: "1. Apa yang diputuskan?",
      detail: summaryText,
      badge: decisionItem?.code ?? "DEC-02",
    },
    {
      title: "2. Kenapa pendekatan ini dipilih?",
      detail: rationaleText,
      badge: "Alasan",
    },
    {
      title: "3. Kenapa alternatif lain ditolak?",
      detail: `Ditolak: ${rejectedText}`,
      badge: "Trade-off",
    },
  ]

  const allPointsChecked = Object.values(checkedPoints).every(Boolean)

  return (
    <>
      <DialogHeader className="border-b border-line-subtle bg-wash-cyan p-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-subtle bg-surface-card px-2.5 py-0.5 text-xs font-medium text-ink-cyan shadow-badge">
            <Clock className="size-3.5" aria-hidden="true" />
            Sesi 10 Menit · Jelaskan ke Aku
          </span>

          <span className="text-xs font-semibold tabular-nums text-text-success">
            Proyeksi: {suggestion.projectedCoverageBefore} → {suggestion.projectedCoverageAfter}
          </span>
        </div>

        <DialogTitle className="font-display pt-1 text-xl font-semibold text-ink-primary">
          Sesi Pemahaman: {suggestion.kcName}
        </DialogTitle>
        <DialogDescription className="text-xs text-ink-secondary">
          Diskusi terstruktur untuk meratakan pemahaman sebelum Explain-Back Check.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 p-5">
        {/* Pair Collaboration Header */}
        <div className="flex items-center justify-between rounded-xl border border-line-subtle bg-surface p-3.5">
          {/* Mentor */}
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border-2 border-success/50">
              <AvatarImage
                src={USER_AVATAR_MAP[suggestion.mentor.id]}
                alt={suggestion.mentor.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-semibold">
                {suggestion.mentor.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-sans text-sm font-semibold text-ink-primary">
                {suggestion.mentor.name}
              </p>
              <p className="text-xs font-medium text-text-success">
                Mentor
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <ArrowRight className="size-4 text-ink-cyan" aria-hidden="true" />
            <span className="text-xs text-ink-secondary">10 menit</span>
          </div>

          {/* Learner */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-sans text-sm font-semibold text-ink-primary">
                {suggestion.learner.name}
              </p>
              <p className="text-xs text-ink-secondary">Belajar Bareng</p>
            </div>
            <Avatar className="size-10 border-2 border-line-subtle">
              <AvatarImage
                src={USER_AVATAR_MAP[suggestion.learner.id]}
                alt={suggestion.learner.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-semibold">
                {suggestion.learner.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Countdown Timer Block */}
        <div className="rounded-xl border border-line-subtle bg-surface-card p-4 shadow-card">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full transition-[background-color,color] duration-150",
                  isRunning
                    ? "bg-wash-cyan text-ink-cyan"
                    : "bg-muted text-ink-secondary",
                )}
              >
                <Clock className="size-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-medium tracking-wide text-ink-secondary uppercase">
                  Waktu Tersisa
                </span>
                <div className="kpi-hero text-4xl font-semibold text-ink-primary">
                  {formattedTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={toggleTimer}
                variant={isRunning ? "secondary" : "default"}
                className={cn(
                  "font-medium",
                  !isRunning && "bg-brand text-on-brand shadow-primary hover:bg-brand-hover",
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-1.5 size-3.5" aria-hidden="true" />
                    Jeda
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 size-3.5" aria-hidden="true" />
                    Mulai
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={resetTimer}
                aria-label="Reset timer ke 10:00"
                title="Reset ke 10:00"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-tertiary transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Grounded Discussion Points */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="size-4 text-ink-cyan" aria-hidden="true" />
              <h3 className="font-sans text-xs font-semibold tracking-wide text-ink-primary uppercase">
                Panduan Diskusi ({decisionItem?.code ?? "DEC-02"})
              </h3>
            </div>
            <span className="text-xs tabular-nums text-ink-secondary">
              {Object.values(checkedPoints).filter(Boolean).length}/3 Dibahas
            </span>
          </div>

          {isLoadingDecision ? (
            <div className="space-y-2 py-2" role="status" aria-label="Memuat konteks keputusan">
              {[1, 2].map((slot) => (
                <div key={slot} className="h-14 rounded-xl border border-line-subtle bg-surface" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {checklistItems.map((item, idx) => {
                const isChecked = Boolean(checkedPoints[idx])
                return (
                  <button
                    key={idx}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => togglePoint(idx)}
                    className={cn(
                      "group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.99] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isChecked
                        ? "border-success/40 bg-success-subtle/30"
                        : "border-line-subtle bg-surface-card hover:border-tertiary",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-[border-color,background-color] duration-150",
                        isChecked
                          ? "border-success bg-success text-on-success"
                          : "border-line-default bg-surface-card group-hover:border-tertiary",
                      )}
                    >
                      {isChecked && <CheckCircle2 className="size-3.5 stroke-[2.5]" />}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-ink-primary">{item.title}</span>
                        <span className="rounded bg-surface px-2 py-0.5 text-xs font-medium text-ink-secondary">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink-secondary">{item.detail}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="border-t border-line-subtle bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-secondary">
          Lanjut ke Explain-Back untuk memperbarui skor P(L).
        </p>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>

          <Button
            size="sm"
            onClick={handleFinishAndNavigate}
            className={cn(
              "font-medium shadow-primary",
              allPointsChecked
                ? "bg-success text-on-success hover:bg-success/90"
                : "bg-brand text-on-brand hover:bg-brand-hover",
            )}
          >
            <CheckCircle2 className="mr-1.5 size-3.5" aria-hidden="true" />
            Lanjut Explain-Back
            <ArrowRight className="ml-1 size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

export function PairingSessionModal({
  open,
  onOpenChange,
  suggestion,
  teamId,
}: PairingSessionModalProps) {
  if (!suggestion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border border-line-subtle bg-surface-raised p-0 ring-0 shadow-raised sm:max-w-xl">
        <PairingSessionModalBody
          key={suggestion.id}
          suggestion={suggestion}
          teamId={teamId}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}
