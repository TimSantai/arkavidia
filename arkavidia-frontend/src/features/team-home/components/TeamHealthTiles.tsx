import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import type { TeamHealth } from "../teamHomeData"

export interface TeamHealthTilesProps {
  readonly health: TeamHealth
  readonly teamId: string
}

// Q: "Apakah ada modul atau kapasitas tim yang berisiko?"
export function TeamHealthTiles({ health, teamId }: TeamHealthTilesProps) {
  const coveragePercent = Math.round(health.coverage * 100)

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Tile 1: Coverage Tim (Tinted surface, no border) */}
      <div className="rounded-2xl bg-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-ink-secondary">
            Coverage tim
          </span>
          <p className="font-heading font-semibold text-2xl sm:text-[26px] text-ink-primary leading-tight tabular-nums mt-1">
            {coveragePercent}%
          </p>
          <span className="text-xs text-ink-tertiary block mt-0.5">
            kapasitas · agregat tim
          </span>
        </div>

        <Link
          to={`/teams/${teamId}/understanding`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-link hover:underline mt-3 group select-none"
        >
          <span>Lihat peta</span>
          <ArrowRight
            className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Tile 2: Bus Factor (Tinted surface, no border) */}
      <div className="rounded-2xl bg-surface p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-ink-secondary">
            Bus factor
          </span>
          <p className="font-heading font-semibold text-2xl sm:text-[26px] text-ink-primary leading-tight tabular-nums mt-1">
            {health.busFactor}
          </p>
          <span className="text-xs text-ink-tertiary block mt-0.5">
            1 anggota · perlu pairing
          </span>
        </div>

        <Link
          to={`/teams/${teamId}/understanding`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-link hover:underline mt-3 group select-none"
        >
          <span>Lihat peta</span>
          <ArrowRight
            className="size-3 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  )
}
