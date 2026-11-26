import type { CSSProperties, ReactNode } from "react"
import { motion } from "motion/react"
import { useTheme } from "@/components/theme/useTheme"
import { DotField } from "@/components/ui/dot-field"
import { cn } from "@/lib/utils"

const DOT_FIELD_MASK: CSSProperties = {
  maskImage:
    "radial-gradient(ellipse 68% 72% at 50% 50%, #000 32%, rgb(0 0 0 / 0.55) 68%, transparent 100%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 68% 72% at 50% 50%, #000 32%, rgb(0 0 0 / 0.55) 68%, transparent 100%)",
}

const GLOW_BORDER: CSSProperties = {
  background:
    "linear-gradient(135deg, #4784ff 0%, #c6daff 16%, #e9ebef 36%, #e9ebef 64%, #f1d69b 84%, #e0bb6c 100%)",
  boxShadow:
    "-10px -10px 36px -14px rgb(71 132 255 / 0.5), 10px 10px 36px -14px rgb(224 187 108 / 0.55)",
}

export function GlowWindow({
  children,
  className,
  lit = true,
  reducedMotion = false,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly lit?: boolean
  readonly reducedMotion?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme !== "dark"

  return (
    <div className={cn("relative", className)}>
      {/* Interactive Fajar Cobalt-to-Amber DotField perimeter replacing static halftone dots */}
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-x-8 -inset-y-8 sm:-inset-x-20 sm:-inset-y-14"
        style={DOT_FIELD_MASK}
      >
        <DotField
          gradientFrom={isLight ? "#4784ff" : "#4784ff"}
          gradientTo={isLight ? "#c59b37" : "#e0bb6c"}
          gradientAngle={135}
          dotRadius={1.35}
          dotSpacing={15}
          cursorRadius={240}
          bulgeStrength={-0.6}
          glowColor={isLight ? "#2d6ae7" : "#9fc1ff"}
          glowRadius={150}
          glowIntensity={0.65}
          baseOpacity={isLight ? 0.45 : 0.35}
          opacity={isLight ? 0.62 : 0.52}
          lightMode={isLight}
          holdToZoom={false}
          maxDevicePixelRatio={1.5}
        />
      </motion.div>

      {/* Soft ambient corner glows outside the window frame */}
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 0.4 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-8 -left-8 h-44 w-64 rounded-full bg-[#9fc1ff] blur-[68px] sm:-top-10 sm:-left-10 sm:h-56 sm:w-80 dark:opacity-18"
      />
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 0.45 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -right-8 -bottom-8 h-44 w-64 rounded-full bg-[#f1d69b] blur-[68px] sm:-right-10 sm:-bottom-10 sm:h-56 sm:w-80 dark:opacity-15"
      />

      {/* Gradient hairline border */}
      <div className="relative z-10 rounded-[18px] p-[1.5px]" style={GLOW_BORDER}>
        <div className="overflow-hidden rounded-[16.5px] bg-white dark:bg-surface-card">
          {children}
        </div>
      </div>
    </div>
  )
}
