import { AlertTriangle, HelpCircle, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface BusFactorGaugeProps {
  readonly busFactor: number
  readonly totalMembers: number
  readonly siloKcTitle?: string
  readonly siloExpertName?: string
  readonly className?: string
}

// Q: "Berapa banyak anggota yang menahan risiko pengetahuan kritis tim?"
export function BusFactorGauge({
  busFactor,
  totalMembers,
  siloKcTitle = "Autentikasi JWT",
  siloExpertName = "Dimas",
  className,
}: BusFactorGaugeProps) {
  const isVulnerable = busFactor <= 1

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border border-line-subtle bg-surface-card transition-[border-color] duration-150 shadow-none",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-ink-secondary">
              Bus factor
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Penjelasan Knowledge Bus Factor"
                  className="inline-flex size-5 items-center justify-center rounded-full text-ink-tertiary transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <PopoverHeader>
                  <PopoverTitle>Knowledge Bus Factor</PopoverTitle>
                  <PopoverDescription>
                    Mengukur jumlah minimum anggota yang perlu hadir agar konsep kritis tetap dipahami tim. Model adaptasi Truck Factor (Avelino et al., ICPC 2016).
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              isVulnerable
                ? "bg-warning-subtle text-text-warning"
                : "bg-success-subtle text-text-success",
            )}
          >
            {isVulnerable ? (
              <>
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                Silo Kritis
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                Sehat
              </>
            )}
          </span>
        </div>
        <CardTitle className="flex items-baseline gap-2 pt-1">
          <span
            className={cn(
              "kpi-hero text-4xl font-semibold",
              isVulnerable ? "text-text-warning" : "text-text-success",
            )}
          >
            {busFactor}
          </span>
          <span className="text-sm font-normal text-ink-secondary tabular-nums">
            / {totalMembers} anggota
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {/* Segmented Meter Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-secondary">
            <span>Ketahanan Tim</span>
            <span className="font-medium tabular-nums">
              {Math.round((busFactor / Math.max(1, totalMembers)) * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: totalMembers }).map((_, index) => {
              const isFilled = index < busFactor
              return (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-[background-color] duration-300 ease-out",
                    isFilled
                      ? isVulnerable
                        ? "bg-warning"
                        : "bg-success"
                      : "bg-muted",
                  )}
                />
              )
            })}
          </div>
        </div>

        {/* Contextual Narrative */}
        <div
          className={cn(
            "rounded-lg p-2.5 text-xs leading-relaxed",
            isVulnerable
              ? "bg-warning-subtle/50 text-ink-secondary"
              : "bg-success-subtle/50 text-ink-secondary",
          )}
        >
          {isVulnerable ? (
            <p>
              Jika <strong className="text-ink-primary">{siloExpertName}</strong> berhalangan,{" "}
              <strong className="text-ink-primary">{siloKcTitle}</strong> tidak memiliki cadangan
              pemahaman tim.
            </p>
          ) : (
            <p>
              Seluruh konsep kritis dipahami minimal {busFactor} anggota sehingga risiko knowledge
              loss rendah.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
