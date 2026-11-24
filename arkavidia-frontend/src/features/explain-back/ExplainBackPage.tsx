import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { ExplainBackQuestion } from "@/types/bersama"

export function ExplainBackPage() {
  const [question, setQuestion] = useState<ExplainBackQuestion | null>(null)

  useEffect(() => {
    void bersamaApi.getNextCheck().then(setQuestion)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-ink-tertiary">
            TRACK B · F5 · ADAPTIVE IRT 2PL & CONFORMAL ABSTENTION
          </span>
          <h1 className="font-heading text-2xl font-semibold text-ink-primary">Explain-Back Check</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1 font-mono text-xs text-ink-secondary">
          <Clock className="size-3.5 text-ink-tertiary" />
          Maks. 5 menit/minggu · Bukan nilai kuliah
        </span>
      </div>

      {question && (
        <Card className="border border-line-subtle bg-surface shadow-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-tertiary">{question.decisionCode}</span>
              <span className="rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[11px] text-text-info">
                BLOOM: {question.bloomLevel.toUpperCase()}
              </span>
              {question.aiAssistedContext && (
                <span className="rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[11px] text-text-warning">
                  ITEM DIBANTU AI
                </span>
              )}
            </div>
            <CardTitle className="text-lg">{question.prompt}</CardTitle>
            <CardDescription className="font-mono text-xs text-ink-tertiary">
              IRT a={question.irtA} · b={question.irtB} · Estimasi {question.estimatedSeconds} detik
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-ink-secondary">
            Form input teks, voice note, dan penilaian Conformal Abstention akan dibangun penuh pada
            Issue Track B S6.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
