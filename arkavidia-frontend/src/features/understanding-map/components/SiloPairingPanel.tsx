import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  TrendingUp,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PairingSuggestion } from "@/types/bersama"
import { PairingSessionModal } from "./PairingSessionModal"
import avatarRani from "@/features/landing/assets/avatar-rani.jpg"
import avatarDimas from "@/features/landing/assets/avatar-dimas.jpg"
import avatarBudi from "@/features/landing/assets/avatar-budi.jpg"
import avatarSari from "@/features/landing/assets/avatar-sari.jpg"

const USER_AVATARS: Record<string, string> = {
  "user-rani": avatarRani,
  "user-dimas": avatarDimas,
  "user-budi": avatarBudi,
  "user-sari": avatarSari,
}

interface SiloPairingPanelProps {
  readonly suggestions: readonly PairingSuggestion[]
  readonly teamId: string
  readonly busFactor?: number
  readonly siloKcTitle?: string
  readonly siloExpertName?: string
  readonly className?: string
}

export function SiloPairingPanel({
  suggestions,
  teamId,
  busFactor = 1,
  siloKcTitle = "Autentikasi JWT",
  siloExpertName = "Dimas",
  className,
}: SiloPairingPanelProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<PairingSuggestion | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduledItems, setScheduledItems] = useState<Record<string, boolean>>({})

  const isVulnerable = busFactor <= 1

  const handleStartSession = (suggestion: PairingSuggestion) => {
    setSelectedSuggestion(suggestion)
    setIsModalOpen(true)
  }

  const handleScheduleLater = (id: string) => {
    setScheduledItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="silo-pairing-section" className={cn("space-y-4", className)}>
      {/* 1. Silo Alert Banner (DESIGN.md: bg-warning-subtle border border-line-subtle text-text-warning) */}
      {isVulnerable && (
        <div className="flex flex-col gap-3 rounded-xl border border-line-subtle bg-warning-subtle p-4 text-text-warning shadow-surface sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface/60 p-2 text-text-warning shadow-xs">
              <AlertTriangle className="size-5 shrink-0" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-semibold text-ink-primary">
                  Peringatan Silo Pengetahuan (Knowledge Bus Factor = 1)
                </span>
                <span className="rounded-full bg-surface/80 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-text-warning uppercase shadow-xs">
                  Prioritas Tinggi
                </span>
              </div>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Konsep kritis <strong className="text-ink-primary">{siloKcTitle}</strong> saat ini
                hanya dikuasai oleh{" "}
                <strong className="text-ink-primary">{siloExpertName}</strong> (1/4 anggota).{" "}
                <span className="font-medium text-text-warning">
                  {siloExpertName} bisa membantu menjelaskan
                </span>{" "}
                ke anggota lain lewat sesi kilat 10 menit agar pemahaman tidak terpusat pada satu
                orang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Section Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-semibold text-ink-primary">
              Rekomendasi Sesi 'Jelaskan ke Aku' (Pairing Flow)
            </h2>
            <Badge
              variant="outline"
              className="border-accent-violet/30 bg-accent-violet/10 font-mono text-[10px] text-accent-violet dark:bg-accent-violet/20"
            >
              Fitur F7 · Submodular Optimizer
            </Badge>
          </div>
          <p className="text-xs text-ink-secondary">
            Algoritma memilih pasangan belajar dengan proyeksi peningkatan coverage tim terbesar
            untuk memecah silo pengetahuan secara efisien.
          </p>
        </div>
      </div>

      {/* 3. Pairing Suggestion Cards */}
      {suggestions.length === 0 ? (
        <Card className="border border-line-subtle bg-surface p-6 text-center shadow-surface">
          <p className="text-xs text-ink-tertiary">
            Tidak ada knowledge silo mendesak. Seluruh Knowledge Component telah dipahami secara
            merata.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {suggestions.map((item) => {
            const isScheduled = Boolean(scheduledItems[item.id])

            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden border border-line-subtle bg-surface shadow-surface transition-[border-color,box-shadow] duration-150 ease-out hover:border-brand/50 hover:shadow-md"
              >
                <CardContent className="space-y-4 p-5">
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                    <div className="flex items-center gap-1.5">
                      <Compass className="size-3.5 text-accent-violet" aria-hidden="true" />
                      <span className="font-mono text-xs font-semibold text-ink-primary">
                        {item.kcName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                        <Clock className="size-3 text-ink-tertiary" />
                        {item.durationMinutes} Menit Sesi
                      </span>
                    </div>
                  </div>

                  {/* Mentor ↔ Learner Visual Row */}
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas/40 p-3.5 transition-colors group-hover:bg-canvas/60">
                    {/* Mentor */}
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border-2 border-success/40 shadow-xs">
                        <AvatarImage
                          src={USER_AVATARS[item.mentor.id]}
                          alt={item.mentor.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {item.mentor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-heading text-xs font-semibold text-ink-primary">
                          {item.mentor.name}
                        </p>
                        <p className="text-[10px] font-medium text-text-success">
                          Bisa Membantu Menjelaskan
                        </p>
                      </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex flex-col items-center">
                      <ArrowRight className="size-4 shrink-0 text-brand" />
                      <span className="text-[9px] font-mono text-ink-tertiary">Pairing</span>
                    </div>

                    {/* Learner */}
                    <div className="flex items-center gap-3 text-right">
                      <div className="space-y-0.5">
                        <p className="font-heading text-xs font-semibold text-ink-primary">
                          {item.learner.name}
                        </p>
                        <p className="text-[10px] font-medium text-ink-tertiary">
                          Terbuka Sesi Bareng
                        </p>
                      </div>
                      <Avatar className="size-10 border-2 border-line-subtle shadow-xs">
                        <AvatarImage
                          src={USER_AVATARS[item.learner.id]}
                          alt={item.learner.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {item.learner.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Positive Framing Narrative */}
                  <p className="text-xs leading-relaxed text-ink-secondary">
                    <strong className="text-ink-primary">{item.mentor.name.split(" ")[0]}</strong>{" "}
                    bisa membantu menjelaskan{" "}
                    <strong className="text-ink-primary">{item.kcName}</strong> ke{" "}
                    <strong className="text-ink-primary">{item.learner.name.split(" ")[0]}</strong>{" "}
                    lewat sesi 'Jelaskan ke Aku' terarah 10 menit.
                  </p>

                  {/* Submodular Gain & Action Buttons */}
                  <div className="flex flex-col gap-3 border-t border-line-subtle/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Projected Coverage Gain Pill */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-subtle px-2.5 py-1 text-xs font-semibold text-text-success shadow-xs">
                        <TrendingUp className="size-3.5" />
                        Coverage: {item.projectedCoverageBefore} → {item.projectedCoverageAfter}
                      </span>
                    </div>

                    {/* Action CTAs */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleLater(item.id)}
                        className={cn(
                          "border-line-subtle text-xs transition-colors",
                          isScheduled && "border-brand/40 bg-brand/5 text-brand",
                        )}
                      >
                        {isScheduled ? (
                          <>
                            <CheckCircle2 className="size-3 mr-1 text-brand" />
                            Terjadwal
                          </>
                        ) : (
                          <>
                            <Calendar className="size-3 mr-1" />
                            Jadwalkan Nanti
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleStartSession(item)}
                        className="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm font-medium text-xs"
                      >
                        <Clock className="size-3 mr-1" aria-hidden="true" />
                        Mulai Sesi 10 Menit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 4. Interactive Pairing Session Modal */}
      <PairingSessionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        suggestion={selectedSuggestion}
        teamId={teamId}
      />
    </section>
  )
}
