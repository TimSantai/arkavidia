import { HelpCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ConformalGaugeBarProps {
  readonly uncertainty: number
  readonly abstained: boolean
  readonly grade: 0 | 1 | 2 | null
  readonly threshold?: number
  readonly className?: string
}

export function ConformalGaugeBar({
  uncertainty,
  abstained,
  grade,
  threshold = 0.2,
  className,
}: ConformalGaugeBarProps) {
  const confidencePct = Math.max(0, Math.min(100, Math.round((1 - uncertainty) * 100)))
  const thresholdConfidencePct = Math.max(0, Math.min(100, Math.round((1 - threshold) * 100)))

  const fillColorClass = abstained
    ? "bg-warning"
    : grade === 2
      ? "bg-success"
      : "bg-brand"

  const statusTextClass = abstained
    ? "text-text-warning"
    : grade === 2
      ? "text-text-success"
      : "text-ink-link"

  return (
    <div
      className={cn(
        "space-y-2.5 rounded-xl border border-line-subtle bg-surface p-3.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-ink-primary">
            Keyakinan Kalibrasi Grader
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Penjelasan kalibrasi Conformal Risk Control"
                className="inline-flex size-6 items-center justify-center rounded-full text-ink-tertiary transition-[background-color,color] duration-150 hover:bg-muted hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <PopoverHeader>
                <PopoverTitle>Conformal Risk Control</PopoverTitle>
                <PopoverDescription className="text-ink-secondary">
                  Kalibrasi ketidakpastian grader (Angelopoulos et al., ICLR 2024) mencegah AI
                  memberi skor saat jawaban ambigu.
                </PopoverDescription>
              </PopoverHeader>
              <div className="space-y-1.5 rounded-lg border border-line-subtle bg-surface p-2.5 text-xs text-ink-secondary tabular-nums">
                <div className="flex items-center justify-between">
                  <span>Ketidakpastian (s)</span>
                  <span className="font-semibold text-ink-primary">{uncertainty.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ambang batas (λ̂)</span>
                  <span className="font-semibold text-ink-primary">{threshold.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line-subtle pt-1.5">
                  <span>Status keputusan</span>
                  <span className={cn("font-semibold", statusTextClass)}>
                    {abstained ? "Abstain · Teruskan ke Peer" : "Tervalidasi AI"}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2 text-xs tabular-nums">
          <span className={cn("font-semibold", statusTextClass)}>{confidencePct}%</span>
          <span className="text-ink-tertiary">vs ambang {thresholdConfidencePct}%</span>
        </div>
      </div>

      {/* Visual Gauge Track */}
      <div
        role="meter"
        aria-label="Gauge keyakinan kalibrasi terhadap ambang abstention"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={confidencePct}
        className="relative h-3 w-full overflow-hidden rounded-full bg-well"
      >
        {/* Abstain Zone (0 - thresholdConfidencePct) */}
        <div
          className="absolute inset-y-0 left-0 bg-warning-subtle/80 dark:bg-warning-subtle/60"
          style={{ width: `${thresholdConfidencePct}%` }}
        />

        {/* Safe Evaluation Zone (thresholdConfidencePct - 100%) */}
        <div
          className="absolute inset-y-0 right-0 bg-success-subtle/75 dark:bg-success-subtle/55"
          style={{ width: `${100 - thresholdConfidencePct}%` }}
        />

        {/* Active Confidence Fill */}
        <div
          className={cn(
            "relative z-10 h-full rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
            fillColorClass,
          )}
          style={{ width: `${confidencePct}%` }}
        />

        {/* Abstention Threshold Tick */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 z-20 w-0.5 bg-ink-primary/80"
          style={{ left: `${thresholdConfidencePct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-ink-tertiary tabular-nums">
        <span>0% · Zona Abstain</span>
        <span>Ambang {thresholdConfidencePct}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
