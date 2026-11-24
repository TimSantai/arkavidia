import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { MemoryItem } from "@/types/bersama"

export function ProjectBrainPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [items, setItems] = useState<readonly MemoryItem[]>([])

  useEffect(() => {
    void bersamaApi.getProjectBrain(teamId).then(setItems)
  }, [teamId])

  return (
    <div className="space-y-4">
      <div>
        <span className="font-mono text-xs text-ink-tertiary">
          TRACK A · F3 · TEMPORAL KNOWLEDGE GRAPH (M2)
        </span>
        <h1 className="font-heading text-2xl font-semibold text-ink-primary">
          Project Brain (Decision Record)
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <Card key={item.id} className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-ink-tertiary">{item.code}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                      item.status === "confirmed"
                        ? "bg-success-subtle text-text-success"
                        : item.status === "proposed"
                          ? "bg-info-subtle text-text-info"
                          : "bg-muted text-ink-tertiary"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                  {item.aiAssisted && (
                    <span className="rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[11px] text-text-warning">
                      DIBANTU AI
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-ink-tertiary">
                  valid_from: {new Date(item.validFrom).toLocaleDateString("id-ID")}
                </span>
              </div>
              <CardTitle className="text-base">{item.content.title}</CardTitle>
              <CardDescription className="text-ink-secondary">{item.content.rationale}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-ink-tertiary">
              Sumber: {item.provenance}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
