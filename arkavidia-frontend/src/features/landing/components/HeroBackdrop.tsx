import type { RefObject } from "react"
import { useTheme } from "@/components/theme/useTheme"
import { LaserFlow } from "@/components/ui/laser-flow"

export function HeroBackdrop({
  surfaceRef,
}: {
  readonly surfaceRef: RefObject<HTMLElement | null>
}) {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme !== "dark"

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Interactive Cobalt LaserFlow beam landing cleanly on the right shoulder of the workspace frame */}
      <div className="absolute inset-y-0 left-1/2 w-full max-w-[1360px] -translate-x-1/2">
        <LaserFlow
          surfaceRef={surfaceRef}
          beamPosition={0.74}
          color={isLight ? "#2d6ae7" : "#4784ff"}
          theme={isLight ? "light" : "dark"}
          intensity={isLight ? 1.2 : 1.35}
          beamWidth={1}
          flare={1.45}
          spread={1.5}
          spill={0.95}
          fog={0}
          dust={0.2}
          streaks={0.6}
          dots={0}
          pulse={1}
          speed={1.2}
          mouseInteraction
          dpr={1.5}
        />
      </div>

      {/* Subtle two-temperature ambient dawn glows anchored behind the lower workspace frame */}
      <div className="absolute top-[520px] left-1/2 h-[540px] w-full max-w-[1280px] -translate-x-1/2 sm:top-[500px]">
        <div className="absolute top-12 -left-16 size-[280px] rounded-full bg-[var(--glow-cool)] opacity-35 blur-[110px] sm:left-4 sm:size-[460px] dark:opacity-18" />
        <div className="absolute top-16 -right-16 size-[280px] rounded-full bg-[var(--glow-warm)] opacity-40 blur-[110px] sm:right-4 sm:size-[460px] dark:opacity-14" />
      </div>
    </div>
  )
}
