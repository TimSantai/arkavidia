import { ShieldCheck, Users } from "lucide-react"
import { PressedButton } from "./PressedButton"
import type { TeamHealth } from "../teamHomeData"

export interface TeamHealthTilesProps {
  readonly health: TeamHealth
  readonly teamId: string
}

export function TeamHealthTiles({ health, teamId }: TeamHealthTilesProps) {
  const coveragePercent = Math.round(health.coverage * 100)

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Tile 1: Coverage Tim */}
      <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-3.5 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="size-9 rounded-xl bg-success-subtle text-text-success flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-xs text-ink-tertiary font-sans font-medium">
              agregat tim
            </span>
          </div>

          <div>
            <p className="text-xs text-ink-secondary font-medium font-sans">
              Coverage tim
            </p>
            <p className="font-heading font-semibold text-2xl sm:text-3xl text-ink-primary leading-tight tabular-nums mt-0.5">
              {coveragePercent}%
            </p>
          </div>
        </div>

        <PressedButton
          to={`/teams/${teamId}/understanding`}
          size="sm"
          className="w-full justify-center"
        >
          Lihat peta
        </PressedButton>
      </div>

      {/* Tile 2: Bus Factor */}
      <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-3.5 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="size-9 rounded-xl bg-error-subtle text-text-error flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Users className="size-5" />
            </span>
            <span className="text-xs text-ink-tertiary font-sans font-medium">
              agregat tim
            </span>
          </div>

          <div>
            <p className="text-xs text-ink-secondary font-medium font-sans">
              Bus factor
            </p>
            <p className="font-heading font-semibold text-2xl sm:text-3xl text-ink-primary leading-tight tabular-nums mt-0.5">
              {health.busFactor}
            </p>
          </div>
        </div>

        <PressedButton
          to={`/teams/${teamId}/understanding`}
          size="sm"
          className="w-full justify-center"
        >
          Lihat peta
        </PressedButton>
      </div>
    </div>
  )
}
