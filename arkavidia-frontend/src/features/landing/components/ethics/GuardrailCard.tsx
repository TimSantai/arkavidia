import type { ComponentType } from "react"
import type { EthicsGuardrail } from "../../landingData"
import { useScenePlayback } from "./useScenePlayback"

export interface GuardrailSceneProps {
  readonly playKey: number
  readonly isStatic: boolean
}

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

  return (
    <article
      ref={ref}
      tabIndex={0}
      aria-label={guardrail.title}
      onMouseEnter={replay}
      onFocus={replay}
      className="flex flex-col gap-4 rounded-2xl border border-line-subtle bg-white p-5 shadow-card transition-[border-color,box-shadow] duration-150 hover:border-line-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-6 dark:border-white/10 dark:bg-[#323337]"
    >
      {/* Animated guardrail demonstration stage */}
      <div
        aria-hidden="true"
        className="flex h-[128px] w-full items-center overflow-hidden rounded-xl border border-[#eef0f3] bg-[#f8f9fb] p-3.5 dark:border-white/10 dark:bg-[#28292d]"
      >
        <Scene playKey={playKey} isStatic={isStatic} />
      </div>

      <div className="space-y-1.5">
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
