import type { ComponentType } from "react"
import { cn } from "@/lib/utils"
import type { EthicsGuardrail } from "../../landingData"
import { useScenePlayback } from "./useScenePlayback"

export interface GuardrailSceneProps {
  readonly playKey: number
  readonly isStatic: boolean
}

const CARD_HINT_BLOBS = [
  "bg-[#9fc1ff] dark:bg-[#4784ff]",
  "bg-[#c4b3ff] dark:bg-[#9669f8]",
  "bg-[#f1d69b] dark:bg-[#c59b37]",
  "bg-[#73cdf8] dark:bg-[#3dafe0]",
] as const

export function GuardrailCard({
  guardrail,
  index,
  Scene,
}: {
  readonly guardrail: EthicsGuardrail
  readonly index: number
  readonly Scene: ComponentType<GuardrailSceneProps>
}) {
  const { ref, playKey, replay, isStatic } = useScenePlayback({ index })
  const blobColor = CARD_HINT_BLOBS[index % CARD_HINT_BLOBS.length]

  return (
    <article
      ref={ref}
      tabIndex={0}
      aria-label={guardrail.title}
      onMouseEnter={replay}
      onFocus={replay}
      className="group/card relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-[#dce7fb] bg-gradient-to-b from-white to-[#f7faff] p-5 shadow-[0_4px_16px_-10px_rgb(29_30_33/0.08)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#c6daff] hover:shadow-[0_10px_24px_-14px_rgb(26_81_196/0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-6 dark:border-[#4784ff]/20 dark:from-[#161c2e] dark:to-[#131826] dark:shadow-card dark:hover:border-[#4784ff]/35"
    >
      {/* Subtle pastel corner tint matching Weekly Cycle cards */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-20 -right-14 size-[220px] rounded-full opacity-22 blur-[84px] transition-opacity duration-200 group-hover/card:opacity-34 dark:opacity-16 dark:group-hover/card:opacity-26",
          blobColor
        )}
      />

      {/* Animated guardrail demonstration stage */}
      <div
        aria-hidden="true"
        className="relative z-10 flex h-[128px] w-full items-center overflow-hidden rounded-2xl border border-[#e4ecfb] bg-white/90 p-3.5 shadow-[0_4px_14px_-10px_rgb(29_30_33/0.08)] dark:border-white/10 dark:bg-[#1e263b]"
      >
        <Scene playKey={playKey} isStatic={isStatic} />
      </div>

      <div className="relative z-10 space-y-1.5">
        <h3 className="font-sans text-[17px] leading-snug font-semibold text-ink-primary">
          {guardrail.title}
        </h3>

        <p className="font-sans text-sm leading-relaxed text-ink-secondary text-pretty">
          {guardrail.description}
        </p>
      </div>
    </article>
  )
}
