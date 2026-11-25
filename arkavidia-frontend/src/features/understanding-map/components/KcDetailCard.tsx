import { Link } from "react-router"
import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { KcCoverageSummary } from "@/types/bersama"
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

interface KcDetailCardProps {
  readonly summary: KcCoverageSummary
  readonly teamId: string
  readonly className?: string
}

export function KcDetailCard({ summary, teamId, className }: KcDetailCardProps) {
  const { kc, understoodCount, totalMembers, isSilo, experts, needsSupport } = summary
  const coveragePercent = Math.round((understoodCount / Math.max(1, totalMembers)) * 100)

  return (
    <Card
      className={cn(
        "overflow-hidden border border-line-subtle bg-surface shadow-surface transition-all",
        className,
      )}
    >
      <CardHeader className="border-b border-line-subtle bg-canvas/30 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accent-violet/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent-violet dark:bg-accent-violet/20">
              {kc.code}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                kc.criticality === "high"
                  ? "bg-warning-subtle text-text-warning"
                  : "bg-muted text-ink-secondary",
              )}
            >
              Prioritas {kc.criticality}
            </span>
          </div>

          {/* Coverage Status Badge */}
          {isSilo ? (
            <Badge
              variant="outline"
              className="gap-1 border-warning/40 bg-warning-subtle font-mono text-xs font-semibold text-text-warning"
            >
              <AlertTriangle className="size-3.5 shrink-0" />
              Silo Terdeteksi ({understoodCount}/{totalMembers})
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-success/40 bg-success-subtle font-mono text-xs font-medium text-text-success"
            >
              <CheckCircle2 className="size-3.5 shrink-0" />
              Cakupan Aman ({understoodCount}/{totalMembers})
            </Badge>
          )}
        </div>

        <CardTitle className="font-heading pt-2 text-xl font-semibold text-ink-primary">
          {kc.name}
        </CardTitle>
        <p className="text-xs leading-relaxed text-ink-secondary">{kc.description}</p>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {/* Positive Silo Callout Banner */}
        {isSilo && (
          <div className="rounded-xl border border-warning/30 bg-warning-subtle/40 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-warning-subtle p-2 text-text-warning">
                <AlertTriangle className="size-4 shrink-0" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-sm font-semibold text-ink-primary">
                  Peluang Berbagi Pengetahuan (Knowledge Silo)
                </h3>
                <p className="text-xs leading-relaxed text-ink-secondary">
                  Saat ini hanya{" "}
                  <strong className="text-ink-primary">
                    {experts.map((e) => e.name.split(" ")[0]).join(", ") || "1 anggota"}
                  </strong>{" "}
                  yang memegang pemahaman penuh pada konsep kritis ini.{" "}
                  <span className="font-medium text-text-warning">
                    {experts[0]?.name.split(" ")[0] ?? "Rekan tim"} bisa membantu menjelaskan
                  </span>{" "}
                  lewat sesi santai 10 menit agar pemahaman merata di seluruh kelompok.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Experts & Peer Resources with AvatarStack */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Who can explain */}
          <div className="rounded-xl border border-line-subtle bg-canvas/30 p-4">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-medium text-ink-secondary">
                Bisa Membantu Menjelaskan
              </span>
              <span className="font-mono text-xs font-semibold text-text-success tabular-nums">
                {experts.length} Anggota
              </span>
            </div>

            {experts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AvatarStack size={32} animate>
                    {experts.map((expert) => (
                      <Avatar key={expert.id} className="size-8 border-2 border-surface">
                        <AvatarImage
                          src={USER_AVATARS[expert.id]}
                          alt={expert.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[10px] font-semibold">
                          {expert.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarStack>
                  <span className="text-xs font-medium text-ink-primary">
                    {experts.map((e) => e.name).join(", ")}
                  </span>
                </div>
                <p className="text-[11px] text-ink-tertiary">
                  Telah melampaui ambang batas penguasaan (P(L) ≥ 0.70) dan siap menjadi rekan diskusi.
                </p>
              </div>
            ) : (
              <p className="text-xs text-ink-tertiary">
                Belum ada anggota yang mencapai ambang batas. Selesaikan kuis Explain-Back mandiri
                terlebih dahulu.
              </p>
            )}
          </div>

          {/* Open to pairing */}
          <div className="rounded-xl border border-line-subtle bg-canvas/30 p-4">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-medium text-ink-secondary">Terbuka Sesi Bareng</span>
              <span className="font-mono text-xs font-semibold text-ink-secondary tabular-nums">
                {needsSupport.length} Anggota
              </span>
            </div>

            {needsSupport.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AvatarStack size={32} animate>
                    {needsSupport.map((user) => (
                      <Avatar key={user.id} className="size-8 border-2 border-surface">
                        <AvatarImage
                          src={USER_AVATARS[user.id]}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[10px] font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarStack>
                  <span className="text-xs font-medium text-ink-secondary">
                    {needsSupport.map((u) => u.name.split(" ")[0]).join(", ")}
                  </span>
                </div>
                <p className="text-[11px] text-ink-tertiary">
                  Siap menjadwalkan review kilat untuk memperkuat konsep implementasi.
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-success font-medium">
                Semua anggota tim telah menguasai Knowledge Component ini!
              </p>
            )}
          </div>
        </div>

        {/* Progress & Quick Action Bar */}
        <div className="flex flex-col gap-4 rounded-xl border border-line-subtle bg-canvas/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-ink-tertiary" />
              <span className="text-xs font-medium text-ink-primary">
                Cakupan Pemahaman Tim: {understoodCount} dari {totalMembers} orang ({coveragePercent}%)
              </span>
            </div>
            <p className="text-[11px] text-ink-tertiary">
              Uji pemahamanmu secara adaptif dengan kuis 5 menit tanpa takut dinilai akademis.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/teams/${teamId}/check`}>
              <Button
                size="sm"
                className="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active shadow-sm font-medium"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                Explain-Back Check
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
