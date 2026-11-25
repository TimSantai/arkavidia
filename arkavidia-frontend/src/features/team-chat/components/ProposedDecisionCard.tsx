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
        "w-full rounded-2xl border transition-[border-color,box-shadow,background-color] duration-150",
        isConfirmed
          ? "border-line-subtle bg-surface p-3.5 shadow-surface"
          : "border-line-active/70 bg-surface-raised p-4 shadow-raised"
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
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 font-mono text-[10px] font-semibold text-text-warning">
              MENUNGGU KONFIRMASI
            </span>
          )}

          {item.aiAssisted && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary">
              <Sparkles className="size-2.5 text-text-warning" />
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

      {/* Crisp Title */}
      <h4
        className={cn(
          "mt-2.5 font-heading font-semibold text-ink-primary",
          isConfirmed ? "text-sm" : "text-[15px]"
        )}
      >
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
              {detailsOpen ? "Sembunyikan alasan" : "Detail alasan"}
              {rejectedCount > 0 ? ` · ${rejectedCount} alternatif ditolak` : ""}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-150",
                detailsOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-2 rounded-xl bg-canvas/70 px-3.5 py-2.5 text-xs">
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
                  className="rounded-md bg-surface px-2 py-0.5 text-[11px] text-ink-tertiary line-through"
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
          <span>Project Brain</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
