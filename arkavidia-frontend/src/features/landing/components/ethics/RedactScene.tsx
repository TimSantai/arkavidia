import { useEffect, useState } from "react"
import { Lock, LockOpen } from "lucide-react"
import { motion } from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"

const ORIGINAL_PHONE = "0812-3456-7890"
const SCRAMBLE_FRAMES = [
  "7491-0283-5162",
  "3905-8417-2049",
  "9162-5730-8814",
  "5284-1960-4375",
  "8047-6329-1590",
  "4719-9054-6823",
] as const

export function RedactScene({
  playKey,
  isStatic,
}: {
  readonly playKey: number
  readonly isStatic: boolean
}) {
  // stage: "raw" | "flagged" | "scrambling" | "redacted"
  const [stage, setStage] = useState<"raw" | "flagged" | "scrambling" | "redacted">(
    isStatic ? "redacted" : "raw"
  )
  const [scanning, setScanning] = useState(false)
  const [scrambleIdx, setScrambleIdx] = useState(0)

  useEffect(() => {
    if (isStatic || playKey === 0) return

    const timers: number[] = []
    timers.push(
      window.setTimeout(() => {
        setStage("raw")
        setScanning(false)
      }, 0)
    )
    timers.push(window.setTimeout(() => setScanning(true), 250))
    timers.push(window.setTimeout(() => setStage("flagged"), 750))
    timers.push(window.setTimeout(() => setStage("scrambling"), 1050))

    SCRAMBLE_FRAMES.forEach((_, idx) => {
      timers.push(window.setTimeout(() => setScrambleIdx(idx), 1050 + idx * 50))
    })

    timers.push(
      window.setTimeout(() => {
        setStage("redacted")
        setScanning(false)
      }, 1400)
    )

    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [playKey, isStatic])

  const currentStage = isStatic ? "redacted" : stage
  const isRedacted = currentStage === "redacted"

  return (
    <div className="relative flex h-full w-full items-center justify-between gap-2.5 overflow-hidden px-1">
      <div className="flex min-w-0 items-center gap-2.5">
        <AgentStickerAvatar
          role="private"
          state={
            currentStage === "raw"
              ? "idle"
              : isRedacted
                ? "success"
                : "warning"
          }
          size={36}
          interactive={false}
        />
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 font-sans text-xs text-ink-secondary">
          <span>Hubungi aku di</span>
        {currentStage === "raw" && (
          <span className="rounded-md bg-surface-card px-2 py-0.5 font-medium tabular-nums text-ink-primary">
            {ORIGINAL_PHONE}
          </span>
        )}
        {currentStage === "flagged" && (
          <span className="rounded-md bg-error-subtle px-2 py-0.5 font-medium tabular-nums text-text-error line-through">
            {ORIGINAL_PHONE}
          </span>
        )}
        {currentStage === "scrambling" && (
          <span className="rounded-md bg-error-subtle px-2 py-0.5 font-medium tabular-nums text-text-error">
            {SCRAMBLE_FRAMES[scrambleIdx]}
          </span>
        )}
        {isRedacted && (
          <span className="rounded-md bg-warning-subtle px-2 py-0.5 font-semibold tracking-wide text-text-warning">
            [NO_HP_DISAMARKAN]
          </span>
        )}
        </div>
      </div>

      <span
        className={
          isRedacted
            ? "inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-subtle text-text-success"
            : "inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-card text-ink-secondary"
        }
      >
        {isRedacted ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
      </span>

      {/* Scanning light sweep */}
      {!isStatic && scanning && (
        <motion.div
          key={playKey}
          initial={{ left: "-5%", opacity: 0 }}
          animate={{ left: "105%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none absolute inset-y-2 w-0.5 bg-[#4784ff]/70 shadow-[0_0_12px_3px_rgb(71_132_255/0.45)]"
        />
      )}
    </div>
  )
}
