import { useEffect, useState } from "react"
import { Mic } from "lucide-react"
import { motion } from "motion/react"
import type { AgentAppearance } from "@/components/bersama/agentConfig"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"

const AMBER_TUTOR_APPEARANCE: AgentAppearance = {
  skin: null,
  color: "#d9a538",
  eyeColor: "#fff5e0",
  eyeStyle: "round",
  view: "3d",
  antenna: true,
}

const WAVE_BARS: readonly { readonly rest: number; readonly duration: number }[] = [
  { rest: 0.4, duration: 0.72 },
  { rest: 0.85, duration: 0.95 },
  { rest: 0.55, duration: 0.64 },
  { rest: 1, duration: 1.1 },
  { rest: 0.7, duration: 0.82 },
  { rest: 0.45, duration: 1.05 },
  { rest: 0.65, duration: 0.76 },
]

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, "0")}`
}

export function CheckIllustration({
  active,
  reducedMotion,
}: {
  readonly active: boolean
  readonly reducedMotion: boolean
}) {
  // Static final display 4:32 (272s); live counts down from 5:00 (300s)
  const [seconds, setSeconds] = useState(reducedMotion ? 272 : 300)

  useEffect(() => {
    if (reducedMotion || !active) return

    const timer = window.setInterval(() => {
      setSeconds((prev) => (prev <= 240 ? 300 : prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [active, reducedMotion])

  const displaySeconds = reducedMotion ? 272 : seconds

  return (
    <div
      aria-hidden="true"
      className="inline-flex items-center gap-3 rounded-2xl border border-[#e4ecfb] bg-white px-3.5 py-3 shadow-[0_6px_18px_-10px_rgb(29_30_33/0.1)] select-none dark:border-white/12 dark:bg-[#1e263b]"
    >
      <AgentStickerAvatar
        role="tutor"
        state={active && !reducedMotion ? "speaking" : "idle"}
        size={38}
        interactive={false}
        appearanceOverride={AMBER_TUTOR_APPEARANCE}
      />
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-warning-subtle text-text-warning dark:bg-[#423000] dark:text-[#f1d69b]">
          <Mic className="size-3.5" />
        </span>
        <span className="kpi-hero text-[30px] leading-none font-semibold text-[#755700] dark:text-[#f1d69b]">
          {formatTimer(displaySeconds)}
        </span>
      </div>

      <div className="flex h-8 items-center gap-1">
        {WAVE_BARS.map((bar, idx) => (
          <motion.span
            key={idx}
            className="h-7 w-1 origin-center rounded-full bg-[#c59b37] dark:bg-[#f1d69b]"
            animate={
              reducedMotion || !active
                ? { scaleY: bar.rest }
                : { scaleY: [0.3, bar.rest, 0.25, Math.min(1, bar.rest + 0.15)] }
            }
            transition={
              reducedMotion || !active
                ? { duration: 0.2 }
                : {
                    duration: bar.duration,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>
    </div>
  )
}
