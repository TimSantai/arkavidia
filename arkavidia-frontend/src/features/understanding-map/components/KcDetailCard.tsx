import { Link } from "react-router"
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Users } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import type { KcCoverageSummary } from "@/types/bersama"

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
        "overflow-hidden border border-line-subtle bg-surface-card shadow-card transition-[border-color,box-shadow] duration-150",
        className,
      )}
    >
      <CardHeader className="border-b border-brand-subtle bg-wash-brand pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-brand-subtle bg-surface-card px-2.5 py-0.5 text-xs font-semibold text-ink-link">
              {kc.code}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                kc.criticality === "high"
                  ? "bg-warning-subtle text-text-warning"
                  : "bg-muted text-ink-secondary",
              )}
            >
              Prioritas {kc.criticality}
            </span>
          </div>

          {isSilo ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning-subtle px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-warning">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
              Silo ({understoodCount}/{totalMembers})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-subtle px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-success">
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
              Aman ({understoodCount}/{totalMembers})
            </span>
          )}
        </div>

        <CardTitle className="font-display pt-2 text-xl font-semibold text-ink-primary">
          {kc.name}
        </CardTitle>
        <p className="text-xs leading-relaxed text-ink-secondary">{kc.description}</p>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* Positive Silo Callout Banner */}
        {isSilo && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-subtle/50 p-3.5">
            <div className="rounded-lg bg-warning-subtle p-2 text-text-warning">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-sans text-sm font-semibold text-ink-primary">
                Peluang Berbagi Pengetahuan
              </h3>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Hanya{" "}
                <strong className="text-ink-primary">
                  {experts.map((e) => e.name.split(" ")[0]).join(", ") || "1 anggota"}
                </strong>{" "}
                yang menguasai penuh konsep ini. Sesi santai 10 menit dapat meratakan pemahaman tim.
              </p>
            </div>
          </div>
        )}

        {/* Experts & Peer Resources */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line-subtle bg-surface p-4">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-ink-secondary">
                Bisa Membantu
              </span>
              <span className="text-xs font-semibold tabular-nums text-text-success">
                {experts.length} Anggota
              </span>
            </div>

            {experts.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <AvatarStack size={32} animate>
                    {experts.map((expert) => (
                      <Avatar key={expert.id} className="size-8 border-2 border-surface-card">
                        <AvatarImage
                          src={USER_AVATAR_MAP[expert.id]}
                          alt={expert.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {expert.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarStack>
                  <span className="text-xs font-medium text-ink-primary">
                    {experts.map((e) => e.name).join(", ")}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Siap mendampingi diskusi konsep ini.
                </p>
              </div>
            ) : (
              <p className="text-xs text-ink-secondary">
                Belum ada anggota yang mencapai ambang penguasaan.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-line-subtle bg-surface p-4">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-ink-secondary">
                Terbuka Sesi Bareng
              </span>
              <span className="text-xs font-semibold tabular-nums text-ink-secondary">
                {needsSupport.length} Anggota
              </span>
            </div>

            {needsSupport.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <AvatarStack size={32} animate>
                    {needsSupport.map((user) => (
                      <Avatar key={user.id} className="size-8 border-2 border-surface-card">
                        <AvatarImage
                          src={USER_AVATAR_MAP[user.id]}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarStack>
                  <span className="text-xs font-medium text-ink-primary">
                    {needsSupport.map((u) => u.name.split(" ")[0]).join(", ")}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Siap review kilat untuk memperkuat konsep.
                </p>
              </div>
            ) : (
              <p className="text-xs font-medium text-text-success">
                Semua anggota sudah menguasai konsep ini.
              </p>
            )}
          </div>
        </div>

        {/* Progress & Quick Action Bar */}
        <div className="flex flex-col gap-4 rounded-xl border border-line-subtle bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AgentStickerAvatar
              role="tutor"
              state={isSilo ? "nudge" : "success"}
              size={38}
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-ink-link" aria-hidden="true" />
                <span className="text-xs font-semibold tabular-nums text-ink-primary">
                  Cakupan {understoodCount}/{totalMembers} anggota ({coveragePercent}%)
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Uji pemahamanmu 5 menit secara formatif bersama Socratic Tutor.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="shrink-0 bg-brand text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
          >
            <Link to={`/teams/${teamId}/check`} className="gap-1.5">
              <ClipboardCheck className="size-3.5" aria-hidden="true" />
              <span>Explain-Back Check</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
