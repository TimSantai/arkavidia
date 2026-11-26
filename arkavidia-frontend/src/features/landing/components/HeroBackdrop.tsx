import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react"
import { useTheme } from "@/components/theme/useTheme"
import { LaserFlow } from "@/components/ui/laser-flow"

const TOP_FEATHER_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, #000 10%, #000 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, #000 10%, #000 100%)",
}

export function HeroBackdrop({
  surfaceRef,
}: {
  readonly surfaceRef: RefObject<HTMLElement | null>
}) {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme !== "dark"
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const [beamPos, setBeamPos] = useState(0.8)

  useEffect(() => {
    const backdrop = backdropRef.current
    const surface = surfaceRef.current
    if (!backdrop || !surface) return

    const updateBeamPosition = () => {
      const box = backdrop.getBoundingClientRect()
      const card = surface.getBoundingClientRect()
      if (box.width <= 0 || card.width <= 0) return

      // Aim beam onto the right shoulder of the workspace frame (~87% along card),
      // completely clear of the centered floating navbar, H1, CTAs, and social proof.
      const targetX = card.left - box.left + card.width * 0.87
      const normalized = Math.min(0.92, Math.max(0.68, targetX / box.width))
      setBeamPos(normalized)
    }

    updateBeamPosition()
    const observer = new ResizeObserver(updateBeamPosition)
    observer.observe(backdrop)
    observer.observe(surface)
    window.addEventListener("resize", updateBeamPosition)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateBeamPosition)
    }
  }, [surfaceRef])

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Full-width Cobalt LaserFlow (zero horizontal clipping wall) landing on the workspace right shoulder */}
      <div className="absolute inset-0" style={TOP_FEATHER_MASK}>
        <LaserFlow
          surfaceRef={surfaceRef}
          beamPosition={beamPos}
          color={isLight ? "#2d6ae7" : "#4784ff"}
          theme={isLight ? "light" : "dark"}
          intensity={isLight ? 1.0 : 1.25}
          beamWidth={0.85}
          flare={1.25}
          spread={1.15}
          spill={0.75}
          fog={0}
          dust={0.18}
          streaks={0.55}
          dots={0}
          pulse={0.9}
          speed={1.15}
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
