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
  Sparkles,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { bersamaApi } from "@/services/api"
import { cn } from "@/lib/utils"
import type { MemoryItem, PairingSuggestion } from "@/types/bersama"
import avatarRani from "@/features/landing/assets/avatar-rani.jpg"
import avatarDimas from "@/features/landing/assets/avatar-dimas.jpg"
import avatarBudi from "@/features/landing/assets/avatar-budi.jpg"
import avatarSari from "@/features/landing/assets/avatar-sari.jpg"

const USER_AVATARS: Record<string, string> = {
  "user-rani": avatarRani,
  "user-dimas": avatarDimas,
  "user-budi": avatarBudi,
  "user-sari": avatarSari,
}

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

  // Fetch Project Brain grounded decision asynchronously
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

  // Accurate Countdown Timer with clearInterval cleanup
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

  // Fallbacks if no decision recorded yet in Project Brain
  const summaryText =
    decisionItem?.content.summary ??
    "Modul autentikasi login menggunakan JWT dengan masa berlaku akses singkat dan refresh token."
  const rationaleText =
    decisionItem?.content.rationale ??
    "API akan dikonsumsi klien web serta aplikasi antrean mobile tanpa shared server-side session store."
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
      title: "2. Kenapa memilih pendekatan ini?",
      detail: rationaleText,
      badge: "Alasan Arsitektural",
    },
    {
      title: "3. Kenapa alternatif lain ditolak?",
      detail: `Alternatif yang ditolak: ${rejectedText}`,
      badge: "Trade-off",
    },
  ]

  const allPointsChecked = Object.values(checkedPoints).every(Boolean)

  return (
    <>
      <DialogHeader className="border-b border-line-subtle bg-canvas/30 p-5 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-accent-violet/30 bg-accent-violet/10 font-mono text-[11px] text-accent-violet dark:bg-accent-violet/20"
          >
            <Sparkles className="size-3 mr-1" />
            Sesi 10 Menit · Jelaskan ke Aku
          </Badge>

          <span className="font-mono text-xs text-text-success font-semibold">
            Proyeksi: {suggestion.projectedCoverageBefore} → {suggestion.projectedCoverageAfter}
          </span>
        </div>

        <DialogTitle className="font-heading pt-1 text-xl font-semibold text-ink-primary">
          Sesi Pemahaman: {suggestion.kcName}
        </DialogTitle>
        <DialogDescription className="text-xs text-ink-secondary">
          Diskusi santai terstruktur antara anggota untuk mendesentralisasi knowledge silo sebelum
          menguji pemahaman mandiri di Explain-Back Check.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 p-5">
        {/* Pair Collaboration Header */}
        <div className="flex items-center justify-between rounded-xl border border-line-subtle bg-canvas/40 p-3.5">
          {/* Mentor */}
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border-2 border-success/50">
              <AvatarImage
                src={USER_AVATARS[suggestion.mentor.id]}
                alt={suggestion.mentor.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-semibold">
                {suggestion.mentor.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading text-xs font-semibold text-ink-primary">
                {suggestion.mentor.name}
              </p>
              <p className="text-[11px] font-medium text-text-success">
                Rekan yang Menjelaskan (Mentor)
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="size-4 text-ink-tertiary" />
            <span className="font-mono text-[10px] text-ink-tertiary">10 menit</span>
          </div>

          {/* Learner */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-heading text-xs font-semibold text-ink-primary">
                {suggestion.learner.name}
              </p>
              <p className="text-[11px] text-ink-tertiary">Rekan yang Belajar (Learner)</p>
            </div>
            <Avatar className="size-10 border-2 border-line-subtle">
              <AvatarImage
                src={USER_AVATARS[suggestion.learner.id]}
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
        <div className="rounded-xl border border-line-subtle bg-surface p-4 shadow-surface">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full transition-colors",
                  isRunning
                    ? "bg-brand/10 text-brand dark:bg-brand/20"
                    : "bg-muted text-ink-tertiary",
                )}
              >
                <Clock className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[11px] tracking-wide text-ink-tertiary uppercase">
                  WAKTU TERSISA SESI
                </span>
                <div className="font-heading font-mono text-3xl font-semibold tabular-nums text-ink-primary">
                  {formattedTime}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={toggleTimer}
                variant={isRunning ? "secondary" : "default"}
                className={cn(
                  "font-medium shadow-xs",
                  !isRunning && "bg-brand text-on-brand hover:bg-brand-hover",
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="size-3.5 mr-1.5" />
                    Jeda
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 mr-1.5" />
                    Mulai
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={resetTimer}
                className="border-line-subtle text-xs hover:bg-muted"
                title="Reset ke 10:00"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Time progress bar */}
          <div className="mt-3 overflow-hidden rounded-full bg-muted h-1.5">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Grounded Discussion Points from Project Brain DEC-02 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="size-4 text-brand" />
              <h3 className="font-heading text-xs font-semibold tracking-wide text-ink-primary uppercase">
                PANDUAN DISKUSI (DARI PROJECT BRAIN DEC-02)
              </h3>
            </div>
            <span className="font-mono text-[11px] text-ink-tertiary">
              {Object.values(checkedPoints).filter(Boolean).length}/3 Selesai Dibahas
            </span>
          </div>

          {isLoadingDecision ? (
            <p className="font-mono text-xs text-ink-tertiary animate-pulse p-4 text-center">
              Memuat konteks keputusan dari Project Brain...
            </p>
          ) : (
            <div className="space-y-2.5">
              {checklistItems.map((item, idx) => {
                const isChecked = Boolean(checkedPoints[idx])
                return (
                  <div
                    key={idx}
                    onClick={() => togglePoint(idx)}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all select-none",
                      isChecked
                        ? "border-success/30 bg-success-subtle/20 dark:bg-success-subtle/10"
                        : "border-line-subtle bg-surface hover:border-brand/40",
                    )}
                  >
                    <button
                      type="button"
                      aria-checked={isChecked}
                      role="checkbox"
                      className={cn(
                        "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        isChecked
                          ? "border-success bg-success text-on-success"
                          : "border-line-default bg-surface group-hover:border-brand",
                      )}
                    >
                      {isChecked && <CheckCircle2 className="size-3.5 stroke-[2.5]" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink-primary">{item.title}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-ink-tertiary">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink-secondary">{item.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="border-t border-line-subtle bg-canvas/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-ink-tertiary">
          Setelah sesi, kuis adaptif Explain-Back akan memperbarui skor P(L) mandiri.
        </p>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-line-subtle text-xs"
          >
            Tutup
          </Button>

          <Button
            size="sm"
            onClick={handleFinishAndNavigate}
            className={cn(
              "font-medium shadow-xs",
              allPointsChecked
                ? "bg-success text-on-success hover:bg-success/90"
                : "bg-brand text-on-brand hover:bg-brand-hover",
            )}
          >
            <Sparkles className="size-3.5 mr-1.5" />
            Selesai Sesi & Lanjut Explain-Back
            <ArrowRight className="size-3.5 ml-1" />
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
      <DialogContent className="max-h-[92vh] overflow-y-auto border border-line-subtle bg-surface-raised p-0 shadow-raised sm:max-w-xl">
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
