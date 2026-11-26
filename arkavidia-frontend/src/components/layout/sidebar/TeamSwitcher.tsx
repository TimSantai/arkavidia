import { Link } from "react-router"
import { ChevronsUpDown } from "lucide-react"
import type { Team } from "@/types/bersama"

export interface TeamSwitcherProps {
  readonly team?: Team
}

export function TeamSwitcher({ team }: TeamSwitcherProps) {
  const courseCode = team?.courseCode ?? "IF2210 PBO"
  const teamName = team?.name ?? "Kelompok 4 · Antrean Klinik"

  return (
    <Link
      to="/teams"
      title={`Ganti tim: ${teamName}`}
      className="group mr-4 flex items-center justify-between rounded-2xl bg-white p-3 transition-[background-color,box-shadow] duration-150 hover:bg-white/80 dark:bg-surface-card dark:hover:bg-surface-top focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring select-none"
    >
      <div className="min-w-0 flex-1 pr-2">
        <span className="block text-[11px] font-medium text-ink-tertiary">
          {courseCode}
        </span>
        <p
          title={teamName}
          className="truncate text-[13px] font-semibold text-ink-primary"
        >
          {teamName}
        </p>
      </div>
      <ChevronsUpDown
        className="size-4 shrink-0 text-ink-tertiary transition-colors duration-150 group-hover:text-ink-primary"
        aria-hidden="true"
      />
    </Link>
  )
}
