import { AlertTriangle, ShieldCheck, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BusFactorGaugeProps {
  readonly busFactor: number
  readonly totalMembers: number
  readonly siloKcTitle?: string
  readonly siloExpertName?: string
  readonly className?: string
}

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
        "relative overflow-hidden border border-line-subtle bg-surface shadow-surface transition-all",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium tracking-wide text-ink-tertiary">
            KNOWLEDGE BUS FACTOR
          </span>
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
                <AlertTriangle className="size-3.5 shrink-0" />
                Silo Kritis (Faktor 1)
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5 shrink-0" />
                Terdistribusi Sehat
              </>
            )}
          </span>
        </div>
        <CardTitle className="flex items-baseline gap-2 pt-1">
          <span
            className={cn(
              "font-heading text-4xl font-semibold font-mono tabular-nums",
              isVulnerable ? "text-text-warning" : "text-text-success",
            )}
          >
            {busFactor}
          </span>
          <span className="font-mono text-sm text-ink-tertiary tabular-nums">
            / {totalMembers} anggota tim
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {/* Segmented Meter Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
            <span>Level Ketahanan Tim</span>
            <span className="tabular-nums">
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
                    "h-2 rounded-full transition-all duration-300",
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
              ? "bg-warning-subtle/40 text-ink-secondary"
              : "bg-success-subtle/40 text-ink-secondary",
          )}
        >
          {isVulnerable ? (
            <p>
              Jika <strong className="text-ink-primary">{siloExpertName}</strong> berhalangan,
              Knowledge Component kritis{" "}
              <strong className="text-ink-primary">{siloKcTitle}</strong> tidak lagi memiliki
              anggota yang memahaminya. Sesi belajar berpasangan disarankan untuk meratakan
              pemahaman.
            </p>
          ) : (
            <p>
              Seluruh Knowledge Component kritis dipahami oleh setidaknya {busFactor} anggota tim.
              Risiko kehilangan pengetahuan (knowledge loss) terminimalisir.
            </p>
          )}
        </div>

        {/* Academic & Algorithmic Citation */}
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-ink-tertiary">
          <Info className="size-3.5 shrink-0" />
          <span>
            Model adaptasi Truck Factor (Avelino et al., ICPC 2016) untuk silabus kolaborasi.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
