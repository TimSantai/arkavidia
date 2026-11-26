import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { motion } from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import {
  Cursor,
  CursorBody,
  CursorName,
  CursorPointer,
} from "@/components/kibo-ui/cursor"
import { cn } from "@/lib/utils"

const EASE = [0.2, 0.8, 0.2, 1] as const

export function ConfirmScene({
  playKey,
  isStatic,
}: {
  readonly playKey: number
  readonly isStatic: boolean
}) {
  // phase 0: proposed, 1: cursor moving, 2: click press, 3: confirmed + cursor gone
  const [phase, setPhase] = useState(isStatic ? 3 : 0)

  useEffect(() => {
    if (isStatic || playKey === 0) return

    const timers: number[] = []
    timers.push(window.setTimeout(() => setPhase(0), 0))
    timers.push(window.setTimeout(() => setPhase(1), 350))
    timers.push(window.setTimeout(() => setPhase(2), 1150))
    timers.push(window.setTimeout(() => setPhase(3), 1450))

    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [playKey, isStatic])

  const currentPhase = isStatic ? 3 : phase
  const isConfirmed = currentPhase >= 3

  return (
    <div className="relative flex h-full w-full items-center justify-between gap-2 overflow-hidden px-1">
      <div className="flex items-center gap-2.5">
        <AgentStickerAvatar
          role="team"
          state={isConfirmed ? "success" : "nudge"}
          size={36}
          interactive={false}
        />
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold transition-colors duration-300",
              isConfirmed
                ? "bg-success-subtle text-text-success"
                : "bg-warning-subtle text-text-warning"
            )}
          >
            {isConfirmed && <Check className="size-3" />}
            {isConfirmed ? "CONFIRMED" : "AI DRAFT · PROPOSED"}
          </span>
          <span className="font-sans text-xs text-ink-secondary">
            DEC-14 · JWT + refresh token
          </span>
        </div>
      </div>

      <motion.div
        animate={currentPhase === 2 ? { scale: [1, 0.95, 1] } : { scale: 1 }}
        transition={{ duration: 0.25, ease: EASE }}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-medium transition-colors duration-300",
          isConfirmed
            ? "border border-line-subtle bg-surface-card text-text-success"
            : "bg-brand text-on-brand shadow-primary"
        )}
      >
        <Check className="size-3.5" />
        <span>{isConfirmed ? "Disetujui" : "Konfirmasi"}</span>
      </motion.div>

      {/* Rani's cursor demonstrating human confirmation */}
      {!isStatic && (
        <motion.div
          initial={{ left: "86%", top: "92%", opacity: 0 }}
          animate={
            currentPhase === 1 || currentPhase === 2
              ? { left: "78%", top: "54%", opacity: 1 }
              : currentPhase === 3
                ? { left: "78%", top: "54%", opacity: 0 }
                : { left: "86%", top: "92%", opacity: 0 }
          }
          transition={{ duration: 0.65, ease: EASE }}
          className="pointer-events-none absolute z-10"
        >
          <Cursor>
            <CursorPointer className="text-ink-link" />
            <CursorBody className="border border-line-subtle bg-surface-raised text-ink-primary shadow-raised">
              <CursorName>Rani</CursorName>
            </CursorBody>
          </Cursor>
        </motion.div>
      )}
    </div>
  )
}
