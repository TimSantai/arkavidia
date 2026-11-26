import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { motion } from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { cn } from "@/lib/utils"

export function CaptureIllustration({
  active,
  reducedMotion,
}: {
  readonly active: boolean
  readonly reducedMotion: boolean
}) {
  // 0: bubbles, 1: DEC proposed, 2: DEC confirmed
  const [stage, setStage] = useState(reducedMotion ? 2 : 0)

  useEffect(() => {
    if (reducedMotion || !active) return

    let t1: number
    let t2: number

    const runCycle = () => {
      setStage(0)
      t1 = window.setTimeout(() => setStage(1), 900)
      t2 = window.setTimeout(() => setStage(2), 2400)
    }

    runCycle()
    const interval = window.setInterval(runCycle, 6000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [active, reducedMotion])

  const effectiveStage = reducedMotion ? 2 : stage
  const isConfirmed = effectiveStage >= 2

  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-[360px] flex-col gap-2.5 select-none"
    >
      <div className="flex flex-wrap gap-2">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-[#e4ecfb] bg-white/95 px-3 py-1.5 font-sans text-xs text-ink-secondary shadow-[0_2px_8px_-4px_rgb(29_30_33/0.08)] dark:border-white/12 dark:bg-[#1e263b] dark:text-[#bec0c5]"
        >
          &ldquo;Pakai JWT + refresh token aja?&rdquo;
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-xl border border-[#e4ecfb] bg-white/95 px-3 py-1.5 font-sans text-xs text-ink-secondary shadow-[0_2px_8px_-4px_rgb(29_30_33/0.08)] dark:border-white/12 dark:bg-[#1e263b] dark:text-[#bec0c5]"
        >
          &ldquo;Setuju, session di server berat.&rdquo;
        </motion.div>
      </div>

      <motion.div
        animate={
          effectiveStage >= 1
            ? { opacity: 1, y: 0 }
            : { opacity: 0.25, y: 8 }
        }
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex items-center gap-3 rounded-2xl border border-[#e4ecfb] bg-white p-3.5 shadow-[0_6px_18px_-10px_rgb(29_30_33/0.1)] dark:border-white/12 dark:bg-[#232c45]"
      >
        <AgentStickerAvatar
          role="team"
          state={
            effectiveStage === 0
              ? "idle"
              : effectiveStage === 1
                ? "thinking"
                : "success"
          }
          size={38}
          interactive={false}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-xs font-semibold tabular-nums text-ink-primary dark:text-[#e9ebef]">
              DEC-14
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold transition-colors duration-300",
                isConfirmed
                  ? "bg-success-subtle text-text-success dark:bg-[#003f19] dark:text-[#44be69]"
                  : "bg-wash-brand text-ink-link dark:bg-[#4784ff]/20 dark:text-[#9fc1ff]"
              )}
            >
              {isConfirmed && <Check className="size-3" />}
              {isConfirmed ? "CONFIRMED" : "PROPOSED"}
            </span>
          </div>
          <p className="mt-1 font-sans text-sm font-medium text-ink-primary dark:text-[#f4f6f9]">
            JWT + refresh token
          </p>
          <p className="mt-0.5 font-sans text-xs text-ink-tertiary dark:text-[#9fa2a7]">
            3 pesan sumber · 1 alternatif ditolak
          </p>
        </div>
      </motion.div>
    </div>
  )
}
