import { Link } from "react-router"
import { formatDistanceToNow, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { ArrowRight, Check } from "lucide-react"
import type { KnowledgeComponent } from "@/types/bersama"
import type { DecisionProgress } from "../teamHomeData"

export interface DecisionProgressRowProps {
  readonly decision: DecisionProgress
  readonly kcs: readonly KnowledgeComponent[]
  readonly teamId: string
}

// Q: "Bagaimana progres pemahaman tim dan statusku terhadap keputusan ini?"
export function DecisionProgressRow({
  decision,
  kcs,
  teamId,
}: DecisionProgressRowProps) {
  const kc = kcs.find((k) => k.id === decision.kcId)
  const kcCode = kc ? kc.code : decision.kcId.toUpperCase()

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

  // Circular progress ring
  const progressRatio =
    decision.teamTotal > 0
      ? Math.min(decision.teamUnderstood / decision.teamTotal, 1)
      : 0
  const ringRadius = 6.5
  const ringCircumference = 2 * Math.PI * ringRadius
  const strokeDashoffset = ringCircumference * (1 - progressRatio)

  return (
    <div className="py-3.5 sm:py-4 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
      {/* Kiri: Chip KC + Judul keputusan (line-clamp-2, no cut off mid-word) */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium text-ink-secondary bg-surface border border-line-subtle">
          {kcCode}
        </span>
        <p
          title={decision.title}
          className="text-sm sm:text-[15px] font-medium text-ink-primary line-clamp-2 leading-snug min-w-0"
        >
          {decision.title}
        </p>
      </div>

      {/* Kolom tengah & kanan */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Kolom "Diubah": Desktop only */}
        <div className="hidden md:block text-right">
          <span className="text-xs text-ink-tertiary tabular-nums">
            Diubah {relativeTime}
          </span>
        </div>

        {/* Kolom "Tim paham": Tablet & Desktop */}
        <div
          className="hidden sm:flex items-center gap-1.5"
          title={`${decision.teamUnderstood} dari ${decision.teamTotal} tim paham`}
        >
          <div className="relative size-4 shrink-0" aria-hidden="true">
            <svg className="size-full -rotate-90" viewBox="0 0 18 18">
              <circle
                cx="9"
                cy="9"
                r={ringRadius}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="2"
              />
              <circle
                cx="9"
                cy="9"
                r={ringRadius}
                fill="none"
                stroke="var(--bg-brand)"
                strokeWidth="2"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs tabular-nums text-ink-secondary font-medium">
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

        {/* Aksi teks */}
        <Link
          to={`/teams/${teamId}/brain`}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-ink-link hover:underline shrink-0 group select-none"
        >
          <span>{decision.youUnderstood ? "Lihat" : "Pahami"}</span>
          <ArrowRight
            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  )
}
