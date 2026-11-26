import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { Bot, MessageSquare, RotateCcw, Search } from "lucide-react"
import {
  MainWithAside,
  PageContainer,
  PageHeader,
} from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SEED_KCS, SEED_MEMORY_EDGES } from "@/mocks/seedData"
import { bersamaApi } from "@/services/api"
import type { MemoryItem, MemoryStatus } from "@/types/bersama"
import { BitemporalTimelineBar } from "./components/BitemporalTimelineBar"
import { DecisionDetailInspector } from "./components/DecisionDetailInspector"
import { DecisionRecordCard } from "./components/DecisionRecordCard"

type StatusFilter = "all" | MemoryStatus

const STATUS_TABS: readonly { readonly value: StatusFilter; readonly label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "confirmed", label: "Terkonfirmasi" },
  { value: "proposed", label: "Usulan" },
  { value: "superseded", label: "Usang" },
]

export function ProjectBrainPage() {
  const { teamId = "team-pbo-01" } = useParams()

  const [asOf, setAsOf] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<readonly MemoryItem[]>([])
  const [allTeamItems, setAllTeamItems] = useState<readonly MemoryItem[]>([])
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const requestKey = `${teamId}:${asOf ?? "live"}`
  const isLoading = loadedKey !== requestKey

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [kcFilter, setKcFilter] = useState<string>("all")
  const [aiAssistedOnly, setAiAssistedOnly] = useState(false)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false)

  useEffect(() => {
    let active = true

    void Promise.all([
      bersamaApi.getProjectBrain(teamId, asOf),
      bersamaApi.getProjectBrain(teamId),
    ]).then(([snapshotItems, liveItems]) => {
      if (!active) return
      setItems(snapshotItems)
      setAllTeamItems(liveItems)
      setLoadedKey(requestKey)
      setSelectedId((prev) => {
        if (prev && snapshotItems.some((entry) => entry.id === prev)) {
          return prev
        }
        return snapshotItems[0]?.id ?? null
      })
    })

    return () => {
      active = false
    }
  }, [teamId, asOf, requestKey])

  const counts = useMemo(() => {
    let confirmed = 0
    let proposed = 0
    let superseded = 0
    for (const item of items) {
      if (item.status === "confirmed") confirmed += 1
      else if (item.status === "proposed") proposed += 1
      else if (item.status === "superseded") superseded += 1
    }
    return { confirmed, proposed, superseded }
  }, [items])

  const supersedingByTargetId = useMemo(() => {
    const knownMap = new Map<string, MemoryItem>()
    for (const known of allTeamItems) knownMap.set(known.id, known)
    for (const snap of items) knownMap.set(snap.id, snap)

    const result = new Map<string, MemoryItem>()
    for (const edge of SEED_MEMORY_EDGES) {
      if (edge.kind !== "supersedes") continue
      const source = knownMap.get(edge.src)
      if (source) {
        result.set(edge.dst, source)
      }
    }
    for (const known of knownMap.values()) {
      if (known.supersedesId) {
        result.set(known.supersedesId, known)
      }
    }
    return result
  }, [allTeamItems, items])

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false
      if (kcFilter !== "all" && !item.kcIds.includes(kcFilter)) return false
      if (aiAssistedOnly && !item.aiAssisted) return false
      if (!query) return true

      const displayCode =
        item.id.endsWith("-v0") && !item.code.endsWith("-v0")
          ? `${item.code}-v0`
          : item.code
      return (
        item.code.toLowerCase().includes(query) ||
        displayCode.toLowerCase().includes(query) ||
        item.content.title.toLowerCase().includes(query) ||
        item.content.summary.toLowerCase().includes(query) ||
        item.content.rationale.toLowerCase().includes(query)
      )
    })
  }, [items, searchQuery, statusFilter, kcFilter, aiAssistedOnly])

  const selectedItem = useMemo(() => {
    const pool = items.length > 0 ? items : allTeamItems
    const fromKnown =
      pool.find((entry) => entry.id === selectedId) ??
      allTeamItems.find((entry) => entry.id === selectedId)
    if (fromKnown) return fromKnown
    return filteredItems[0] ?? items[0]
  }, [items, allTeamItems, filteredItems, selectedId])

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all" ||
    kcFilter !== "all" ||
    aiAssistedOnly

  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setStatusFilter("all")
    setKcFilter("all")
    setAiAssistedOnly(false)
  }, [])

  const handleSelectCard = useCallback((item: MemoryItem) => {
    setSelectedId(item.id)
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileDialogOpen(true)
    }
  }, [])

  const handleSelectRelatedDecision = useCallback(
    (memoryId: string) => {
      const inSnapshot = items.some((entry) => entry.id === memoryId)
      if (inSnapshot) {
        const inFiltered = filteredItems.some((entry) => entry.id === memoryId)
        if (!inFiltered) {
          handleResetFilters()
        }
        setSelectedId(memoryId)
        return
      }

      const inLive = allTeamItems.some((entry) => entry.id === memoryId)
      if (inLive) {
        handleResetFilters()
        setAsOf(undefined)
        setSelectedId(memoryId)
      }
    },
    [items, filteredItems, allTeamItems, handleResetFilters]
  )

  const handleConfirmDecision = useCallback(async (memoryId: string) => {
    setConfirmingId(memoryId)
    try {
      const updated = await bersamaApi.confirmMemoryItem(memoryId)
      if (!updated) return

      setItems((prev) =>
        prev.map((entry) => (entry.id === updated.id ? updated : entry))
      )
      setAllTeamItems((prev) =>
        prev.map((entry) => (entry.id === updated.id ? updated : entry))
      )
      setSelectedId(updated.id)
    } finally {
      setConfirmingId(null)
    }
  }, [])

  return (
    <PageContainer width="wide" className="space-y-6">
      {/* 1. Standardized Unified Page Header */}
      <PageHeader
        title={
          <>
            Project <span className="font-display-oblique text-ink-link">Brain</span>
          </>
        }
        description="Rekam keputusan arsitektur tim, alasan, dan riwayat per waktu."
        badge={
          <div
            aria-label="Ringkasan status keputusan"
            className="flex flex-wrap items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1 text-xs"
          >
            <span className="inline-flex items-center gap-1 font-medium text-text-success">
              <span className="tabular-nums font-semibold">{counts.confirmed}</span> Confirmed
            </span>
            <span className="text-ink-tertiary">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-text-info">
              <span className="tabular-nums font-semibold">{counts.proposed}</span> Proposed
            </span>
            <span className="text-ink-tertiary">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-ink-secondary">
              <span className="tabular-nums font-semibold">{counts.superseded}</span> Superseded
            </span>
          </div>
        }
        actions={
          <Button variant="outline" size="sm" asChild className="rounded-full border-line-subtle">
            <Link to={`/teams/${teamId}/chat`} className="gap-1.5">
              <MessageSquare className="size-3.5 text-ink-link" />
              <span>Buka Ruang Tim</span>
            </Link>
          </Button>
        }
      />

      {/* 2. Bitemporal Time-Travel Bar */}
      <BitemporalTimelineBar
        hideHeader
        teamId={teamId}
        asOf={asOf}
        counts={counts}
        onChangeAsOf={setAsOf}
      />

      {/* 3. Filter & Search Section (Plain Surface) */}
      <section
        aria-label="Filter dan pencarian Decision Record"
        className="space-y-3.5 rounded-2xl border border-line-subtle bg-surface-card p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-tertiary" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari kode (DEC-02), judul, atau alasan..."
              aria-label="Cari Decision Record"
              className="rounded-full border-line-default bg-surface pl-9 text-base text-ink-primary placeholder:text-ink-tertiary sm:text-sm"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter status keputusan"
            className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line-subtle bg-surface p-1"
          >
            {STATUS_TABS.map((tab) => {
              const isActive = statusFilter === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-[background-color,color,box-shadow] duration-150",
                    isActive
                      ? "bg-brand text-on-brand shadow-xs"
                      : "text-ink-secondary hover:bg-surface-top hover:text-ink-primary"
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* KC Filter Chips & AI-Assisted Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={kcFilter === "all"}
              onClick={() => setKcFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150",
                kcFilter === "all"
                  ? "border-brand-subtle bg-wash-brand text-ink-link"
                  : "border-line-subtle bg-surface-card text-ink-secondary hover:border-line-default hover:text-ink-primary"
              )}
            >
              Semua KC
            </button>
            {SEED_KCS.map((kc) => {
              const isActive = kcFilter === kc.id
              return (
                <button
                  key={kc.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setKcFilter((prev) => (prev === kc.id ? "all" : kc.id))}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150",
                    isActive
                      ? "border-brand-subtle bg-wash-brand text-ink-link"
                      : "border-line-subtle bg-surface-card text-ink-secondary hover:border-line-default hover:text-ink-primary"
                  )}
                >
                  <span className="font-semibold">{kc.code}</span>
                  <span className="hidden sm:inline">· {kc.name}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            aria-pressed={aiAssistedOnly}
            onClick={() => setAiAssistedOnly((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150",
              aiAssistedOnly
                ? "border-line-strong bg-warning-subtle text-text-warning"
                : "border-line-subtle bg-surface-card text-ink-secondary hover:border-line-default hover:text-ink-primary"
            )}
          >
            <Bot className="size-3.5" aria-hidden="true" />
            <span>Dibantu AI</span>
          </button>
        </div>
      </section>

      {/* 4. Responsive Master-Detail Layout with MainWithAside Primitive */}
      <MainWithAside
        asideWidth="360px"
        sticky={true}
        stickyOffset="top-6"
        main={
          <div className="space-y-3.5">
            {isLoading ? (
              <div className="space-y-3.5" role="status" aria-label="Memuat Decision Record">
                {[1, 2, 3].map((slot) => (
                  <div
                    key={slot}
                    className="h-36 rounded-2xl border border-line-subtle bg-surface-card p-4"
                  >
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="mt-3 h-5 w-3/4 rounded bg-muted/80" />
                    <div className="mt-2 h-3.5 w-full rounded bg-muted/60" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-line-subtle bg-surface-card p-8 text-center">
                <p className="font-heading text-xl font-medium text-ink-primary">
                  Tidak ada keputusan yang cocok
                </p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {asOf
                    ? "Ubah filter atau kembali ke Live untuk melihat semua keputusan."
                    : "Ubah kata kunci pencarian atau reset filter aktif."}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="gap-1.5 rounded-full"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset Filter</span>
                    </Button>
                  )}
                  {asOf && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setAsOf(undefined)}
                      className="rounded-full bg-brand text-on-brand hover:bg-brand-hover"
                    >
                      Kembali ke Live
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              filteredItems.map((item) => (
                <DecisionRecordCard
                  key={item.id}
                  item={item}
                  kcs={SEED_KCS}
                  supersedingItem={supersedingByTargetId.get(item.id)}
                  isSelected={selectedItem?.id === item.id}
                  isConfirming={confirmingId === item.id}
                  onSelect={handleSelectCard}
                  onConfirm={handleConfirmDecision}
                />
              ))
            )}
          </div>
        }
        aside={
          <div className="hidden lg:block">
            <DecisionDetailInspector
              item={selectedItem}
              teamId={teamId}
              snapshotItems={items}
              allKnownItems={allTeamItems}
              kcs={SEED_KCS}
              isConfirming={selectedItem ? confirmingId === selectedItem.id : false}
              onSelectDecision={handleSelectRelatedDecision}
              onFilterKc={(kcId) => setKcFilter((prev) => (prev === kcId ? "all" : kcId))}
              onConfirm={handleConfirmDecision}
            />
          </div>
        }
      />

      {/* 5. Responsive Mobile Detail Dialog (< lg) */}
      <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border border-line-subtle bg-surface-raised p-6 ring-0 shadow-raised sm:max-w-lg lg:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedItem ? `${selectedItem.code}: ${selectedItem.content.title}` : "Detail Keputusan"}
            </DialogTitle>
            <DialogDescription>
              Detail alasan keputusan, alternatif yang ditolak, dan relasi graf memori.
            </DialogDescription>
          </DialogHeader>
          <DecisionDetailInspector
            item={selectedItem}
            teamId={teamId}
            snapshotItems={items}
            allKnownItems={allTeamItems}
            kcs={SEED_KCS}
            isConfirming={selectedItem ? confirmingId === selectedItem.id : false}
            inDialog
            onSelectDecision={handleSelectRelatedDecision}
            onFilterKc={(kcId) => {
              setKcFilter((prev) => (prev === kcId ? "all" : kcId))
              setMobileDialogOpen(false)
            }}
            onConfirm={handleConfirmDecision}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
