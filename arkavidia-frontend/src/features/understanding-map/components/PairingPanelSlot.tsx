import { ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PairingSuggestion } from "@/types/bersama"
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

interface PairingPanelSlotProps {
  readonly suggestions: readonly PairingSuggestion[]
  readonly className?: string
}

export function PairingPanelSlot({ suggestions, className }: PairingPanelSlotProps) {
  return (
    <section id="silo-pairing-section" className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-semibold text-ink-primary">
              Rekomendasi Sesi Belajar Berpasangan (Pairing)
            </h2>
            <Badge
              variant="outline"
              className="border-accent-violet/30 bg-accent-violet/10 font-mono text-[10px] text-accent-violet dark:bg-accent-violet/20"
            >
              Issue S5b Ready Slot
            </Badge>
          </div>
          <p className="text-xs text-ink-secondary">
            Dioptimalkan secara greedy pada fungsi objektif submodular coverage untuk
            mendesentralisasi knowledge silo secara efisien.
          </p>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <Card className="border border-line-subtle bg-surface p-6 text-center shadow-surface">
          <p className="text-xs text-ink-tertiary">
            Tidak ada knowledge silo mendesak. Distribusi pemahaman tim telah seimbang.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {suggestions.map((item) => (
            <Card
              key={item.id}
              className="relative overflow-hidden border border-line-subtle bg-surface shadow-surface transition-all hover:border-brand/40"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between border-b border-line-subtle pb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-accent-violet" />
                    <span className="font-mono text-xs font-semibold text-ink-primary">
                      {item.kcName}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-ink-tertiary">
                    <Clock className="size-3" />
                    {item.durationMinutes} Menit Sesi
                  </span>
                </div>

                {/* Mentor & Learner Collaboration Row */}
                <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas/40 p-3">
                  {/* Mentor */}
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 border border-success/40">
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
                      <span className="font-heading text-xs font-semibold text-ink-primary">
                        {item.mentor.name}
                      </span>
                      <p className="text-[10px] text-text-success font-medium">Bisa Membantu</p>
                    </div>
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-ink-tertiary" />

                  {/* Learner */}
                  <div className="flex items-center gap-2.5 text-right">
                    <div className="space-y-0.5">
                      <span className="font-heading text-xs font-semibold text-ink-primary">
                        {item.learner.name}
                      </span>
                      <p className="text-[10px] text-ink-tertiary">Terbuka Sesi</p>
                    </div>
                    <Avatar className="size-9 border border-line-subtle">
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

                {/* Algorithmic Reason */}
                <p className="text-xs leading-relaxed text-ink-secondary">{item.reason}</p>

                {/* Projected Impact */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-tertiary">
                    <TrendingUp className="size-3.5 text-brand" />
                    <span>Proyeksi Cakupan:</span>
                    <span className="font-semibold text-ink-secondary">
                      {item.projectedCoverageBefore}
                    </span>
                    <span>→</span>
                    <span className="font-semibold text-text-success">
                      {item.projectedCoverageAfter}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-line-subtle text-xs hover:bg-muted"
                  >
                    Jadwalkan Sesi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
