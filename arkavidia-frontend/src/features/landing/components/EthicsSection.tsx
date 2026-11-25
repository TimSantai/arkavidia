import { Check, EyeOff, Lock, ShieldCheck } from "lucide-react"
import { ETHICS_GUARDRAILS, type EthicsGuardrail } from "../landingData"

function GuardrailMicroVisual({ id }: { id: EthicsGuardrail["id"] }) {
  switch (id) {
    case "no-override":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-subtle bg-canvas/70 px-3 py-2.5">
          <span className="rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
            AI DRAFT: PROPOSED
          </span>
          <span className="font-mono text-xs text-ink-tertiary">→</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-on-brand">
            <Check className="size-3" />
            Rani: Konfirmasi
          </span>
        </div>
      )
    case "no-leak":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-subtle bg-canvas/70 px-3 py-2.5">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-error line-through">
            <Lock className="size-3" />
            0812-3456-7890
          </span>
          <span className="font-mono text-xs text-ink-tertiary">→</span>
          <span className="rounded bg-success-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-text-success">
            [PHONE REDACTED]
          </span>
        </div>
      )
    case "no-grading":
      return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line-subtle bg-canvas/70 px-3 py-2.5">
          <div className="flex flex-1 items-center gap-2">
            <span className="font-mono text-[11px] font-medium tabular-nums text-ink-primary">
              P(L) 0.78
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[78%] rounded-full bg-success" />
            </div>
          </div>
          <span className="rounded-full bg-error-subtle px-2 py-0.5 font-mono text-[10px] text-text-error line-through">
            NILAI A/B/C
          </span>
        </div>
      )
    case "no-surveillance":
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-line-subtle bg-canvas/70 px-2.5 py-2 font-mono text-[10px] text-ink-secondary">
            <EyeOff className="size-3 text-text-error" />
            <span>P(L) Individu: Terkunci</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-line-subtle bg-canvas/70 px-2.5 py-2 font-mono text-[10px] text-text-info">
            <ShieldCheck className="size-3" />
            <span>Dosen: Agregat Tim</span>
          </div>
        </div>
      )
  }
}

export function EthicsSection() {
  return (
    <section id="privasi-etika" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <p className="font-sans text-xs font-semibold tracking-wider text-ink-tertiary uppercase">
          Privasi &amp; Etika • UU PDP No. 27/2022
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
          Apa yang Sengaja TIDAK Dilakukan AI
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Prinsip utama:{" "}
          <span className="font-medium text-ink-primary">
            AI mengusulkan, manusia memutuskan.
          </span>{" "}
          Keamanan psikologis mahasiswa dijaga langsung di level database &amp; policy engine.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        {ETHICS_GUARDRAILS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-line-subtle bg-surface p-5 shadow-surface"
          >
            <GuardrailMicroVisual id={item.id} />

            <div>
              <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[10px] font-medium text-ink-tertiary">
                {item.badge}
              </span>
              <h3 className="mt-2 font-heading text-base font-semibold text-ink-primary">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary text-pretty">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
