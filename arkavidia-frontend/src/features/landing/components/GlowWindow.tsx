import type { CSSProperties, ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const DOTS_COOL: CSSProperties = {
  backgroundImage: "radial-gradient(#4784ff 1.2px, transparent 1.7px)",
  backgroundSize: "7px 7px",
  maskImage: "radial-gradient(45% 55% at 0% 0%, #000 0%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(45% 55% at 0% 0%, #000 0%, transparent 75%)",
}

const DOTS_WARM: CSSProperties = {
  backgroundImage: "radial-gradient(#e0bb6c 1.2px, transparent 1.7px)",
  backgroundSize: "7px 7px",
  maskImage: "radial-gradient(45% 55% at 100% 100%, #000 0%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(45% 55% at 100% 100%, #000 0%, transparent 75%)",
}

const GLOW_BORDER: CSSProperties = {
  background:
    "linear-gradient(135deg, #4784ff 0%, #c6daff 16%, #e9ebef 36%, #e9ebef 64%, #f1d69b 84%, #e0bb6c 100%)",
  boxShadow:
    "-10px -10px 36px -14px rgb(71 132 255 / 0.65), 10px 10px 36px -14px rgb(224 187 108 / 0.72)",
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
  return (
    <div className={cn("relative", className)}>
      {/* Halftone dots fading from top-left (cool blue) & bottom-right (warm amber) */}
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 0.55 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-10 sm:-inset-[72px] dark:opacity-30"
        style={DOTS_COOL}
      />
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 0.7 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-10 sm:-inset-[72px] dark:opacity-25"
        style={DOTS_WARM}
      />

      {/* Ambient corner glows outside the window frame */}
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 0.55 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-8 -left-8 h-44 w-64 rounded-full bg-[#9fc1ff] blur-[60px] sm:-top-10 sm:-left-10 sm:h-56 sm:w-80 dark:opacity-20"
      />
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={lit ? { opacity: 0.65 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -right-8 -bottom-8 h-44 w-64 rounded-full bg-[#f1d69b] blur-[60px] sm:-right-10 sm:-bottom-10 sm:h-56 sm:w-80 dark:opacity-18"
      />

      {/* Gradient hairline border */}
      <div className="relative rounded-[18px] p-[1.5px]" style={GLOW_BORDER}>
        <div className="overflow-hidden rounded-[16.5px] bg-white dark:bg-surface-card">
          {children}
        </div>
      </div>
    </div>
  )
}
