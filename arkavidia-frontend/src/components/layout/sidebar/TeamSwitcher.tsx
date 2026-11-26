import { Link } from "react-router"
import { ChevronsUpDown } from "lucide-react"
import type { Team } from "@/types/bersama"
import { cn } from "@/lib/utils"

export interface TeamSwitcherProps {
  readonly team?: Team
  readonly isMobile?: boolean
}

export function TeamSwitcher({ team, isMobile = false }: TeamSwitcherProps) {
  const courseCode = team?.courseCode ?? "IF2210 PBO"
  const rawTeamName = team?.name ?? "Kelompok 4 · Sistem Antrean Klinik"

  // Clean split for "Kelompok X · Nama Proyek" structure
  const hasSeparator = rawTeamName.includes(" · ")
  const groupLabel = hasSeparator ? rawTeamName.split(" · ")[0] : ""
  const projectTitle = hasSeparator
    ? rawTeamName.split(" · ").slice(1).join(" · ")
    : rawTeamName

  return (
    <Link
      to="/teams"
      title={`Ganti tim: ${rawTeamName}`}
      className={cn(
        "group flex items-center justify-between rounded-xl border border-line-subtle bg-surface-card p-2.5 transition-[background-color,border-color,box-shadow] duration-150 hover:border-line-default hover:bg-surface-top hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring select-none",
        isMobile ? "mr-0" : "mr-4",
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
          <span className="font-semibold text-ink-secondary">{courseCode}</span>
          {groupLabel && (
            <>
              <span className="text-ink-tertiary/60">·</span>
              <span className="truncate">{groupLabel}</span>
            </>
          )}
        </div>
        <p
          title={rawTeamName}
          className="line-clamp-2 text-xs font-semibold leading-snug text-ink-primary mt-0.5"
        >
          {projectTitle}
        </p>
      </div>
      <ChevronsUpDown
        className="size-4 shrink-0 text-ink-tertiary transition-colors duration-150 group-hover:text-ink-primary"
        aria-hidden="true"
      />
    </Link>
  )
}

