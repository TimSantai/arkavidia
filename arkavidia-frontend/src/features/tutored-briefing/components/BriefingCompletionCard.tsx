import { Link } from "react-router"
import { ArrowRight, CheckCircle2, Compass, RotateCcw } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BriefingCompletionCardProps {
  readonly teamId: string
  readonly onReset: () => void
  readonly className?: string
}

export function BriefingCompletionCard({
  teamId,
  onReset,
  className,
}: BriefingCompletionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-cyan-subtle bg-surface-card py-0 shadow-card transition-[border-color,box-shadow] duration-200 animate-in fade-in-50 zoom-in-98",
        className,
      )}
    >
      <CardHeader className="border-b border-cyan-subtle bg-wash-cyan p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <AgentStickerAvatar
              role="tutor"
              state="success"
              size={56}
              label="Tutor AI merayakan penyelesaian onboarding"
            />

            <div className="space-y-1.5">
              <Badge
                variant="outline"
                className="border-success/50 bg-success-subtle text-xs font-semibold text-text-success"
              >
                Briefing Selesai
              </Badge>

              <CardTitle className="font-display text-2xl font-semibold text-ink-primary sm:text-3xl">
                Siap <span className="font-display-oblique text-ink-cyan">Berkontribusi,</span> Sari
              </CardTitle>

              <p className="text-sm text-ink-secondary">
                Fondasi arsitektur tim telah dipahami lewat refleksi mandiri.
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 self-end sm:flex-col sm:items-end sm:gap-0.5 sm:self-center">
            <span className="kpi-hero text-[40px] leading-none font-semibold text-ink-cyan">
              100%
            </span>
            <span className="text-xs font-medium text-ink-secondary tabular-nums">
              2/2 konsep selesai
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        {/* Mastered Concepts */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 rounded-xl border border-line-subtle bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-cyan">DEC-01</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                <span>Paham</span>
              </span>
            </div>
            <h3 className="text-sm font-semibold text-ink-primary">
              Pola Arsitektur MVC
            </h3>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Logika antrean terisolasi dari UI sehingga 4 anggota bisa kerja paralel dan unit test
              tetap bersih.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-line-subtle bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-cyan">DEC-02</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                <span>Paham</span>
              </span>
            </div>
            <h3 className="text-sm font-semibold text-ink-primary">
              Autentikasi JWT Stateless
            </h3>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Tanpa session di RAM server, memudahkan akses serentak dari klien web dan mobile.
            </p>
          </div>
        </div>

        {/* Personal Agent Synchronization */}
        <div className="flex items-center gap-3.5 rounded-xl border border-violet-subtle bg-wash-violet p-4">
          <AgentStickerAvatar
            role="private"
            state="success"
            size={44}
            label="Personal Agent Sari tersinkronkan"
          />

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink-primary">
                Personal Agent Tersinkronkan
              </span>
              <span className="rounded-full bg-surface-card px-2.5 py-0.5 text-xs font-medium text-ink-violet shadow-badge">
                M1 + M2 Siap
              </span>
            </div>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Batasan MVC dan JWT sudah aktif di Ruang Pribadi untuk membantumu mengerjakan modul
              Integrasi API.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-line-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>Ulangi Briefing</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/teams/${teamId}/understanding`}>
                <Compass className="size-3.5 text-ink-cyan" aria-hidden="true" />
                <span>Peta Pemahaman</span>
              </Link>
            </Button>

            <Button asChild size="sm">
              <Link to={`/teams/${teamId}/private`}>
                <span>Buka Ruang Pribadi (M1)</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
