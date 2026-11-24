import { useEffect, useState } from "react"
import { GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { BriefingStep } from "@/types/bersama"

export function TutoredBriefingPage() {
  const [steps, setSteps] = useState<readonly BriefingStep[]>([])

  useEffect(() => {
    void bersamaApi.getBriefingSteps().then(setSteps)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-ink-tertiary">
            TRACK B · F8 · SOCRATIC ONBOARDING
          </span>
          <h1 className="font-heading text-2xl font-semibold text-ink-primary">Tutored Briefing</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1 font-mono text-xs text-ink-secondary">
          <GraduationCap className="size-3.5 text-ink-link" />
          Skenario Sari · ~10 menit
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <Card key={step.id} className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader>
              <span className="font-mono text-xs text-ink-tertiary">
                LANGKAH 0{step.order} · {step.decisionCode}
              </span>
              <CardTitle className="text-base">{step.tutorPrompt}</CardTitle>
              <CardDescription className="text-ink-tertiary">Petunjuk: {step.hint}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-secondary">
              Alur dialog interaktif Socratic akan dikembangkan pada Issue Track B S7.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
