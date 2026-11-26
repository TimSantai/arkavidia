import { Link } from "react-router"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  RotateCcw,
  TrendingUp,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { CheckAttempt, ExplainBackQuestion, User } from "@/types/bersama"
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

interface GradingResultCardProps {
  readonly attempt: CheckAttempt
  readonly question: ExplainBackQuestion
  readonly teamId: string
  readonly onNextQuestion: () => void
  readonly onRetry: () => void
  readonly hasNextQuestion: boolean
  readonly className?: string
}

export function GradingResultCard({
  attempt,
  question,
  teamId,
  onNextQuestion,
  onRetry,
  hasNextQuestion,
  className,
}: GradingResultCardProps) {
  const isAbstained = attempt.abstained

  // Resolve peer author from assignedPeerId or question.decisionAuthorId
  const peerAuthorId = attempt.assignedPeerId ?? question.decisionAuthorId
  const peerAuthor: User =
    SEED_USERS.find((u) => u.id === peerAuthorId) ??
    SEED_USERS.find((u) => u.id === "user-dimas") ??
    SEED_USERS[1]

  return (
    <Card
      className={cn(
        "overflow-hidden border border-line-subtle bg-surface shadow-surface transition-[border-color,box-shadow] animate-in fade-in-50 zoom-in-98 duration-200",
        className,
      )}
    >
      {/* =========================================================================
          BRANCH A: CONFORMAL ABSTENTION (s > λ̂)
          ========================================================================= */}
      {isAbstained ? (
        <>
          <CardHeader className="border-b border-warning/30 bg-warning-subtle/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-warning/50 bg-warning-subtle font-mono text-xs font-semibold text-text-warning"
              >
                <AlertTriangle className="size-3.5 shrink-0" />
                CONFORMAL ABSTENTION (AI MENOLAK MENILAI)
              </Badge>

              <span className="font-mono text-xs text-text-warning tabular-nums">
                s = {attempt.uncertainty} &gt; λ̂ = 0.20
              </span>
            </div>

            <CardTitle className="font-heading pt-2 text-lg font-semibold text-ink-primary">
              Ketidakpastian Grader Melampaui Ambang Kalibrasi
            </CardTitle>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Sesuai prinsip <em>Conformal Risk Control</em> (Angelopoulos et al., ICLR 2024), AI
              menolak menilai otomatis jawaban yang ambigu guna mencegah halusinasi evaluasi.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            {/* Grader Feedback Quote */}
            <div className="rounded-xl border border-line-subtle bg-canvas/40 p-3.5 text-xs leading-relaxed text-ink-secondary">
              <span className="font-semibold text-ink-primary">Catatan Sistem:</span>{" "}
              {attempt.feedback}
            </div>

            {/* Peer Learning Transfer Card */}
            <div className="rounded-xl border border-warning/30 bg-warning-subtle/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 border-2 border-warning/50 shadow-xs">
                    <AvatarImage
                      src={USER_AVATARS[peerAuthor.id]}
                      alt={peerAuthor.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs font-semibold">
                      {peerAuthor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-xs font-semibold text-ink-primary">
                        {peerAuthor.name}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-ink-tertiary">
                        Penulis {question.decisionCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-tertiary">
                      {peerAuthor.moduleFocus ?? "Penanggung Jawab Modul"}
                    </p>
                  </div>
                </div>

                <Link to={`/teams/${teamId}/understanding`}>
                  <Button
                    size="sm"
                    className="w-full bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active text-xs font-medium shadow-sm sm:w-auto"
                  >
                    <MessageSquare className="size-3.5 mr-1.5" aria-hidden="true" />
                    Minta Penjelasan ke {peerAuthor.name.split(" ")[0]} (10 Mnt)
                    <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-line-subtle text-xs hover:bg-muted"
              >
                <RotateCcw className="size-3 mr-1" />
                Coba Jawab Ulang
              </Button>

              {hasNextQuestion && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onNextQuestion}
                  className="text-xs font-medium"
                >
                  Lanjut ke Pertanyaan Berikutnya
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        /* =========================================================================
           BRANCH B: AI EVALUATED (PAHAM / SEBAGIAN)
           ========================================================================= */
        <>
          <CardHeader
            className={cn(
              "border-b p-5",
              attempt.grade === 2
                ? "border-success/30 bg-success-subtle/30"
                : "border-info/30 bg-info-subtle/30",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 font-mono text-xs font-semibold",
                  attempt.grade === 2
                    ? "border-success/50 bg-success-subtle text-text-success"
                    : "border-info/50 bg-info-subtle text-text-info",
                )}
              >
                {attempt.grade === 2 ? (
                  <>
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    PAHAM MANDIRI (SKOR 2 / 2)
                  </>
                ) : (
                  <>
                    <HelpCircle className="size-3.5 shrink-0" />
                    SEBAGIAN TERCAPAI (SKOR 1 / 2)
                  </>
                )}
              </Badge>

              <span className="font-mono text-xs text-ink-tertiary tabular-nums">
                Uncertainty s = {attempt.uncertainty} (≤ λ̂ = 0.20)
              </span>
            </div>

            <CardTitle className="font-heading pt-2 text-lg font-semibold text-ink-primary">
              {attempt.grade === 2
                ? "Konsep Berhasil Dipahami dengan Kuat"
                : "Pemahaman Awal Tertangkap Cukup Baik"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            {/* Rubric Feedback */}
            <div className="rounded-xl border border-line-subtle bg-canvas/40 p-4 text-xs leading-relaxed text-ink-secondary">
              <p className="font-semibold text-ink-primary pb-1">Umpan Balik Grader:</p>
              <p>{attempt.feedback}</p>
            </div>

            {/* BKT Probability Impact Highlight */}
            {attempt.grade === 2 && (
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-subtle/20 p-3.5 text-xs">
                <div className="rounded-lg bg-success p-1.5 text-on-success">
                  <TrendingUp className="size-4 shrink-0" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-medium text-ink-primary">
                    Probabilitas Penguasaan P(L) Diperbarui
                  </p>
                  <p className="text-[11px] text-ink-secondary">
                    Skor penguasaan mandirimu pada Knowledge Component ini telah dinaikkan secara
                    otomatis. Cakupan tim di Peta Pemahaman bertambah!
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-line-subtle text-xs hover:bg-muted"
              >
                <RotateCcw className="size-3 mr-1" />
                Jawab Ulang
              </Button>

              <div className="flex items-center gap-2">
                <Link to={`/teams/${teamId}/understanding`}>
                  <Button variant="outline" size="sm" className="border-line-subtle text-xs">
                    Lihat Peta Pemahaman
                  </Button>
                </Link>

                {hasNextQuestion ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={onNextQuestion}
                    className="bg-brand text-on-brand hover:bg-brand-hover text-xs font-medium"
                  >
                    Pertanyaan Berikutnya
                    <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                ) : (
                  <Link to={`/teams/${teamId}/understanding`}>
                    <Button
                      size="sm"
                      className="bg-brand text-on-brand hover:bg-brand-hover text-xs font-medium"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" aria-hidden="true" />
                      Selesai Check Mingguan
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
