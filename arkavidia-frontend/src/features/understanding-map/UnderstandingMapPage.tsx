import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { TeamUnderstandingMetrics } from "@/types/bersama"

export function UnderstandingMapPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [metrics, setMetrics] = useState<TeamUnderstandingMetrics | null>(null)

  useEffect(() => {
    void bersamaApi.getTeamUnderstanding(teamId).then(setMetrics)
  }, [teamId])

  if (!metrics) {
    return <p className="text-sm text-ink-tertiary">Memuat peta pemahaman tim...</p>
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="font-mono text-xs text-ink-tertiary">
          TRACK B · F6 + F7 · KNOWLEDGE BUS FACTOR & PAIRING
        </span>
        <h1 className="font-heading text-2xl font-semibold text-ink-primary">
          Peta Pemahaman Tim
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-line-subtle bg-surface shadow-surface">
          <CardHeader>
            <CardDescription className="font-mono text-xs text-ink-tertiary">
              KNOWLEDGE BUS FACTOR
            </CardDescription>
            <CardTitle className="font-heading text-3xl text-text-warning">
              {metrics.busFactor}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border border-line-subtle bg-surface shadow-surface">
          <CardHeader>
            <CardDescription className="font-mono text-xs text-ink-tertiary">
              COVERAGE TIM
            </CardDescription>
            <CardTitle className="font-heading text-3xl text-ink-primary">
              {metrics.overallCoveragePercent}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border border-line-subtle bg-surface shadow-surface">
          <CardHeader>
            <CardDescription className="font-mono text-xs text-ink-tertiary">
              INDEKS GINI (KONSENTRASI)
            </CardDescription>
            <CardTitle className="font-heading text-3xl text-ink-primary">
              {metrics.giniCoefficient}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {metrics.coverageByKc.map((entry) => (
          <Card key={entry.kc.id} className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-tertiary">{entry.kc.code}</span>
                {entry.isSilo ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[11px] text-text-warning">
                    <AlertTriangle className="size-3" />
                    SILO ({entry.understoodCount}/{entry.totalMembers})
                  </span>
                ) : (
                  <span className="rounded-full bg-success-subtle px-2 py-0.5 font-mono text-[11px] text-text-success">
                    COVERAGE {entry.understoodCount}/{entry.totalMembers}
                  </span>
                )}
              </div>
              <CardTitle className="text-base">{entry.kc.name}</CardTitle>
              <CardDescription className="text-ink-secondary">{entry.kc.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-tertiary">
              Yang bisa membantu menjelaskan:{" "}
              <span className="font-medium text-ink-primary">
                {entry.experts.map((u) => u.name.split(" ")[0]).join(", ") || "Belum ada"}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
