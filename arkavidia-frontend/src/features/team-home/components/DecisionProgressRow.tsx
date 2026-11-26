import { formatDistanceToNow, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { Check, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { KnowledgeComponent } from "@/types/bersama"
import { PressedButton } from "./PressedButton"
import type { DecisionProgress } from "../teamHomeData"

export interface DecisionProgressRowProps {
  readonly decision: DecisionProgress
  readonly kcs: readonly KnowledgeComponent[]
  readonly teamId: string
}

export function DecisionProgressRow({
  decision,
  kcs,
  teamId,
}: DecisionProgressRowProps) {
  const kc = kcs.find((k) => k.id === decision.kcId)
  const kcCode = kc ? kc.code : decision.kcId.toUpperCase()

  // Format relative time concisely ("2 hari lalu")
  const relativeTime = (() => {
    try {
      return formatDistanceToNow(parseISO(decision.changedAt), {
        addSuffix: true,
        locale: id,
      }).replace(" yang lalu", " lalu")
    } catch {
      return "Baru saja"
    }
  })()

  // Circular progress ring for team aggregate
  const progressRatio =
    decision.teamTotal > 0
      ? Math.min(decision.teamUnderstood / decision.teamTotal, 1)
      : 0
  const ringRadius = 7
  const ringCircumference = 2 * Math.PI * ringRadius
  const strokeDashoffset = ringCircumference * (1 - progressRatio)

  return (
    <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-[border-color,box-shadow] duration-150">
      {/* Left: Pastel Tile + Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="size-11 rounded-2xl bg-info-subtle text-text-info flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <FileText className="size-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0 text-xs font-mono font-medium text-ink-secondary border-line-subtle"
            >
              {kcCode}
            </Badge>
            <span className="font-mono text-xs text-ink-tertiary">
              {decision.id}
            </span>
          </div>

          <p className="text-sm sm:text-base font-semibold text-ink-primary truncate mt-0.5 max-w-[200px] sm:max-w-[320px] md:max-w-[420px]">
            {decision.title}
          </p>
        </div>
      </div>

      {/* Right Column Group */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Kolom "Diubah": Desktop only */}
        <div className="hidden md:block text-right">
          <span className="text-xs text-ink-tertiary tabular-nums">
            {relativeTime}
          </span>
        </div>

        {/* Kolom "Tim paham": Tablet & Desktop only */}
        <div className="hidden sm:flex items-center gap-2" title={`${decision.teamUnderstood} dari ${decision.teamTotal} anggota tim paham`}>
          <div className="relative size-5 shrink-0" aria-hidden="true">
            <svg className="size-full -rotate-90" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r={ringRadius}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="2.5"
              />
              <circle
                cx="10"
                cy="10"
                r={ringRadius}
                fill="none"
                stroke="var(--bg-brand)"
                strokeWidth="2.5"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-mono tabular-nums text-ink-secondary font-medium">
            {decision.teamUnderstood}/{decision.teamTotal}
          </span>
        </div>

        {/* Kolom "Kamu": Status user sendiri */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium">
          {decision.youUnderstood ? (
            <>
              <Check className="size-4 text-text-success shrink-0" aria-hidden="true" />
              <span className="text-text-success hidden xs:inline">Paham</span>
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-warning shrink-0" aria-hidden="true" />
              <span className="text-text-warning hidden xs:inline">Belum dicek</span>
            </>
          )}
        </div>

        {/* CTA */}
        <PressedButton
          to={`/teams/${teamId}/brain`}
          size="sm"
          className="shrink-0"
        >
          {decision.youUnderstood ? "Lihat" : "Pahami"}
        </PressedButton>
      </div>
    </div>
  )
}
