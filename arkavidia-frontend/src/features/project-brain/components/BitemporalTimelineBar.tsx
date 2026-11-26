import { Link } from "react-router"
import { Calendar, Clock, HelpCircle, History, MessageSquare, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  readonly hideHeader?: boolean
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
  hideHeader = false,
}: BitemporalTimelineBarProps) {
  const customDateValue = asOf ? asOf.slice(0, 10) : ""

  const handleDateInputChange = (value: string) => {
    if (!value) {
      onChangeAsOf(undefined)
      return
    }
    onChangeAsOf(`${value}T23:59:59+07:00`)
  }

  const timelineContent = (
    <section
      aria-label="Time-travel bitemporal"
      className="rounded-2xl border border-brand-subtle bg-wash-brand p-3.5 sm:p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-link">
            <History className="size-4 shrink-0" aria-hidden="true" />
            <span>Linimasa</span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Penjelasan time-travel bitemporal"
                  className="inline-flex size-5 items-center justify-center rounded-full text-ink-link transition-[background-color,color] duration-150 hover:bg-surface-card/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <PopoverHeader>
                  <PopoverTitle>Time-Travel Bitemporal</PopoverTitle>
                  <PopoverDescription>
                    Memutar kondisi memori M2 pada titik waktu tertentu berdasarkan rentang
                    berlaku (valid_from / valid_to) dan waktu pencatatan (recorded_at / as_of).
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </div>

          <div
            role="group"
            aria-label="Preset linimasa Project Brain"
            className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line-subtle bg-surface-card p-1 shadow-xs"
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
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-[background-color,color,box-shadow] duration-150",
                    isActive
                      ? "bg-brand text-on-brand shadow-xs"
                      : "text-ink-secondary hover:bg-surface-top hover:text-ink-primary"
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

        <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
          <Calendar className="size-3.5 shrink-0 text-ink-link" aria-hidden="true" />
          <span className="whitespace-nowrap">Tanggal kustom:</span>
          <input
            type="date"
            aria-label="Pilih tanggal snapshot Project Brain"
            value={customDateValue}
            onChange={(event) => handleDateInputChange(event.target.value)}
            className="h-8 rounded-full border border-line-default bg-surface-card px-3 text-base tabular-nums text-ink-primary outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-line-active focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-sm"
          />
        </label>
      </div>

      {asOf && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-subtle bg-white dark:bg-surface px-3 py-2 text-xs text-ink-primary">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-ink-link" aria-hidden="true" />
            <span className="font-medium">
              Snapshot per {formatSnapshotDate(asOf)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="rounded-full"
            onClick={() => onChangeAsOf(undefined)}
          >
            <RotateCcw className="size-3" />
            <span>Kembali ke Live</span>
          </Button>
        </div>
      )}
    </section>
  )

  if (hideHeader) {
    return timelineContent
  }

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            Project <span className="font-display-oblique text-ink-link">Brain</span>
          </h1>
          <p className="text-sm text-ink-secondary">
            Rekam keputusan arsitektur tim, alasan, dan riwayat per waktu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            aria-label="Ringkasan status keputusan"
            className="flex flex-wrap items-center gap-1.5 rounded-full border border-line-subtle bg-surface-card px-2.5 py-1"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium tabular-nums text-text-success">
              <span>{counts.confirmed}</span>
              <span>Confirmed</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info-subtle px-2.5 py-0.5 text-xs font-medium tabular-nums text-text-info">
              <span>{counts.proposed}</span>
              <span>Proposed</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-secondary">
              <span>{counts.superseded}</span>
              <span>Superseded</span>
            </span>
          </div>

          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to={`/teams/${teamId}/chat`} className="gap-1.5">
              <MessageSquare className="size-3.5 text-ink-link" />
              <span>Buka Ruang Tim</span>
            </Link>
          </Button>
        </div>
      </div>

      {timelineContent}
    </header>
  )
}
