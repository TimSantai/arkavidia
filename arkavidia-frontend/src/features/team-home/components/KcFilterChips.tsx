import type { ElementType } from "react"
import {
  BookOpen,
  Database,
  KeyRound,
  LayoutGrid,
  Network,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { KnowledgeComponent } from "@/types/bersama"
import { KC_SHORT_LABELS } from "../teamHomeData"

export interface KcFilterChipsProps {
  readonly kcs: readonly KnowledgeComponent[]
  readonly selectedKcId: string | null
  readonly onSelectKc: (kcId: string | null) => void
}

interface ChipStyle {
  readonly icon: ElementType
  readonly inactiveClass: string
  readonly activeClass: string
}

const CHIP_STYLES: Record<string, ChipStyle> = {
  all: {
    icon: BookOpen,
    inactiveClass:
      "border border-[#e4e6ea] text-ink-secondary hover:bg-[#f6f7f9] dark:border-line-subtle dark:hover:bg-surface-top",
    activeClass:
      "bg-[#1d1e21] text-white border-transparent font-semibold dark:bg-white dark:text-[#1d1e21]",
  },
  "kc-mvc": {
    icon: LayoutGrid,
    inactiveClass:
      "border border-[#c6daff] text-[#1a51c4] hover:bg-[#f1f6ff]/60 dark:border-brand-subtle dark:text-text-info",
    activeClass:
      "bg-[#f1f6ff] text-[#1a51c4] border-transparent font-semibold dark:bg-info-subtle dark:text-text-info",
  },
  "kc-jwt": {
    icon: KeyRound,
    inactiveClass:
      "border border-[#e0bb6c] text-[#755700] hover:bg-[#fef8ec]/60 dark:border-warning dark:text-text-warning",
    activeClass:
      "bg-[#fef8ec] text-[#755700] border-transparent font-semibold dark:bg-warning-subtle dark:text-text-warning",
  },
  "kc-db": {
    icon: Database,
    inactiveClass:
      "border border-[#c6daff] text-[#1a51c4] hover:bg-[#f1f6ff]/60 dark:border-brand-subtle dark:text-text-info",
    activeClass:
      "bg-[#f1f6ff] text-[#1a51c4] border-transparent font-semibold dark:bg-info-subtle dark:text-text-info",
  },
  "kc-api": {
    icon: Network,
    inactiveClass:
      "border border-[#c6daff] text-[#1a51c4] hover:bg-[#f1f6ff]/60 dark:border-brand-subtle dark:text-text-info",
    activeClass:
      "bg-[#f1f6ff] text-[#1a51c4] border-transparent font-semibold dark:bg-info-subtle dark:text-text-info",
  },
}

export function KcFilterChips({
  kcs,
  selectedKcId,
  onSelectKc,
}: KcFilterChipsProps) {
  const isAllSelected = selectedKcId === null

  // Display the 4 primary KCs
  const primaryKcs = kcs.filter((k) =>
    ["kc-mvc", "kc-jwt", "kc-db", "kc-api"].includes(k.id)
  )

  return (
    <div
      role="toolbar"
      aria-label="Filter berdasarkan Knowledge Component"
      className="flex items-center gap-2 overflow-x-auto pb-1 px-0.5 scrollbar-none"
    >
      {/* "Semua" Chip */}
      <button
        type="button"
        aria-pressed={isAllSelected}
        onClick={() => onSelectKc(null)}
        className={cn(
          "h-9 rounded-full px-3.5 text-sm font-medium inline-flex items-center gap-1.5 shrink-0 select-none cursor-pointer",
          "transition-[background-color,border-color,color] duration-150 ease-out",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isAllSelected
            ? CHIP_STYLES.all.activeClass
            : CHIP_STYLES.all.inactiveClass
        )}
      >
        <BookOpen className="size-4 shrink-0" aria-hidden="true" />
        <span>Semua</span>
      </button>

      {/* Per-KC Chips */}
      {primaryKcs.map((kc) => {
        const isSelected = selectedKcId === kc.id
        const style = CHIP_STYLES[kc.id] || CHIP_STYLES.all
        const Icon = style.icon
        const label = KC_SHORT_LABELS[kc.id] || kc.name

        return (
          <button
            key={kc.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectKc(kc.id)}
            className={cn(
              "h-9 rounded-full px-3.5 text-sm font-medium inline-flex items-center gap-1.5 shrink-0 select-none cursor-pointer",
              "transition-[background-color,border-color,color] duration-150 ease-out",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isSelected ? style.activeClass : style.inactiveClass
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
