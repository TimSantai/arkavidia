import { Link } from "react-router"
import { Calendar, Clock, History, MessageSquare, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimelinePreset {
  readonly id: string
  readonly label: string
  readonly asOf: string | undefined
}

const TIMELINE_PRESETS: readonly TimelinePreset[] = [
  {
    id: "week-1",
    label: "Pekan 1 · 6 Nov",
    asOf: "2026-11-06T12:00:00+07:00",
  },
  {
    id: "week-2",
    label: "Pekan 2 · 12 Nov",
    asOf: "2026-11-12T12:00:00+07:00",
  },
  {
    id: "live",
    label: "Saat Ini (Live)",
    asOf: undefined,
  },
]

interface BrainStatusCounts {
  readonly confirmed: number
  readonly proposed: number
  readonly superseded: number
}

interface BitemporalTimelineBarProps {
  readonly teamId: string
  readonly asOf: string | undefined
  readonly counts: BrainStatusCounts
  readonly onChangeAsOf: (nextAsOf: string | undefined) => void
}

function formatSnapshotDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function BitemporalTimelineBar({
  teamId,
  asOf,
  counts,
  onChangeAsOf,
}: BitemporalTimelineBarProps) {
  const customDateValue = asOf ? asOf.slice(0, 10) : ""

  const handleDateInputChange = (value: string) => {
    if (!value) {
      onChangeAsOf(undefined)
      return
    }
    onChangeAsOf(`${value}T23:59:59+07:00`)
  }

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <span className="font-mono text-[11px] font-medium tracking-wider text-ink-tertiary uppercase">
            M2 TEAM · TEMPORAL KNOWLEDGE GRAPH
          </span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-primary sm:text-[28px]">
            Project Brain
          </h1>
          <p className="text-sm text-ink-secondary">
            Rekam keputusan arsitektur tim, alasan penolakan alternatif, dan riwayat evolusi bitemporal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            aria-label="Ringkasan status keputusan"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line-subtle bg-surface px-2.5 py-1.5 shadow-surface"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-text-success">
              <span>{counts.confirmed}</span>
              <span>Confirmed</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-text-info">
              <span>{counts.proposed}</span>
              <span>Proposed</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-ink-tertiary">
              <span>{counts.superseded}</span>
              <span>Superseded</span>
            </span>
          </div>

          <Button variant="outline" size="sm" asChild className="border-line-default bg-surface">
            <Link to={`/teams/${teamId}/chat`} className="gap-1.5">
              <MessageSquare className="size-3.5 text-ink-link" />
              <span>Buka Ruang Tim</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Bitemporal Time-Travel Selector */}
      <section
        aria-label="Time-travel bitemporal"
        className="rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
              <History className="size-3.5 text-ink-link" />
              <span>Time-Travel (as_of)</span>
            </span>

            <div
              role="group"
              aria-label="Preset linimasa Project Brain"
              className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-line-subtle bg-canvas p-1"
            >
              {TIMELINE_PRESETS.map((preset) => {
                const isActive = preset.asOf === asOf
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onChangeAsOf(preset.asOf)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                      isActive
                        ? "bg-brand text-on-brand shadow-surface"
                        : "text-ink-secondary hover:bg-surface hover:text-ink-primary"
                    )}
                  >
                    {preset.asOf === undefined && (
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isActive ? "bg-on-brand" : "bg-success"
                        )}
                      />
                    )}
                    <span>{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-ink-secondary">
            <Calendar className="size-3.5 shrink-0 text-ink-tertiary" />
            <span className="whitespace-nowrap">Tanggal kustom:</span>
            <input
              type="date"
              aria-label="Pilih tanggal snapshot Project Brain"
              value={customDateValue}
              onChange={(event) => handleDateInputChange(event.target.value)}
              className="h-8 rounded-lg border border-line-default bg-canvas px-2.5 font-mono text-xs text-ink-primary outline-none transition-colors focus-visible:border-line-active focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </label>
        </div>

        {asOf && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-active/30 bg-info-subtle px-3 py-2 text-xs text-text-info">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0" />
              <span className="font-medium">
                Melihat snapshot Project Brain per {formatSnapshotDate(asOf)}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onChangeAsOf(undefined)}
              className="border-line-active/40 bg-surface text-ink-primary hover:bg-surface-raised"
            >
              <RotateCcw className="size-3" />
              <span>Kembali ke Live</span>
            </Button>
          </div>
        )}
      </section>
    </header>
  )
}
