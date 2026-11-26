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
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { CheckAttempt, ExplainBackQuestion, User } from "@/types/bersama"
import { ConformalGaugeBar } from "./ConformalGaugeBar"

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
  const confidencePct = Math.max(0, Math.min(100, Math.round((1 - attempt.uncertainty) * 100)))
  const scorePct =
    attempt.grade === 2 ? 100 : attempt.grade === 1 ? 50 : 0

  const peerAuthorId = attempt.assignedPeerId ?? question.decisionAuthorId
  const peerAuthor: User =
    SEED_USERS.find((u) => u.id === peerAuthorId) ??
    SEED_USERS.find((u) => u.id === "user-dimas") ??
    SEED_USERS[1]

  const tutorState = isAbstained
    ? "warning"
    : attempt.grade === 2
      ? "success"
      : "nudge"

  return (
    <Card
      className={cn(
        "overflow-hidden bg-surface-card py-0 shadow-card transition-[border-color,box-shadow] duration-200 animate-in fade-in-50 zoom-in-98",
        isAbstained
          ? "border-warning/40"
          : attempt.grade === 2
            ? "border-success/40"
            : "border-brand-subtle",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "border-b p-5",
          isAbstained
            ? "border-warning/30 bg-warning-subtle/40"
            : attempt.grade === 2
              ? "border-success/30 bg-success-subtle/30"
              : "border-brand-subtle bg-wash-brand",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <AgentStickerAvatar
              role="tutor"
              state={tutorState}
              size={52}
              label="Reaksi Tutor AI"
            />

            <div className="space-y-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 text-xs font-semibold",
                  isAbstained
                    ? "border-warning/50 bg-warning-subtle text-text-warning"
                    : attempt.grade === 2
                      ? "border-success/50 bg-success-subtle text-text-success"
                      : "border-brand-subtle bg-wash-brand text-ink-link",
                )}
              >
                {isAbstained ? (
                  <>
                    <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>CONFORMAL ABSTENTION</span>
                  </>
                ) : attempt.grade === 2 ? (
                  <>
                    <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>PAHAM MANDIRI · {attempt.grade}/2</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>SEBAGIAN TERCAPAI · {attempt.grade ?? 0}/2</span>
                  </>
                )}
              </Badge>

              <CardTitle className="font-display text-xl font-semibold text-ink-primary">
                {isAbstained
                  ? "Dialihkan ke Rekan Penulis"
                  : attempt.grade === 2
                    ? "Konsep Dipahami Kuat"
                    : "Pemahaman Awal Cukup Baik"}
              </CardTitle>
            </div>
          </div>

          {/* Hero KPI Metric */}
          <div className="flex items-baseline gap-2 self-end sm:flex-col sm:items-end sm:gap-0.5 sm:self-center">
            <span
              className={cn(
                "kpi-hero text-[40px] leading-none font-semibold",
                isAbstained
                  ? "text-text-warning"
                  : attempt.grade === 2
                    ? "text-text-success"
                    : "text-ink-link",
              )}
            >
              {isAbstained ? `${confidencePct}%` : `${scorePct}%`}
            </span>
            <span className="text-xs font-medium text-ink-secondary">
              {isAbstained ? "Keyakinan AI" : `Skor ${attempt.grade ?? 0}/2`}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* Visual Conformal Uncertainty Gauge Bar */}
        <ConformalGaugeBar
          uncertainty={attempt.uncertainty}
          abstained={isAbstained}
          grade={attempt.grade}
        />

        {/* Concise Feedback */}
        <div className="rounded-xl border border-line-subtle bg-surface p-3.5 text-sm leading-relaxed text-ink-secondary">
          <span className="font-semibold text-ink-primary">
            {isAbstained ? "Catatan Grader: " : "Umpan Balik: "}
          </span>
          {attempt.feedback}
        </div>

        {/* Branch A: Peer Learning Transfer Card */}
        {isAbstained && (
          <div className="rounded-xl border border-warning/35 bg-warning-subtle/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 border border-warning/50 shadow-badge">
                  <AvatarImage
                    src={USER_AVATAR_MAP[peerAuthor.id]}
                    alt={peerAuthor.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs font-semibold">
                    {peerAuthor.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-ink-primary">
                      {peerAuthor.name}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-ink-secondary">
                      Penulis {question.decisionCode}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary">
                    {peerAuthor.moduleFocus ?? "Penanggung Jawab Modul"}
                  </p>
                </div>
              </div>

              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link to={`/teams/${teamId}/understanding`}>
                  <MessageSquare className="size-3.5" aria-hidden="true" />
                  <span>Tanya {peerAuthor.name.split(" ")[0]} · 10 Mnt</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Branch B: BKT Probability Update Chip */}
        {!isAbstained && attempt.grade === 2 && (
          <div className="flex items-center gap-3 rounded-xl border border-success/35 bg-success-subtle/30 p-3.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success text-on-success">
              <TrendingUp className="size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 flex-1">
              <span className="text-xs font-semibold text-ink-primary">
                Penguasaan P(L) pada KC ini naik otomatis
              </span>
              <span className="rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-text-success">
                Cakupan tim bertambah
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>{isAbstained ? "Coba Jawab Ulang" : "Jawab Ulang"}</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {!isAbstained && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/teams/${teamId}/understanding`}>
                  Lihat Peta Pemahaman
                </Link>
              </Button>
            )}

            {hasNextQuestion ? (
              <Button
                type="button"
                variant={isAbstained ? "secondary" : "default"}
                size="sm"
                onClick={onNextQuestion}
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            ) : (
              !isAbstained && (
                <Button asChild size="sm">
                  <Link to={`/teams/${teamId}/understanding`}>
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    <span>Selesai Check</span>
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
