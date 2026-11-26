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
      "border border-line-subtle text-ink-secondary hover:bg-surface",
    activeClass:
      "bg-brand text-on-brand border-transparent font-semibold shadow-xs",
  },
  "kc-mvc": {
    icon: LayoutGrid,
    inactiveClass:
      "border border-brand-subtle text-ink-link hover:bg-wash-brand/60",
    activeClass:
      "bg-wash-brand text-ink-link border-brand-subtle font-semibold",
  },
  "kc-jwt": {
    icon: KeyRound,
    inactiveClass:
      "border border-line-strong text-text-warning hover:bg-warning-subtle/60",
    activeClass:
      "bg-warning-subtle text-text-warning border-transparent font-semibold",
  },
  "kc-db": {
    icon: Database,
    inactiveClass:
      "border border-brand-subtle text-ink-link hover:bg-wash-brand/60",
    activeClass:
      "bg-wash-brand text-ink-link border-brand-subtle font-semibold",
  },
  "kc-api": {
    icon: Network,
    inactiveClass:
      "border border-brand-subtle text-ink-link hover:bg-wash-brand/60",
    activeClass:
      "bg-wash-brand text-ink-link border-brand-subtle font-semibold",
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
