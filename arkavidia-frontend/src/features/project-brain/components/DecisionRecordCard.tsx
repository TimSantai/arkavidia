import { Bot, CheckCircle2, Clock3, GitCommitHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { KnowledgeComponent, MemoryItem } from "@/types/bersama"

interface DecisionRecordCardProps {
  readonly item: MemoryItem
  readonly kcs: readonly KnowledgeComponent[]
  readonly supersedingItem?: MemoryItem
  readonly isSelected: boolean
  readonly isConfirming?: boolean
  readonly onSelect: (item: MemoryItem) => void
  readonly onConfirm: (memoryId: string) => Promise<void> | void
}

function getDisplayCode(item: MemoryItem): string {
  if (item.id.endsWith("-v0") && !item.code.endsWith("-v0")) {
    return `${item.code}-v0`
  }
  return item.code
}

function formatValidDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function DecisionRecordCard({
  item,
  kcs,
  supersedingItem,
  isSelected,
  isConfirming = false,
  onSelect,
  onConfirm,
}: DecisionRecordCardProps) {
  const displayCode = getDisplayCode(item)
  const assignee =
    SEED_USERS.find((user) => user.id === (item.content.assigneeId ?? item.ownerId)) ??
    SEED_USERS[0]
  const avatarSrc = USER_AVATAR_MAP[assignee.id]
  const matchedKcs = kcs.filter((kc) => item.kcIds.includes(kc.id))

  return (
    <article
      className={cn(
        "rounded-xl border transition-[border-color,box-shadow,background-color] duration-150",
        isSelected
          ? "border-tertiary bg-wash-cyan shadow-raised"
          : item.status === "proposed"
            ? "border-cyan-subtle bg-surface-card shadow-card hover:border-tertiary"
            : "border-line-subtle bg-surface-card shadow-card hover:border-line-strong"
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-pressed={isSelected}
        className="w-full cursor-pointer rounded-t-xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-line-subtle bg-surface px-2 py-0.5 text-xs font-semibold text-ink-primary">
              <GitCommitHorizontal className="size-3.5 text-ink-cyan" aria-hidden="true" />
              {displayCode}
            </span>

            {item.status === "confirmed" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Terkonfirmasi
              </span>
            )}

            {item.status === "proposed" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-subtle bg-info-subtle px-2.5 py-0.5 text-xs font-medium text-text-info">
                <Clock3 className="size-3.5" aria-hidden="true" />
                Usulan
              </span>
            )}

            {item.status === "superseded" && (
              <span className="inline-flex flex-wrap items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
                <span>Digantikan</span>
                <span>·</span>
                <span>
                  {supersedingItem ? getDisplayCode(supersedingItem) : "DEC-02"}
                </span>
              </span>
            )}

            {item.aiAssisted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-medium text-text-warning">
                <Bot className="size-3.5" aria-hidden="true" />
                Dibantu AI
              </span>
            )}
          </div>

          <span className="text-xs tabular-nums text-ink-tertiary">
            {formatValidDate(item.validFrom)}
          </span>
        </div>

        {/* Title & Concise Rationale */}
        <h2
          className={cn(
            "mt-2.5 font-sans text-base font-semibold text-ink-primary",
            item.status === "superseded" && "text-ink-secondary"
          )}
        >
          {item.content.title}
        </h2>

        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
          {item.content.rationale}
        </p>
      </button>

      {/* Footer: KC Chips, PIC Avatar, and Quick Confirm Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface py-0.5 pr-2.5 pl-1">
            <Avatar size="sm" className="size-5">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={assignee.name} className="object-cover" />}
              <AvatarFallback className="text-xs font-medium">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-ink-secondary">
              {assignee.name.split(" ")[0]}
            </span>
          </div>

          {matchedKcs.map((kc) => (
            <span
              key={kc.id}
              className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2.5 py-0.5 text-xs text-ink-secondary"
            >
              <span className="font-semibold text-ink-primary">{kc.code}</span>
              <span className="hidden sm:inline">· {kc.name}</span>
            </span>
          ))}
        </div>

        {item.status === "proposed" && (
          <Button
            type="button"
            size="sm"
            disabled={isConfirming}
            onClick={() => void onConfirm(item.id)}
            className="gap-1.5 bg-brand text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
          >
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>{isConfirming ? "Mengonfirmasi..." : "Konfirmasi Keputusan"}</span>
          </Button>
        )}
      </div>
    </article>
  )
}
