import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  GitPullRequestDraft,
  HelpCircle,
} from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
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
        "w-full rounded-2xl border bg-surface-card p-4 transition-[border-color,box-shadow,background-color] duration-150",
        isConfirmed
          ? "border-line-subtle shadow-card"
          : "border-brand-subtle shadow-raised"
      )}
    >
      {/* Top Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <AgentStickerAvatar
            role="team"
            state={isConfirmed ? "success" : "warning"}
            size={32}
            interactive={false}
            label={isConfirmed ? "Keputusan terkonfirmasi" : "Menunggu konfirmasi tim"}
          />

          <span className="inline-flex items-center gap-1 rounded-md border border-brand-subtle bg-wash-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-link">
            <GitPullRequestDraft className="size-3.5" aria-hidden="true" />
            {item.code}
          </span>

          {isConfirmed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-semibold text-text-success">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              M2 Terkonfirmasi
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-semibold text-text-warning">
              Menunggu Konfirmasi
            </span>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Detail asal keputusan"
                className="rounded-full border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary"
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <PopoverHeader>
                <PopoverTitle>Jejak Keputusan {item.code}</PopoverTitle>
                <PopoverDescription>
                  {item.provenance}
                  {item.aiAssisted ? " · Diekstrak dengan bantuan Team Agent." : ""}
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>

        {/* Human PIC Portrait Chip */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-top py-0.5 pr-2.5 pl-1 shadow-badge">
          <Avatar size="sm" className="size-5">
            {avatarSrc && (
              <AvatarImage
                src={avatarSrc}
                alt={assignee.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-xs font-semibold">
              {assignee.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-ink-secondary">
            PIC: {assignee.name.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Card Title (Geist font-sans >= 15px) */}
      <h4 className="mt-2.5 font-sans text-base font-semibold text-ink-primary">
        {item.content.title}
      </h4>

      {/* Progressive Disclosure for Rationale & Rejected Alternatives */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-2">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md py-0.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span>
              {detailsOpen ? "Tutup alasan" : "Lihat alasan"}
              {rejectedCount > 0 ? ` · ${rejectedCount} alternatif ditolak` : ""}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-150",
                detailsOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-2 rounded-xl border border-line-subtle bg-surface px-3.5 py-2.5 text-xs">
          <p className="leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink-primary">Alasan: </span>
            {item.content.rationale}
          </p>

          {rejectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-medium text-ink-tertiary">
                Ditolak:
              </span>
              {item.content.rejectedAlternatives.map((alt) => (
                <span
                  key={alt}
                  className="rounded-md border border-line-subtle bg-surface-card px-2 py-0.5 text-xs text-ink-tertiary line-through"
                >
                  {alt}
                </span>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Action Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3">
        {isConfirmed ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Tercatat di Project Brain M2
          </span>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={confirming}
            onClick={() => void handleConfirmClick()}
            className="gap-1.5 bg-brand text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
          >
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>{confirming ? "Menyimpan..." : "Konfirmasi ke Brain"}</span>
          </Button>
        )}

        <Link
          to={`/teams/${teamId}/brain`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span>Project Brain</span>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
