import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  History,
  Mic,
  Send,
  Type,
} from "lucide-react"
import {
  MainWithAside,
  PageContainer,
  PageHeader,
} from "@/components/layout/page"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Pill, PillIndicator } from "@/components/kibo-ui/pill"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import { bersamaApi } from "@/services/api"
import type { CheckAttempt, ExplainBackQuestion, User } from "@/types/bersama"
import { GradingResultCard } from "./components/GradingResultCard"
import { VoiceRecorderInput } from "./components/VoiceRecorderInput"

export function ExplainBackPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [questions, setQuestions] = useState<readonly ExplainBackQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerText, setAnswerText] = useState("")
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [latestAttempt, setLatestAttempt] = useState<CheckAttempt | null>(null)
  const [pastAttempts, setPastAttempts] = useState<readonly CheckAttempt[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPostponed, setIsPostponed] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    void bersamaApi.getAllChecks().then(setQuestions)
    void bersamaApi.getCheckAttempts().then(setPastAttempts)
  }, [teamId])

  const currentQuestion: ExplainBackQuestion | undefined = questions[currentIndex]

  const authorUser: User =
    SEED_USERS.find((u) => u.id === currentQuestion?.decisionAuthorId) ??
    SEED_USERS.find((u) => u.id === "user-dimas") ??
    SEED_USERS[1]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!currentQuestion || !answerText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await bersamaApi.submitCheckAnswer(
        currentQuestion.id,
        answerText.trim(),
        inputMode,
      )
      setLatestAttempt(result)
      const updatedHistory = await bersamaApi.getCheckAttempts()
      setPastAttempts(updatedHistory)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setAnswerText("")
      setLatestAttempt(null)
    }
  }

  const handleSelectQuestionIndex = (index: number) => {
    setCurrentIndex(index)
    setAnswerText("")
    setLatestAttempt(null)
  }

  const handleRetry = () => {
    setLatestAttempt(null)
  }

  const fillStrongAnswer = () => {
    setInputMode("text")
    setAnswerText(
      "Kami memilih JWT karena sifatnya yang stateless sehingga server tidak perlu menyimpan session di RAM, serta memudahkan konsumsi API dari klien mobile dan web secara bersamaan.",
    )
  }

  const fillAmbiguousAnswer = () => {
    setInputMode("text")
    setAnswerText("Mungkin karena Dimas yang buat jadi ikut saja, kurang yakin detailnya.")
  }

  if (questions.length === 0) {
    return (
      <PageContainer width="wide" className="space-y-6 sm:space-y-8">
        <div className="h-12 w-64 rounded-xl bg-surface" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="h-96 rounded-2xl border border-line-subtle bg-surface-card p-5" />
          <div className="space-y-4">
            <div className="h-32 rounded-2xl border border-brand-subtle bg-wash-brand p-5" />
            <div className="h-40 rounded-2xl border border-line-subtle bg-surface-card p-5" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (isPostponed) {
    return (
      <PageContainer width="wide">
        <div className="mx-auto max-w-xl pt-10 text-center">
          <Card className="rounded-3xl border-line-subtle bg-surface-card p-8 shadow-none">
            <div className="mx-auto flex justify-center">
              <AgentStickerAvatar role="tutor" state="idle" size={56} />
            </div>

            <h2 className="font-heading pt-4 text-2xl font-medium text-ink-primary">
              Check <span className="font-display-oblique text-ink-link">Ditunda</span>
            </h2>

            <p className="pt-2 text-sm leading-relaxed text-ink-secondary">
              Sesi ini murni formatif tanpa batas waktu penalti. Lanjutkan kapan saja sebelum akhir
              pekan.
            </p>

            <div className="flex flex-col justify-center gap-2 pt-6 sm:flex-row">
              <Button onClick={() => setIsPostponed(false)} className="rounded-full">
                Lanjutkan Check Sekarang
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to={`/teams/${teamId}/understanding`}>
                  Kembali ke Peta Pemahaman
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </PageContainer>
    )
  }

  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100)

  return (
    <PageContainer width="wide" className="space-y-6 sm:space-y-8">
      {/* 1. Header with Breadcrumb & Status */}
      <PageHeader
        title={
          <>
            Explain-Back <span className="font-display-oblique text-ink-link">Check</span>
          </>
        }
        description="Konfirmasi pemahaman konsep tim dalam 5 menit."
        badge={
          <Pill
            variant="secondary"
            className="border border-brand-subtle bg-wash-brand text-xs font-medium text-ink-link"
          >
            <PillIndicator variant="success" pulse />
            <span>Formatif · Bukan nilai</span>
          </Pill>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-full text-xs text-ink-secondary hover:text-ink-primary"
            >
              <Link to={`/teams/${teamId}/understanding`}>
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Peta Pemahaman</span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPostponed(true)}
              className="rounded-full text-xs text-ink-secondary hover:text-ink-primary"
            >
              Tunda
            </Button>
          </div>
        }
      />

      {/* 2. Responsive 2-Column Workspace via MainWithAside Primitive */}
      <MainWithAside
        asideWidth="360px"
        sticky={true}
        stickyOffset="top-6"
        main={
          <div className="space-y-6">
            {/* Main Question Card */}
            {currentQuestion && (
              <Card className="rounded-2xl border border-line-subtle bg-surface-card py-0 shadow-none overflow-hidden">
                <CardHeader className="border-b border-line-subtle/50 bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-brand px-2.5 py-0.5 text-xs font-semibold text-on-brand">
                        {currentQuestion.decisionCode}
                      </span>

                      <span className="rounded-full bg-info-subtle px-2.5 py-0.5 text-xs font-semibold text-text-info uppercase">
                        {currentQuestion.bloomLevel}
                      </span>

                      {currentQuestion.aiAssistedContext && (
                        <span className="rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-semibold text-text-warning">
                          Dibantu AI
                        </span>
                      )}
                    </div>

                    {/* Compact ? Popover for IRT 2PL Details */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Kenapa soal ini dipilih secara adaptif"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-card px-2.5 py-1 text-xs font-medium text-ink-secondary transition-[background-color,color,border-color] duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <HelpCircle className="size-3.5 text-ink-link" aria-hidden="true" />
                          <span>Seleksi Adaptif</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80">
                        <PopoverHeader>
                          <PopoverTitle>Seleksi Adaptif IRT 2PL</PopoverTitle>
                          <PopoverDescription className="text-ink-secondary">
                            Prioritas soal dipilih karena keputusan dibuat oleh{" "}
                            <strong className="text-ink-primary">{authorUser.name}</strong> dan bertanda{" "}
                            <strong className="text-ink-primary">dibantu AI</strong>.
                          </PopoverDescription>
                        </PopoverHeader>
                        <div className="space-y-1.5 rounded-lg border border-line-subtle bg-surface p-2.5 text-xs text-ink-secondary tabular-nums">
                          <div className="flex items-center justify-between">
                            <span>Diskriminasi (a)</span>
                            <span className="font-semibold text-ink-primary">{currentQuestion.irtA}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Kesulitan (b)</span>
                            <span className="font-semibold text-ink-primary">{currentQuestion.irtB}</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-start gap-3.5 pt-3">
                    <AgentStickerAvatar
                      role="tutor"
                      state={isSubmitting ? "thinking" : "idle"}
                      size={44}
                      label="Socratic Tutor"
                    />
                    <CardTitle className="font-sans text-lg font-semibold leading-snug text-ink-primary">
                      {currentQuestion.prompt}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-5">
                  {/* Compact Rubric Clues */}
                  <div className="space-y-1.5 rounded-xl border border-line-subtle bg-surface p-3.5">
                    <span className="text-xs font-semibold text-ink-primary">
                      Poin kunci refleksi:
                    </span>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-ink-secondary">
                      {currentQuestion.rubricPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center gap-2 border-b border-line-subtle pb-2.5">
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-[background-color,color] duration-150",
                        inputMode === "text"
                          ? "bg-brand text-on-brand shadow-badge"
                          : "text-ink-secondary hover:bg-muted hover:text-ink-primary",
                      )}
                    >
                      <Type className="size-3.5" aria-hidden="true" />
                      <span>Tulis Jawaban</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInputMode("voice")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-[background-color,color] duration-150",
                        inputMode === "voice"
                          ? "bg-brand text-on-brand shadow-badge"
                          : "text-ink-secondary hover:bg-muted hover:text-ink-primary",
                      )}
                    >
                      <Mic className="size-3.5" aria-hidden="true" />
                      <span>Rekam Suara</span>
                    </button>
                  </div>

                  {/* Dual Input Area */}
                  {inputMode === "text" ? (
                    <Textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      disabled={isSubmitting || latestAttempt !== null}
                      placeholder="Jelaskan alasan arsitektur dan trade-off-nya dengan bahasamu sendiri..."
                      className="min-h-[140px] border-line-default bg-surface-card text-base leading-relaxed text-ink-primary sm:text-sm"
                    />
                  ) : (
                    <VoiceRecorderInput
                      value={answerText}
                      onChange={setAnswerText}
                      disabled={isSubmitting || latestAttempt !== null}
                    />
                  )}

                  {/* Quick Simulation Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-ink-tertiary">Simulasi:</span>
                    <button
                      type="button"
                      onClick={fillStrongAnswer}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-success/35 bg-success-subtle/50 px-3 py-1 text-xs font-medium text-text-success transition-[background-color,transform] duration-150 hover:bg-success-subtle active:scale-[0.98]"
                    >
                      <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Jawaban Kuat (Skor 2)</span>
                    </button>
                    <button
                      type="button"
                      onClick={fillAmbiguousAnswer}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-warning/35 bg-warning-subtle/50 px-3 py-1 text-xs font-medium text-text-warning transition-[background-color,transform] duration-150 hover:bg-warning-subtle active:scale-[0.98]"
                    >
                      <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Jawaban Ambigu (Abstain)</span>
                    </button>
                  </div>

                  {/* Submit Bar */}
                  {!latestAttempt && (
                    <div className="flex items-center justify-end border-t border-line-subtle pt-3">
                      <Button
                        type="button"
                        disabled={!answerText.trim() || isSubmitting}
                        onClick={() => handleSubmit()}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="size-3.5 animate-spin rounded-full border-2 border-on-brand border-t-transparent" />
                            <span>Mengevaluasi...</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5" aria-hidden="true" />
                            <span>Kirim Jawaban</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3. Grading Result Card */}
            {latestAttempt && currentQuestion && (
              <GradingResultCard
                attempt={latestAttempt}
                question={currentQuestion}
                teamId={teamId}
                onNextQuestion={handleNextQuestion}
                onRetry={handleRetry}
                hasNextQuestion={currentIndex < questions.length - 1}
              />
            )}
          </div>
        }
        aside={
          <div className="space-y-4">
            {/* Progress Card (Pastel Tint) */}
            <section className="space-y-3.5 rounded-2xl border border-brand-subtle bg-wash-brand p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary tabular-nums">
                  <Clock className="size-3.5 text-ink-link" aria-hidden="true" />
                  <span>
                    Soal {currentIndex + 1} dari {questions.length} · ~{currentQuestion?.estimatedSeconds ?? 90} dtk
                  </span>
                </span>

                <span className="kpi-hero text-2xl font-semibold text-ink-link">
                  {progressPct}%
                </span>
              </div>

              {/* Question Stepper */}
              <div className="flex gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestionIndex(idx)}
                    className={cn(
                      "h-2 flex-1 rounded-full transition-[background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      idx === currentIndex
                        ? "bg-brand"
                        : idx < currentIndex
                          ? "bg-success"
                          : "bg-surface-card hover:bg-surface-raised",
                    )}
                    aria-label={`Pindah ke soal ${idx + 1}: ${q.decisionCode}`}
                  />
                ))}
              </div>
            </section>

            {/* Context Card: Penulis Keputusan */}
            <div className="rounded-2xl border border-line-subtle bg-surface-card p-4 space-y-3">
              <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                Konteks Keputusan
              </span>
              <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0">
                  {USER_AVATAR_MAP[authorUser.id] && (
                    <AvatarImage
                      src={USER_AVATAR_MAP[authorUser.id]}
                      alt={authorUser.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="border border-line-subtle bg-surface text-xs font-semibold text-ink-primary">
                    {authorUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-primary truncate">
                    {authorUser.name}
                  </p>
                  <p className="text-xs text-ink-tertiary truncate">
                    Pembuat {currentQuestion?.decisionCode}
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed border-t border-line-subtle/60 pt-2.5">
                Refleksikan trade-off arsitektur ini agar pemahaman tim merata dan tidak bergantung pada satu orang saja.
              </p>
            </div>

            {/* Riwayat Check Pribadi (M3 Private) */}
            <div className="rounded-2xl border border-line-subtle bg-surface-card p-4 shadow-none">
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className="flex w-full items-center justify-between text-left text-xs font-medium text-ink-secondary hover:text-ink-primary"
              >
                <span className="flex items-center gap-2">
                  <History className="size-4 text-ink-link" aria-hidden="true" />
                  <span>Riwayat Pribadi ({pastAttempts.length})</span>
                </span>
                <span className="font-semibold text-ink-link">
                  {showHistory ? "Tutup" : "Lihat"}
                </span>
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2 border-t border-line-subtle pt-3 max-h-72 overflow-y-auto">
                  {pastAttempts.length === 0 ? (
                    <p className="text-xs text-ink-tertiary">Belum ada riwayat check.</p>
                  ) : (
                    pastAttempts.map((item) => {
                      const itemConfidencePct = Math.max(
                        0,
                        Math.min(100, Math.round((1 - item.uncertainty) * 100)),
                      )
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-line-subtle bg-surface p-2.5 text-xs text-ink-secondary"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                                  item.abstained
                                    ? "bg-warning-subtle text-text-warning"
                                    : item.grade === 2
                                      ? "bg-success-subtle text-text-success"
                                      : "bg-info-subtle text-text-info",
                                )}
                              >
                                {item.abstained ? "ABSTAIN" : `SKOR ${item.grade ?? 0}/2`}
                              </span>
                              <span className="text-xs text-ink-tertiary tabular-nums">
                                {itemConfidencePct}% yakin
                              </span>
                            </div>
                            <p className="line-clamp-2 text-ink-secondary text-xs">
                              "{item.answer}"
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-ink-tertiary tabular-nums">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        }
      />
    </PageContainer>
  )
}
