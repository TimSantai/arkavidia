import { Link } from "react-router"
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Compass,
  PartyPopper,
  RotateCcw,
  Sparkles,
} from "lucide-react"
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
        "overflow-hidden border border-success/30 bg-surface shadow-surface transition-all animate-in fade-in-50 zoom-in-98 duration-200",
        className,
      )}
    >
      <CardHeader className="border-b border-success/20 bg-success-subtle/30 p-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success text-on-success shadow-sm">
          <PartyPopper className="size-7" />
        </div>

        <div className="pt-3 space-y-1">
          <Badge
            variant="outline"
            className="border-success/50 bg-success-subtle font-mono text-xs font-semibold text-text-success"
          >
            ONBOARDING SOCRATIC SELESAI
          </Badge>

          <CardTitle className="font-heading text-2xl font-semibold text-ink-primary">
            Selamat Datang di Tim, Sari! 🎉
          </CardTitle>

          <p className="mx-auto max-w-lg text-xs leading-relaxed text-ink-secondary">
            Dalam ~10 menit, kamu telah memahami fondasi arsitektur kelompok melalui refleksi Socratic
            mandiri, bukan sekadar membaca rangkuman pasif.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Mastered Concepts Cards */}
        <div className="space-y-3">
          <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-ink-primary">
            KONSEP KUNCI YANG TELAH DIKUASAI
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Concept 1: DEC-01 */}
            <div className="rounded-xl border border-line-subtle bg-canvas/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-brand">DEC-01</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 font-mono text-[10px] text-text-success">
                  <CheckCircle2 className="size-3" /> Paham
                </span>
              </div>
              <h4 className="font-heading text-sm font-semibold text-ink-primary">
                Pola Arsitektur MVC
              </h4>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Pemisahan Model, View, Controller agar unit testing antrean terisolasi dari UI dan 4
                anggota dapat bekerja paralel tanpa race-condition kode.
              </p>
            </div>

            {/* Concept 2: DEC-02 */}
            <div className="rounded-xl border border-line-subtle bg-canvas/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-accent-violet">DEC-02</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 font-mono text-[10px] text-text-success">
                  <CheckCircle2 className="size-3" /> Paham
                </span>
              </div>
              <h4 className="font-heading text-sm font-semibold text-ink-primary">
                Autentikasi JWT (Stateless)
              </h4>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Token mandiri tanpa session di server RAM, memudahkan integrasi antrean saat diakses
                klien web dan aplikasi mobile secara bersamaan.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Agent Synchronization Status */}
        <div className="flex items-start gap-3.5 rounded-xl border border-brand/30 bg-brand/5 p-4 dark:bg-brand/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand shadow-xs">
            <Bot className="size-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold text-ink-primary">
                Personal Agent Sari Telah Tersinkronkan (M1 + M2)
              </span>
              <span className="rounded-full bg-brand/10 px-2 py-0.2 font-mono text-[10px] text-brand">
                Context Passport Ready
              </span>
            </div>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Personal Agent-mu kini mengenali keputusan MVC dan JWT. Saat kamu menanyakan tugas modul{" "}
              <strong>Integrasi API</strong> di Ruang Pribadi, agenmu langsung tahu batasan arsitektur
              kelompok tanpa perlu kamu jelaskan ulang dari awal.
            </p>
          </div>
        </div>

        {/* 2 Main Action CTAs */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-line-subtle">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-ink-tertiary hover:text-ink-primary hover:bg-muted"
          >
            <RotateCcw className="size-3 mr-1" />
            Ulangi Sesi Socratic
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/teams/${teamId}/understanding`}>
              <Button
                variant="outline"
                size="sm"
                className="border-line-subtle text-xs hover:bg-muted"
              >
                <Compass className="size-3.5 mr-1 text-ink-tertiary" />
                Lihat Peta Pemahaman Tim
              </Button>
            </Link>

            <Link to={`/teams/${teamId}/private`}>
              <Button
                size="sm"
                className="bg-brand text-on-brand hover:bg-brand-hover text-xs font-medium shadow-sm"
              >
                <Sparkles className="size-3.5 mr-1" />
                Buka Personal Agent (M1)
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
