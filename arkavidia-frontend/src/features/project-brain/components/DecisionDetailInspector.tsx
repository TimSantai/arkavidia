import { Link } from "react-router"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock3,
  GitBranch,
  Link2,
  MessageSquareText,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_MEMORY_EDGES, SEED_TEAM_MESSAGES, SEED_USERS } from "@/mocks/seedData"
import type { EdgeKind, KnowledgeComponent, MemoryItem } from "@/types/bersama"

interface DecisionDetailInspectorProps {
  readonly item: MemoryItem | undefined
  readonly teamId: string
  readonly snapshotItems: readonly MemoryItem[]
  readonly allKnownItems: readonly MemoryItem[]
  readonly kcs: readonly KnowledgeComponent[]
  readonly isConfirming?: boolean
  readonly inDialog?: boolean
  readonly onSelectDecision: (memoryId: string) => void
  readonly onFilterKc?: (kcId: string) => void
  readonly onConfirm: (memoryId: string) => Promise<void> | void
}

interface RelatedDecisionNode {
  readonly edgeId: string
  readonly kind: EdgeKind
  readonly relationLabel: string
  readonly targetItem: MemoryItem
  readonly isInSnapshot: boolean
}

function getDisplayCode(item: MemoryItem): string {
  if (item.id.endsWith("-v0") && !item.code.endsWith("-v0")) {
    return `${item.code}-v0`
  }
  return item.code
}

function formatBitemporalTimestamp(iso: string | null): string {
  if (!iso) return "Aktif (null)"
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function DecisionDetailInspector({
  item,
  teamId,
  snapshotItems,
  allKnownItems,
  kcs,
  isConfirming = false,
  inDialog = false,
  onSelectDecision,
  onFilterKc,
  onConfirm,
}: DecisionDetailInspectorProps) {
  if (!item) {
    return (
      <div className="rounded-xl border border-line-subtle bg-surface p-6 text-center shadow-surface">
        <GitBranch className="mx-auto size-6 text-ink-tertiary" />
        <p className="mt-2 font-heading text-sm font-semibold text-ink-primary">
          Pilih Decision Record
        </p>
        <p className="mt-1 text-xs text-ink-secondary">
          Klik salah satu kartu keputusan di sebelah kiri untuk melihat alasan, alternatif yang ditolak, dan relasi graf.
        </p>
      </div>
    )
  }

  const displayCode = getDisplayCode(item)
  const assignee =
    SEED_USERS.find((user) => user.id === (item.content.assigneeId ?? item.ownerId)) ??
    SEED_USERS[0]
  const avatarSrc = USER_AVATAR_MAP[assignee.id]

  const itemLookup = new Map<string, MemoryItem>()
  for (const known of allKnownItems) itemLookup.set(known.id, known)
  for (const snap of snapshotItems) itemLookup.set(snap.id, snap)

  const snapshotIds = new Set(snapshotItems.map((entry) => entry.id))

  // Build decision-to-decision graph relations from SEED_MEMORY_EDGES
  const decisionNodes: RelatedDecisionNode[] = []
  for (const edge of SEED_MEMORY_EDGES) {
    if (edge.kind === "about_kc" || edge.kind === "owned_by") continue

    if (edge.src === item.id) {
      const target = itemLookup.get(edge.dst)
      if (!target) continue
      const relationLabel =
        edge.kind === "supersedes"
          ? "Menggantikan"
          : edge.kind === "depends_on"
            ? "Bergantung pada"
            : "Konflik dengan"
      decisionNodes.push({
        edgeId: edge.id,
        kind: edge.kind,
        relationLabel,
        targetItem: target,
        isInSnapshot: snapshotIds.has(target.id),
      })
    } else if (edge.dst === item.id) {
      const source = itemLookup.get(edge.src)
      if (!source) continue
      const relationLabel =
        edge.kind === "supersedes"
          ? "Digantikan oleh"
          : edge.kind === "depends_on"
            ? "Menjadi dasar bagi"
            : "Konflik dengan"
      decisionNodes.push({
        edgeId: edge.id,
        kind: edge.kind,
        relationLabel,
        targetItem: source,
        isInSnapshot: snapshotIds.has(source.id),
      })
    }
  }

  // Build KC nodes from both SEED_MEMORY_EDGES (about_kc) and item.kcIds
  const kcEdgeIds = SEED_MEMORY_EDGES.filter(
    (edge) => edge.kind === "about_kc" && edge.src === item.id
  ).map((edge) => edge.dst)
  const uniqueKcIds = Array.from(new Set([...kcEdgeIds, ...item.kcIds]))
  const relatedKcs = kcs.filter((kc) => uniqueKcIds.includes(kc.id))

  const sourceMessages = SEED_TEAM_MESSAGES.filter((msg) =>
    item.sourceMessageIds.includes(msg.id)
  )

  return (
    <div
      className={cn(
        "space-y-4",
        !inDialog && "rounded-xl border border-line-subtle bg-surface p-5 shadow-surface"
      )}
    >
      {/* Header: Code, Status, Title, PIC */}
      <div className="space-y-3 border-b border-line-subtle pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-xs font-semibold text-ink-primary">
            {displayCode}
          </span>

          {item.status === "confirmed" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-success">
              <CheckCircle2 className="size-3" />
              CONFIRMED
            </span>
          )}
          {item.status === "proposed" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line-active bg-info-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-info">
              <Clock3 className="size-3" />
              PROPOSED
            </span>
          )}
          {item.status === "superseded" && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-tertiary">
              SUPERSEDED
            </span>
          )}

          {item.aiAssisted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[11px] font-medium text-text-warning">
              <Bot className="size-3" aria-hidden="true" />
              DIBANTU AI
            </span>
          )}
        </div>

        <h2 className="font-heading text-lg leading-snug font-semibold text-ink-primary">
          {item.content.title}
        </h2>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={assignee.name} />}
              <AvatarFallback className="bg-muted text-xs font-medium text-ink-primary">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-primary">
                {assignee.name}
              </p>
              <p className="truncate text-[11px] text-ink-tertiary">
                {assignee.moduleFocus ?? "Anggota Tim"}
              </p>
            </div>
          </div>

          {item.content.dueDate && (
            <span className="rounded-md border border-line-subtle bg-canvas px-2 py-1 font-mono text-[11px] tabular-nums text-ink-secondary">
              Due {item.content.dueDate}
            </span>
          )}
        </div>

        {/* Bitemporal Timestamps */}
        <dl className="grid grid-cols-1 gap-1.5 rounded-lg border border-line-subtle bg-canvas/70 p-2.5 text-[11px] sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] text-ink-tertiary uppercase">valid_from</dt>
            <dd className="mt-0.5 font-mono font-medium tabular-nums text-ink-primary">
              {formatBitemporalTimestamp(item.validFrom)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] text-ink-tertiary uppercase">valid_to</dt>
            <dd className="mt-0.5 font-mono font-medium tabular-nums text-ink-primary">
              {formatBitemporalTimestamp(item.validTo)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] text-ink-tertiary uppercase">recorded_at</dt>
            <dd className="mt-0.5 font-mono font-medium tabular-nums text-ink-primary">
              {formatBitemporalTimestamp(item.recordedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Ringkasan & Alasan Keputusan */}
      <section className="space-y-2.5">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-ink-tertiary uppercase">
            Ringkasan
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-primary">
            {item.content.summary}
          </p>
        </div>

        <div className="rounded-lg border border-line-subtle bg-canvas/60 p-3">
          <h3 className="text-xs font-semibold tracking-wide text-ink-tertiary uppercase">
            Alasan Keputusan (Rationale)
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            {item.content.rationale}
          </p>
        </div>
      </section>

      {/* Alternatif yang Ditolak */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold tracking-wide text-ink-tertiary uppercase">
          Alternatif yang Ditolak
        </h3>
        {item.content.rejectedAlternatives.length > 0 ? (
          <ul className="space-y-1.5">
            {item.content.rejectedAlternatives.map((alternative) => (
              <li
                key={alternative}
                className="flex items-start gap-2 rounded-lg border border-line-subtle bg-canvas/50 px-3 py-2 text-xs text-ink-secondary"
              >
                <X className="mt-0.5 size-3.5 shrink-0 text-text-error" />
                <span>{alternative}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-tertiary">
            Tidak ada alternatif ditolak yang tercatat pada keputusan ini.
          </p>
        )}
      </section>

      {/* Visual Node-Chain Relasi Graf */}
      <section className="space-y-2.5 border-t border-line-subtle pt-4">
        <div className="flex items-center gap-1.5">
          <GitBranch className="size-3.5 text-ink-link" />
          <h3 className="text-xs font-semibold tracking-wide text-ink-tertiary uppercase">
            Relasi Graf Memori (M2)
          </h3>
        </div>

        {decisionNodes.length === 0 && relatedKcs.length === 0 ? (
          <p className="text-xs text-ink-tertiary">
            Belum ada relasi graf tercatat untuk item ini.
          </p>
        ) : (
          <div className="space-y-2">
            {decisionNodes.map((node) => {
              const targetCode = getDisplayCode(node.targetItem)
              const isConflict = node.kind === "conflicts_with"
              return (
                <button
                  key={node.edgeId}
                  type="button"
                  onClick={() => onSelectDecision(node.targetItem.id)}
                  className={cn(
                    "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border p-2.5 text-left transition-colors duration-150",
                    isConflict
                      ? "border-line-error bg-error-subtle text-text-error hover:bg-error-subtle"
                      : "border-line-subtle bg-canvas/70 hover:border-line-active hover:bg-surface-raised"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-primary">
                        {displayCode}
                      </span>
                      <ArrowRight className="size-3 text-ink-tertiary" />
                      <span
                        className={cn(
                          "font-mono text-[10px] font-medium",
                          isConflict ? "text-text-error" : "text-ink-link"
                        )}
                      >
                        {node.relationLabel}
                      </span>
                      <span className="rounded border border-line-subtle bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-primary">
                        {targetCode}
                      </span>
                      {!node.isInSnapshot && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-ink-tertiary">
                          arsip
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-ink-primary">
                      {node.targetItem.content.title}
                    </p>
                  </div>

                  {isConflict ? (
                    <AlertTriangle className="size-3.5 shrink-0 text-text-error" />
                  ) : (
                    <Link2 className="size-3.5 shrink-0 text-ink-tertiary transition-colors group-hover:text-ink-link" />
                  )}
                </button>
              )
            })}

            {relatedKcs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {relatedKcs.map((kc) => (
                  <button
                    key={kc.id}
                    type="button"
                    onClick={() => onFilterKc?.(kc.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line-subtle bg-canvas/80 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-line-active hover:bg-surface-raised"
                  >
                    <BookOpen className="size-3 text-ink-link" />
                    <span className="font-mono font-semibold text-ink-primary">
                      {kc.code}
                    </span>
                    <span className="text-ink-secondary">{kc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Provenance & Sumber Pesan */}
      <section className="space-y-2 border-t border-line-subtle pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-ink-tertiary uppercase">
            Provenance & Sumber Pesan
          </h3>
          <Link
            to={`/teams/${teamId}/chat`}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-link hover:underline"
          >
            <span>Lihat di Ruang Tim →</span>
          </Link>
        </div>

        <p className="text-xs leading-relaxed text-ink-secondary">{item.provenance}</p>

        {sourceMessages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg border border-line-subtle bg-canvas/70 p-2.5 text-xs"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-tertiary">
              <MessageSquareText className="size-3" />
              <span>{msg.authorName}</span>
            </div>
            <p className="mt-1 line-clamp-3 text-ink-secondary">“{msg.body}”</p>
          </div>
        ))}
      </section>

      {/* Quick Confirm CTA for Proposed Decision */}
      {item.status === "proposed" && (
        <div className="border-t border-line-subtle pt-4">
          <Button
            type="button"
            disabled={isConfirming}
            onClick={() => void onConfirm(item.id)}
            className="w-full gap-1.5 bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
          >
            <CheckCircle2 className="size-4" />
            <span>{isConfirming ? "Mengonfirmasi..." : "Konfirmasi Keputusan"}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
