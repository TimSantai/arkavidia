import type { ElementType } from "react"
import {
  BookOpen,
  CheckSquare,
  Database,
  KeyRound,
  LayoutGrid,
  Network,
  Server,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { KnowledgeComponent } from "@/types/bersama"

export interface KcFilterChipsProps {
  readonly kcs: readonly KnowledgeComponent[]
  readonly selectedKcId: string | null
  readonly onSelectKc: (kcId: string | null) => void
}

const KC_ICON_MAP: Record<string, ElementType> = {
  "kc-mvc": LayoutGrid,
  "kc-jwt": KeyRound,
  "kc-db": Database,
  "kc-api": Network,
  "kc-orm": Server,
  "kc-test": CheckSquare,
}

const KC_COLOR_MAP: Record<string, string> = {
  "kc-mvc": "bg-info-subtle text-text-info",
  "kc-jwt": "bg-warning-subtle text-text-warning",
  "kc-db": "bg-info-subtle text-text-info",
  "kc-api": "bg-info-subtle text-text-info",
  "kc-orm": "bg-info-subtle text-text-info",
  "kc-test": "bg-success-subtle text-text-success",
}

export function KcFilterChips({
  kcs,
  selectedKcId,
  onSelectKc,
}: KcFilterChipsProps) {
  const isAllSelected = selectedKcId === null

  return (
    <div
      role="toolbar"
      aria-label="Filter berdasarkan Knowledge Component"
      className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-0.5 snap-x scrollbar-none"
    >
      {/* "Semua KC" Chip */}
      <button
        type="button"
        aria-pressed={isAllSelected}
        onClick={() => onSelectKc(null)}
        className={cn(
          "rounded-2xl bg-surface-raised border p-2 pr-4 flex items-center gap-3 shrink-0 snap-start",
          "shadow-[0_3px_0_0_var(--border-subtle)] text-sm font-medium cursor-pointer select-none",
          "transition-[border-color,box-shadow,transform,background-color] duration-100 ease-out",
          "active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isAllSelected
            ? "border-line-active text-ink-primary bg-surface-top ring-1 ring-line-active/30"
            : "border-line-subtle text-ink-secondary hover:text-ink-primary hover:bg-surface-top"
        )}
      >
        <span
          className="size-11 rounded-2xl bg-info-subtle text-text-info flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <BookOpen className="size-5" />
        </span>
        <span>Semua KC</span>
      </button>

      {/* Per-KC Chips */}
      {kcs.map((kc) => {
        const isSelected = selectedKcId === kc.id
        const Icon = KC_ICON_MAP[kc.id] || BookOpen
        const colorClass = KC_COLOR_MAP[kc.id] || "bg-info-subtle text-text-info"

        return (
          <button
            key={kc.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectKc(kc.id)}
            className={cn(
              "rounded-2xl bg-surface-raised border p-2 pr-4 flex items-center gap-3 shrink-0 snap-start",
              "shadow-[0_3px_0_0_var(--border-subtle)] text-sm font-medium cursor-pointer select-none",
              "transition-[border-color,box-shadow,transform,background-color] duration-100 ease-out",
              "active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isSelected
                ? "border-line-active text-ink-primary bg-surface-top ring-1 ring-line-active/30"
                : "border-line-subtle text-ink-secondary hover:text-ink-primary hover:bg-surface-top"
            )}
          >
            <span
              className={cn(
                "size-11 rounded-2xl flex items-center justify-center shrink-0",
                colorClass
              )}
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </span>
            <div className="flex flex-col text-left">
              <span className="font-mono text-xs text-ink-tertiary">{kc.code}</span>
              <span className="text-ink-primary truncate max-w-[140px] sm:max-w-[200px]">
                {kc.name}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
