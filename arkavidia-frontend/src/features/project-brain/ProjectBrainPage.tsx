import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { RotateCcw, Search, Sparkles } from "lucide-react"
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

      const displayCode = item.id.endsWith("-v0") && !item.code.endsWith("-v0")
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

      // Target exists outside current time-travel snapshot: switch to Live so user sees full graph node
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
    <div className="space-y-5">
      <BitemporalTimelineBar
        teamId={teamId}
        asOf={asOf}
        counts={counts}
        onChangeAsOf={setAsOf}
      />

      {/* Filter & Search Bar */}
      <section
        aria-label="Filter dan pencarian Decision Record"
        className="space-y-3 rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-tertiary" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari kode (DEC-02), judul, ringkasan, atau alasan..."
              aria-label="Cari Decision Record"
              className="border-line-default bg-canvas pl-8 text-ink-primary placeholder:text-ink-tertiary"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter status keputusan"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-line-subtle bg-canvas p-1"
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
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                    isActive
                      ? "bg-brand text-on-brand shadow-surface"
                      : "text-ink-secondary hover:bg-surface hover:text-ink-primary"
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* KC Filter Chips & AI-Assisted Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={kcFilter === "all"}
              onClick={() => setKcFilter("all")}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                kcFilter === "all"
                  ? "border-line-active bg-info-subtle text-text-info"
                  : "border-line-subtle bg-canvas text-ink-secondary hover:border-line-strong hover:text-ink-primary"
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
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                    isActive
                      ? "border-line-active bg-info-subtle text-text-info"
                      : "border-line-subtle bg-canvas text-ink-secondary hover:border-line-strong hover:text-ink-primary"
                  )}
                >
                  <span className="font-mono text-[11px]">{kc.code}</span>
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
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
              aiAssistedOnly
                ? "border-line-strong bg-warning-subtle text-text-warning"
                : "border-line-subtle bg-canvas text-ink-secondary hover:border-line-strong hover:text-ink-primary"
            )}
          >
            <Sparkles className="size-3" />
            <span>Dibantu AI</span>
          </button>
        </div>
      </section>

      {/* Master-Detail 2-Column Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Left Master List */}
        <div className="space-y-3 lg:col-span-7">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="h-36 animate-pulse rounded-xl border border-line-subtle bg-surface"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-line-subtle bg-surface p-8 text-center shadow-surface">
              <p className="font-heading text-base font-semibold text-ink-primary">
                Tidak ada Decision Record yang cocok
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                {asOf
                  ? "Coba ubah filter pencarian atau kembali ke linimasa Live untuk melihat seluruh keputusan tim."
                  : "Coba ubah kata kunci pencarian atau reset filter yang aktif."}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="gap-1.5 border-line-default bg-canvas"
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
                    className="bg-brand text-on-brand hover:bg-brand-hover"
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

        {/* Right Sticky Desktop Inspector */}
        <aside className="hidden lg:sticky lg:top-20 lg:col-span-5 lg:block">
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
        </aside>
      </div>

      {/* Responsive Mobile Detail Dialog (< lg) */}
      <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border border-line-subtle bg-surface-raised p-5 shadow-raised sm:max-w-lg lg:hidden">
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
    </div>
  )
}
