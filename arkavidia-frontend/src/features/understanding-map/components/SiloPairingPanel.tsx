import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  TrendingUp,
} from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import type { PairingSuggestion } from "@/types/bersama"
import { PairingSessionModal } from "./PairingSessionModal"

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
      {/* 1. Silo Alert Banner */}
      {isVulnerable && (
        <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-warning-subtle p-4 shadow-card">
          <div className="rounded-lg bg-surface-card p-2 text-text-warning shadow-badge">
            <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-sm font-semibold text-ink-primary">
                Peringatan Silo Pengetahuan (Bus Factor = 1)
              </span>
              <span className="rounded-full bg-surface-card px-2.5 py-0.5 text-xs font-semibold text-text-warning shadow-badge">
                Prioritas Tinggi
              </span>
            </div>
            <p className="text-xs leading-relaxed text-ink-secondary">
              <strong className="text-ink-primary">{siloKcTitle}</strong> hanya dikuasai{" "}
              <strong className="text-ink-primary">{siloExpertName}</strong>. Sesi 10 menit membantu
              pemahaman merata di tim.
            </p>
          </div>
        </div>
      )}

      {/* 2. Section Header with AI Tutor Insight */}
      <div className="flex items-center gap-3">
        <AgentStickerAvatar
          role="tutor"
          state={isVulnerable ? "nudge" : "idle"}
          size={42}
        />
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h2 className="font-display text-xl font-semibold text-ink-primary">
              Rekomendasi Sesi <span className="font-display-oblique text-ink-link">Jelaskan ke Aku</span>
            </h2>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Cara kerja rekomendasi pairing"
                  className="inline-flex size-5 items-center justify-center rounded-full text-ink-tertiary transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <PopoverHeader>
                  <PopoverTitle>Submodular Pairing Optimizer</PopoverTitle>
                  <PopoverDescription>
                    AI Tutor memilih pasangan belajar dengan proyeksi peningkatan coverage tim tertinggi untuk memecah knowledge silo.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-xs text-ink-secondary">
            Pasangan belajar dengan proyeksi kenaikan coverage tim terbesar.
          </p>
        </div>
      </div>

      {/* 3. Pairing Suggestion Cards */}
      {suggestions.length === 0 ? (
        <Card className="border border-line-subtle bg-surface-card p-6 text-center shadow-card">
          <p className="text-xs text-ink-secondary">
            Tidak ada knowledge silo mendesak. Semua konsep telah dipahami secara merata.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {suggestions.map((item) => {
            const isScheduled = Boolean(scheduledItems[item.id])

            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden border border-line-subtle bg-surface-card shadow-card transition-[border-color,box-shadow] duration-150 hover:border-line-active hover:shadow-raised"
              >
                <CardContent className="space-y-4 p-5">
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                    <div className="flex items-center gap-1.5">
                      <Compass className="size-4 text-ink-link" aria-hidden="true" />
                      <span className="text-sm font-semibold text-ink-primary">
                        {item.kcName}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-secondary">
                      <Clock className="size-3.5 text-ink-link" aria-hidden="true" />
                      {item.durationMinutes} Menit
                    </span>
                  </div>

                  {/* Mentor -> Learner Visual Row */}
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface p-3.5 transition-[background-color] duration-150 group-hover:bg-wash-brand/50">
                    {/* Mentor */}
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-10 border-2 border-success/50 shadow-badge">
                        <AvatarImage
                          src={USER_AVATAR_MAP[item.mentor.id]}
                          alt={item.mentor.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {item.mentor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-sans text-sm font-semibold text-ink-primary">
                          {item.mentor.name}
                        </p>
                        <p className="text-xs font-medium text-text-success">
                          Mentor
                        </p>
                      </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex flex-col items-center gap-0.5">
                      <ArrowRight className="size-4 shrink-0 text-ink-link" aria-hidden="true" />
                      <span className="text-xs text-ink-secondary">Pairing</span>
                    </div>

                    {/* Learner */}
                    <div className="flex items-center gap-2.5 text-right">
                      <div className="space-y-0.5">
                        <p className="font-sans text-sm font-semibold text-ink-primary">
                          {item.learner.name}
                        </p>
                        <p className="text-xs font-medium text-ink-secondary">
                          Belajar Bareng
                        </p>
                      </div>
                      <Avatar className="size-10 border-2 border-line-subtle shadow-badge">
                        <AvatarImage
                          src={USER_AVATAR_MAP[item.learner.id]}
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
                    menjelaskan <strong className="text-ink-primary">{item.kcName}</strong> ke{" "}
                    <strong className="text-ink-primary">{item.learner.name.split(" ")[0]}</strong>.
                  </p>

                  {/* Submodular Gain & Action Buttons */}
                  <div className="flex flex-col gap-3 border-t border-line-subtle pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success/20 bg-success-subtle px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-success">
                      <TrendingUp className="size-3.5" aria-hidden="true" />
                      Coverage: {item.projectedCoverageBefore} → {item.projectedCoverageAfter}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleLater(item.id)}
                        className={cn(
                          "text-xs",
                          isScheduled && "border-brand-subtle bg-wash-brand text-ink-link",
                        )}
                      >
                        {isScheduled ? (
                          <>
                            <CheckCircle2 className="mr-1 size-3.5 text-ink-link" aria-hidden="true" />
                            Terjadwal
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-1 size-3.5" aria-hidden="true" />
                            Nanti
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleStartSession(item)}
                        className="bg-brand text-xs font-medium text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
                      >
                        <Clock className="mr-1 size-3.5" aria-hidden="true" />
                        Mulai 10 Menit
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
