import { Link } from "react-router"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GitBranch,
  HelpCircle,
  Link2,
  MessageSquareText,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

function formatReadableDate(iso: string | null): string {
  if (!iso) return "Aktif"
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
      <div className="rounded-xl border border-line-subtle bg-surface-card p-6 text-center shadow-card">
        <GitBranch className="mx-auto size-6 text-ink-link" aria-hidden="true" />
        <p className="mt-2 font-sans text-base font-semibold text-ink-primary">
          Pilih Decision Record
        </p>
        <p className="mt-1 text-xs text-ink-secondary">
          Pilih kartu keputusan untuk melihat alasan, alternatif ditolak, dan relasi graf.
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
        !inDialog && "rounded-xl border border-line-subtle bg-surface-card p-5 shadow-card"
      )}
    >
      {/* Header: Code, Status, Title, PIC */}
      <div className="space-y-3 border-b border-line-subtle pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-brand-subtle bg-wash-brand px-2 py-0.5 text-xs font-semibold text-ink-link">
            {displayCode}
          </span>

          {item.status === "confirmed" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-text-success">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Terkonfirmasi
            </span>
          )}
          {item.status === "proposed" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-subtle bg-info-subtle px-2.5 py-0.5 text-xs font-medium text-text-info">
              <Clock3 className="size-3.5" aria-hidden="true" />
              Usulan
            </span>
          )}
          {item.status === "superseded" && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
              Digantikan
            </span>
          )}

          {item.aiAssisted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-medium text-text-warning">
              <Bot className="size-3.5" aria-hidden="true" />
              Dibantu AI
            </span>
          )}
        </div>

        <h2 className="font-display text-xl leading-snug font-semibold text-ink-primary">
          {item.content.title}
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={assignee.name} className="object-cover" />}
              <AvatarFallback className="bg-muted text-xs font-medium text-ink-primary">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-primary">
                {assignee.name}
              </p>
              <p className="truncate text-xs text-ink-secondary">
                {assignee.moduleFocus ?? "Anggota Tim"}
              </p>
            </div>
          </div>

          {item.content.dueDate && (
            <span className="rounded-md border border-line-subtle bg-surface px-2.5 py-1 text-xs tabular-nums text-ink-secondary">
              Target {item.content.dueDate}
            </span>
          )}
        </div>

        {/* Human-readable validity with raw bitemporal DB keys folded into ? Popover */}
        <div className="flex items-center justify-between gap-2 rounded-lg border border-line-subtle bg-surface px-3 py-2 text-xs text-ink-secondary">
          <div className="flex items-center gap-2 tabular-nums">
            <CalendarClock className="size-3.5 shrink-0 text-ink-link" aria-hidden="true" />
            <span>
              Berlaku sejak <strong className="text-ink-primary">{formatReadableDate(item.validFrom)}</strong>
              {item.validTo ? ` hingga ${formatReadableDate(item.validTo)}` : ""}
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Metadata bitemporal database"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <PopoverHeader>
                <PopoverTitle>Metadata Bitemporal</PopoverTitle>
                <PopoverDescription>
                  Atribut pencatatan grafik memori M2.
                </PopoverDescription>
              </PopoverHeader>
              <dl className="grid grid-cols-2 gap-2 border-t border-line-subtle pt-2 text-xs">
                <div>
                  <dt className="text-ink-secondary">id</dt>
                  <dd className="font-medium tabular-nums text-ink-primary">{item.id}</dd>
                </div>
                <div>
                  <dt className="text-ink-secondary">recorded_at</dt>
                  <dd className="font-medium tabular-nums text-ink-primary">
                    {formatBitemporalTimestamp(item.recordedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-secondary">valid_from</dt>
                  <dd className="font-medium tabular-nums text-ink-primary">
                    {formatBitemporalTimestamp(item.validFrom)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-secondary">valid_to</dt>
                  <dd className="font-medium tabular-nums text-ink-primary">
                    {formatBitemporalTimestamp(item.validTo)}
                  </dd>
                </div>
              </dl>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Ringkasan & Alasan Keputusan */}
      <section className="space-y-2.5">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
            Ringkasan
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-primary">
            {item.content.summary}
          </p>
        </div>

        <div className="rounded-lg border border-line-subtle bg-surface p-3">
          <h3 className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
            Alasan Keputusan
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            {item.content.rationale}
          </p>
        </div>
      </section>

      {/* Alternatif yang Ditolak */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
          Alternatif Ditolak
        </h3>
        {item.content.rejectedAlternatives.length > 0 ? (
          <ul className="space-y-1.5">
            {item.content.rejectedAlternatives.map((alternative) => (
              <li
                key={alternative}
                className="flex items-start gap-2 rounded-lg border border-line-subtle bg-surface px-3 py-2 text-xs text-ink-secondary"
              >
                <X className="mt-0.5 size-3.5 shrink-0 text-text-error" aria-hidden="true" />
                <span>{alternative}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-secondary">
            Tidak ada alternatif ditolak yang tercatat.
          </p>
        )}
      </section>

      {/* Visual Node-Chain Relasi Graf */}
      <section className="space-y-2.5 border-t border-line-subtle pt-4">
        <div className="flex items-center gap-1.5">
          <GitBranch className="size-3.5 text-ink-link" aria-hidden="true" />
          <h3 className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
            Relasi Graf Memori
          </h3>
        </div>

        {decisionNodes.length === 0 && relatedKcs.length === 0 ? (
          <p className="text-xs text-ink-secondary">
            Belum ada relasi graf tercatat.
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
                    "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border p-2.5 text-left transition-[border-color,background-color] duration-150",
                    isConflict
                      ? "border-line-error bg-error-subtle text-text-error"
                      : "border-line-subtle bg-surface hover:border-line-active hover:bg-wash-brand/60"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded bg-surface-card px-1.5 py-0.5 font-semibold text-ink-primary">
                        {displayCode}
                      </span>
                      <ArrowRight className="size-3 text-ink-secondary" aria-hidden="true" />
                      <span
                        className={cn(
                          "font-medium",
                          isConflict ? "text-text-error" : "text-ink-link"
                        )}
                      >
                        {node.relationLabel}
                      </span>
                      <span className="rounded border border-line-subtle bg-surface-card px-1.5 py-0.5 font-semibold text-ink-primary">
                        {targetCode}
                      </span>
                      {!node.isInSnapshot && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-ink-secondary">
                          Arsip
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-ink-primary">
                      {node.targetItem.content.title}
                    </p>
                  </div>

                  {isConflict ? (
                    <AlertTriangle className="size-3.5 shrink-0 text-text-error" aria-hidden="true" />
                  ) : (
                    <Link2 className="size-3.5 shrink-0 text-ink-secondary transition-colors group-hover:text-ink-link" aria-hidden="true" />
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
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line-subtle bg-surface px-2.5 py-1.5 text-left text-xs transition-[border-color,background-color] duration-150 hover:border-line-active hover:bg-wash-brand/60"
                  >
                    <BookOpen className="size-3.5 text-ink-link" aria-hidden="true" />
                    <span className="font-semibold text-ink-primary">
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
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
              Sumber Pesan
            </h3>
            {item.sourceMessageIds.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Detail ID sumber pesan"
                    className="inline-flex size-5 items-center justify-center rounded-full text-ink-secondary transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <HelpCircle className="size-3.5" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72">
                  <PopoverHeader>
                    <PopoverTitle>Referensi Sumber</PopoverTitle>
                    <PopoverDescription>
                      {item.provenance}
                    </PopoverDescription>
                  </PopoverHeader>
                  <p className="border-t border-line-subtle pt-2 text-xs text-ink-secondary">
                    ID Pesan: {item.sourceMessageIds.join(", ")}
                  </p>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <Link
            to={`/teams/${teamId}/chat`}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-link hover:underline"
          >
            <span>Buka di Ruang Tim</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <p className="text-xs leading-relaxed text-ink-secondary">{item.provenance}</p>

        {sourceMessages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg border border-line-subtle bg-surface p-2.5 text-xs"
          >
            <div className="flex items-center gap-1.5 font-medium text-ink-secondary">
              <MessageSquareText className="size-3.5 text-ink-link" aria-hidden="true" />
              <span>{msg.authorName}</span>
            </div>
            <p className="mt-1 line-clamp-3 text-ink-primary">{msg.body}</p>
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
            className="w-full gap-1.5 bg-brand text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <span>{isConfirming ? "Mengonfirmasi..." : "Konfirmasi Keputusan"}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
