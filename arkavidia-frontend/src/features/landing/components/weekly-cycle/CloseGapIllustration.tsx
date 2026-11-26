import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DEMO_TEAM_MEMBERS } from "../../landingData"

const DIMAS = DEMO_TEAM_MEMBERS.find((m) => m.id === "user-dimas")
const SARI = DEMO_TEAM_MEMBERS.find((m) => m.id === "user-sari")

export function CloseGapIllustration({
  active,
  reducedMotion,
}: {
  readonly active: boolean
  readonly reducedMotion: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-[340px] flex-col gap-2.5 rounded-2xl border border-white/10 bg-[#28292d]/90 p-4 select-none"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#163644] px-2.5 py-0.5 font-sans text-xs font-semibold tracking-wide text-[#73cdf8]">
          PAIRING · 10 MNT
        </span>
        <span className="font-sans text-xs text-[#9fa2a7]">KC-02 JWT</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <Avatar size="sm" className="size-10 border border-white/15">
            {DIMAS?.avatarSrc && (
              <AvatarImage src={DIMAS.avatarSrc} alt="Dimas" />
            )}
            <AvatarFallback className="bg-[#323337] text-xs font-semibold text-[#f4f6f9]">
              DP
            </AvatarFallback>
          </Avatar>
          <span className="font-sans text-xs font-medium text-[#bec0c5]">
            DP
          </span>
        </div>

        {/* Animated dashed transfer bridge */}
        <div className="relative flex flex-1 items-center">
          <svg
            viewBox="0 0 160 12"
            preserveAspectRatio="none"
            className="h-3 w-full"
          >
            <motion.line
              x1="4"
              y1="6"
              x2="156"
              y2="6"
              stroke="#3dafe0"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={active || reducedMotion ? { pathLength: 1 } : undefined}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </svg>
          {!reducedMotion && active && (
            <motion.span
              className="absolute top-1/2 left-1 size-2 -translate-y-1/2 rounded-full bg-[#73cdf8] shadow-[0_0_10px_2px_rgb(61_175_224/0.75)]"
              animate={{ left: ["6%", "90%", "6%"] }}
              transition={{
                duration: 3.2,
                delay: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <Avatar size="sm" className="size-10 border border-white/15">
            {SARI?.avatarSrc && <AvatarImage src={SARI.avatarSrc} alt="Sari" />}
            <AvatarFallback className="bg-[#323337] text-xs font-semibold text-[#f4f6f9]">
              SW
            </AvatarFallback>
          </Avatar>
          <span className="font-sans text-xs font-medium text-[#bec0c5]">
            SW
          </span>
        </div>
      </div>
    </div>
  )
}
