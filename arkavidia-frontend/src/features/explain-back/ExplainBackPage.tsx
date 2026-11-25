import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  History,
  Info,
  Mic,
  Send,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, PillIndicator } from "@/components/kibo-ui/pill"
import { Textarea } from "@/components/ui/textarea"
import { bersamaApi } from "@/services/api"
import { SEED_USERS } from "@/mocks/seedData"
import { cn } from "@/lib/utils"
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
  const [showIrtDetails, setShowIrtDetails] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Load questions & past check attempts on mount
  useEffect(() => {
    void bersamaApi.getAllChecks().then((data) => {
      setQuestions(data)
    })
    void bersamaApi.getCheckAttempts().then(setPastAttempts)
  }, [teamId])

  const currentQuestion: ExplainBackQuestion | undefined = questions[currentIndex]

  // Resolve author of current question decision
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
      setShowIrtDetails(false)
    }
  }

  const handleSelectQuestionIndex = (index: number) => {
    setCurrentIndex(index)
    setAnswerText("")
    setLatestAttempt(null)
    setShowIrtDetails(false)
  }

  const handleRetry = () => {
    setLatestAttempt(null)
  }

  // Demo helper simulators
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
      <div className="flex h-64 items-center justify-center">
        <p className="font-mono text-xs text-ink-tertiary animate-pulse">
          Memuat pertanyaan reflektif adaptif...
        </p>
      </div>
    )
  }

  // =========================================================================
  // VIEW: POSTPONED STATE (Ramah & Bebas Penalti)
  // =========================================================================
  if (isPostponed) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pt-10 text-center">
        <Card className="border border-line-subtle bg-surface p-8 shadow-surface">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-info-subtle text-text-info">
            <CheckCircle2 className="size-8" />
          </div>

          <h2 className="font-heading pt-4 text-xl font-semibold text-ink-primary">
            Check Berhasil Ditunda
          </h2>

          <p className="pt-2 text-xs leading-relaxed text-ink-secondary">
            Tidak masalah! Sesuai prinsip etika formatif BERSAMA, sesi check ini tidak memiliki batas
            waktu hukuman dan bebas risiko akademis. Kamu dapat melanjutkan kapan saja sebelum akhir
            pekan.
          </p>

          <div className="flex flex-col justify-center gap-2 pt-6 sm:flex-row">
            <Button
              onClick={() => setIsPostponed(false)}
              className="bg-brand text-on-brand hover:bg-brand-hover text-xs font-medium"
            >
              Lanjutkan Check Sekarang
            </Button>
            <Link to={`/teams/${teamId}/understanding`}>
              <Button variant="outline" className="border-line-subtle text-xs w-full sm:w-auto">
                Kembali ke Peta Pemahaman
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      {/* 1. Header & Formative Ethics Pill */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link
              to={`/teams/${teamId}/understanding`}
              className="inline-flex items-center text-xs text-ink-tertiary hover:text-ink-primary"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Peta Pemahaman
            </Link>
            <span className="text-ink-disabled">/</span>
            <span className="font-mono text-xs font-semibold text-accent-violet uppercase">
              TRACK B · FITUR F5 · EXPLAIN-BACK
            </span>
          </div>

          <Pill
            variant="secondary"
            className="border border-line-subtle bg-surface shadow-surface text-ink-secondary font-mono text-[11px]"
          >
            <PillIndicator variant="success" pulse />
            <span>Murni formatif · Bukan nilai kuliah</span>
          </Pill>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-ink-primary">
              Explain-Back Check
            </h1>
            <p className="text-xs text-ink-secondary">
              Pertanyaan reflektif adaptif 5 menit untuk mengonfirmasi pemahaman konsep mandiri.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPostponed(true)}
            className="text-xs text-ink-tertiary hover:text-ink-primary hover:bg-muted self-start sm:self-auto"
          >
            Tunda Check
          </Button>
        </div>

        {/* Progress Bar & Question Stepper */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
            <span>
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              Estimasi: {currentQuestion?.estimatedSeconds ?? 90} detik
            </span>
          </div>

          <div className="flex gap-1.5">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestionIndex(idx)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  idx === currentIndex
                    ? "bg-brand"
                    : idx < currentIndex
                      ? "bg-success"
                      : "bg-muted hover:bg-line-default",
                )}
                title={`Pindah ke soal ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Question Card */}
      {currentQuestion && (
        <Card className="border border-line-subtle bg-surface shadow-surface">
          <CardHeader className="border-b border-line-subtle bg-canvas/30 p-5 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-ink-primary">
                  {currentQuestion.decisionCode}
                </span>

                <span className="rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-text-info uppercase">
                  BLOOM: {currentQuestion.bloomLevel}
                </span>

                {currentQuestion.aiAssistedContext && (
                  <span className="rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-text-warning">
                    ITEM DIBANTU AI
                  </span>
                )}
              </div>

              {/* Technical IRT Collapsible Toggle */}
              <button
                type="button"
                onClick={() => setShowIrtDetails((prev) => !prev)}
                className="flex items-center gap-1 font-mono text-[11px] text-ink-tertiary hover:text-brand"
              >
                <Compass className="size-3" />
                <span>Kenapa soal ini dipilih?</span>
              </button>
            </div>

            {/* IRT Reasoning Drawer */}
            {showIrtDetails && (
              <div className="mt-3 rounded-lg border border-line-subtle bg-canvas/60 p-3 text-[11px] leading-relaxed text-ink-secondary animate-in fade-in-50 duration-150">
                <p className="font-semibold text-ink-primary pb-1">
                  Model Pemilihan Adaptif Item Response Theory (IRT 2PL):
                </p>
                <p>
                  Soal ini memiliki parameter diskriminasi tinggi (
                  <span className="font-mono font-semibold">a = {currentQuestion.irtA}</span>) dan
                  tingkat kesulitan sedang (
                  <span className="font-mono font-semibold">b = {currentQuestion.irtB}</span>). Bobot
                  prioritas dimaksimalkan karena keputusan ini{" "}
                  <strong>dibuat oleh rekanmu ({authorUser.name})</strong> dan bertanda{" "}
                  <strong>"dibantu AI"</strong>, sehingga perlu diverifikasi agar tidak terjadi
                  ketergantungan pemahaman sepihak.
                </p>
              </div>
            )}

            <CardTitle className="font-heading pt-3 text-lg font-medium leading-relaxed text-ink-primary">
              {currentQuestion.prompt}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            {/* Rubric Points Clue */}
            <div className="space-y-1 rounded-xl bg-canvas/30 p-3 text-xs text-ink-secondary">
              <span className="font-semibold text-ink-primary flex items-center gap-1">
                <Info className="size-3 text-brand" />
                Poin refleksi yang diharapkan:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-ink-tertiary">
                {currentQuestion.rubricPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Input Mode Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-line-subtle pb-2">
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  inputMode === "text"
                    ? "bg-brand text-on-brand shadow-xs"
                    : "text-ink-tertiary hover:bg-muted hover:text-ink-primary",
                )}
              >
                <Type className="size-3.5" />
                Tulis Jawaban (Teks)
              </button>

              <button
                type="button"
                onClick={() => setInputMode("voice")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  inputMode === "voice"
                    ? "bg-brand text-on-brand shadow-xs"
                    : "text-ink-tertiary hover:bg-muted hover:text-ink-primary",
                )}
              >
                <Mic className="size-3.5" />
                Rekam Suara (Voice Note)
              </button>
            </div>

            {/* Dual Input Area */}
            {inputMode === "text" ? (
              <div className="space-y-2">
                <Textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  disabled={isSubmitting || latestAttempt !== null}
                  placeholder="Jelaskan dengan pemahamanmu sendiri mengapa keputusan arsitektur ini diambil oleh tim dan trade-off apa yang dipertimbangkan..."
                  className="min-h-[120px] border-line-subtle bg-surface text-sm leading-relaxed text-ink-primary shadow-xs"
                />

                <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
                  <span>Jawab dengan kalimat sendiri, bukan kutipan kode mentah.</span>
                  <span className="font-mono tabular-nums">{answerText.length} karakter</span>
                </div>
              </div>
            ) : (
              <VoiceRecorderInput
                value={answerText}
                onChange={setAnswerText}
                disabled={isSubmitting || latestAttempt !== null}
              />
            )}

            {/* Quick Demo Simulator Buttons (Khusus Demo Juri) */}
            <div className="rounded-lg border border-dashed border-line-subtle bg-canvas/30 p-2.5">
              <div className="flex items-center justify-between pb-1 text-[11px] text-ink-tertiary">
                <span className="font-semibold text-ink-secondary">Bantuan Cepat Skenario Demo:</span>
                <span>Uji 2 jalur evaluasi AI</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillStrongAnswer}
                  className="rounded-md border border-success/30 bg-success-subtle/40 px-2 py-1 text-[11px] font-medium text-text-success hover:bg-success-subtle transition-colors"
                >
                  ✨ Isi Jawaban Kuat (Paham · Skor 2)
                </button>
                <button
                  type="button"
                  onClick={fillAmbiguousAnswer}
                  className="rounded-md border border-warning/30 bg-warning-subtle/40 px-2 py-1 text-[11px] font-medium text-text-warning hover:bg-warning-subtle transition-colors"
                >
                  ⚠️ Isi Jawaban Ambigu (Picu Conformal Abstain)
                </button>
              </div>
            </div>

            {/* Submit Action */}
            {!latestAttempt && (
              <div className="flex items-center justify-between border-t border-line-subtle pt-3">
                <p className="text-[11px] text-ink-tertiary">
                  Jawaban dievaluasi oleh LLM Grader dengan Conformal Risk Control.
                </p>

                <Button
                  type="button"
                  disabled={!answerText.trim() || isSubmitting}
                  onClick={() => handleSubmit()}
                  className="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm font-medium text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-3.5 animate-spin rounded-full border-2 border-on-brand border-t-transparent mr-1.5" />
                      Mengevaluasi...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 mr-1.5" />
                      Kirim Jawaban Reflektif
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. Grading Result Card (Evaluated or Conformal Abstention) */}
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

      {/* 4. Riwayat Check Pribadi (M3 Private) */}
      <div className="rounded-xl border border-line-subtle bg-surface p-4 shadow-surface">
        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="flex w-full items-center justify-between text-left text-xs font-medium text-ink-secondary hover:text-ink-primary"
        >
          <span className="flex items-center gap-1.5">
            <History className="size-4 text-ink-tertiary" />
            Riwayat Check Pribadi (M3 Private · {pastAttempts.length} riwayat)
          </span>
          <span className="font-mono text-[11px] text-brand">
            {showHistory ? "Sembunyikan" : "Tampilkan"}
          </span>
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 border-t border-line-subtle pt-3">
            {pastAttempts.length === 0 ? (
              <p className="text-xs text-ink-tertiary">Belum ada riwayat check tersimpan.</p>
            ) : (
              pastAttempts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-lg bg-canvas/40 p-2.5 text-xs text-ink-secondary"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.2 font-mono text-[10px] font-semibold",
                          item.abstained
                            ? "bg-warning-subtle text-text-warning"
                            : item.grade === 2
                              ? "bg-success-subtle text-text-success"
                              : "bg-info-subtle text-text-info",
                        )}
                      >
                        {item.abstained ? "ABSTAIN" : `SKOR ${item.grade ?? 0}/2`}
                      </span>
                      <span className="font-mono text-[11px] text-ink-tertiary">
                        s = {item.uncertainty}
                      </span>
                    </div>
                    <p className="line-clamp-1 italic text-ink-tertiary">"{item.answer}"</p>
                  </div>
                  <span className="font-mono text-[10px] text-ink-tertiary">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
