import type { ComponentType } from "react"
import { ETHICS_GUARDRAILS, type EthicsGuardrail } from "../landingData"
import { AggregateScene } from "./ethics/AggregateScene"
import { ConfirmScene } from "./ethics/ConfirmScene"
import { GuardrailCard, type GuardrailSceneProps } from "./ethics/GuardrailCard"
import { NoGradeScene } from "./ethics/NoGradeScene"
import { RedactScene } from "./ethics/RedactScene"

const SCENE_MAP: Readonly<
  Record<EthicsGuardrail["id"], ComponentType<GuardrailSceneProps>>
> = {
  "no-override": ConfirmScene,
  "no-leak": RedactScene,
  "no-grading": NoGradeScene,
  "no-surveillance": AggregateScene,
}

export function EthicsSection() {
  return (
    <section
      id="privasi"
      aria-labelledby="etika-heading"
      className="scroll-mt-24 bg-[#f4f6f9] py-24 sm:py-28 dark:bg-[#1d1e21]"
    >
      <span id="etika" className="sr-only" />
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="etika-heading"
            className="font-display text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-ink-primary text-balance sm:text-5xl"
          >
            AI mengusulkan. Kalian yang memutuskan.
          </h2>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-secondary text-pretty sm:text-lg">
            Empat hal yang sengaja tidak dilakukan AI di BERSAMA.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ETHICS_GUARDRAILS.map((guardrail, index) => (
            <GuardrailCard
              key={guardrail.id}
              guardrail={guardrail}
              index={index}
              Scene={SCENE_MAP[guardrail.id]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
