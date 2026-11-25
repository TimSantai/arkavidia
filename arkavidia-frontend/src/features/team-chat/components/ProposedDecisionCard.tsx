import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  GitPullRequestDraft,
  Sparkles,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { MemoryItem } from "@/types/bersama"
import { USER_AVATAR_MAP } from "./teamChatAvatars"

interface ProposedDecisionCardProps {
  readonly item: MemoryItem
  readonly teamId: string
  readonly onConfirm: (memoryId: string) => Promise<void> | void
}

export function ProposedDecisionCard({
  item,
  teamId,
  onConfirm,
}: ProposedDecisionCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const isConfirmed = item.status === "confirmed"
  const assignee =
    SEED_USERS.find((u) => u.id === (item.content.assigneeId ?? item.ownerId)) ??
    SEED_USERS[0]
  const avatarSrc = USER_AVATAR_MAP[assignee.id]
  const rejectedCount = item.content.rejectedAlternatives.length

  const handleConfirmClick = async () => {
    if (isConfirmed || confirming) return
    setConfirming(true)
    try {
      await onConfirm(item.id)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div
      className={cn(
        "mt-2.5 rounded-xl border p-3.5 transition-colors duration-150",
        isConfirmed
          ? "border-line-subtle bg-success-subtle/40"
          : "border-line-active bg-surface shadow-surface"
      )}
    >
      {/* Top Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-primary">
            <GitPullRequestDraft className="size-3 text-ink-link" />
            {item.code}
          </span>

          {isConfirmed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 font-mono text-[10px] font-semibold text-text-success">
              <CheckCircle2 className="size-3" />
              CONFIRMED · M2
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-ink-link">
              PROPOSED
            </span>
          )}

          {item.aiAssisted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-text-warning">
              <Sparkles className="size-2.5" />
              Dibantu AI
            </span>
          )}
        </div>

        {/* PIC Avatar Chip */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-canvas py-0.5 pr-2.5 pl-1">
          <Avatar size="sm" className="size-5">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={assignee.name} />}
            <AvatarFallback className="text-[9px] font-semibold">
              {assignee.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-medium text-ink-secondary">
            PIC: {assignee.name.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Concise 1-line Title */}
      <h4 className="mt-2 font-heading text-sm font-semibold text-ink-primary">
        {item.content.title}
      </h4>

      {/* Progressive Disclosure for Rationale & Rejected Alternatives */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-2">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary"
          >
            <span>
              {detailsOpen ? "Sembunyikan alasan" : "Lihat alasan"}
              {rejectedCount > 0 ? ` & ${rejectedCount} alternatif ditolak` : ""}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-150",
                detailsOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2.5 space-y-2 rounded-lg border border-line-subtle bg-canvas/70 p-3 text-xs">
          <p className="leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink-primary">Alasan: </span>
            {item.content.rationale}
          </p>

          {rejectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-ink-tertiary">
                Ditolak:
              </span>
              {item.content.rejectedAlternatives.map((alt) => (
                <span
                  key={alt}
                  className="rounded-md border border-line-subtle bg-surface px-2 py-0.5 text-[11px] text-ink-tertiary line-through"
                >
                  {alt}
                </span>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Action Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-2.5">
        {isConfirmed ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-success">
            <CheckCircle2 className="size-3.5" />
            Tercatat di Project Brain M2
          </span>
        ) : (
          <Button
            size="sm"
            disabled={confirming}
            onClick={() => void handleConfirmClick()}
            className="gap-1.5 bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{confirming ? "Menyimpan..." : "Konfirmasi ke Brain"}</span>
          </Button>
        )}

        <Link
          to={`/teams/${teamId}/brain`}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-link hover:underline"
        >
          <span>Lihat di Project Brain</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
