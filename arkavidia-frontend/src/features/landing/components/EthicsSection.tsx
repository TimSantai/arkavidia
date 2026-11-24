import { EyeOff, GraduationCap, Lock, UserCheck } from "lucide-react"
import { ETHICS_GUARDRAILS, type EthicsGuardrail } from "../landingData"

function GuardrailIcon({ id }: { id: EthicsGuardrail["id"] }) {
  switch (id) {
    case "no-override":
      return <UserCheck className="size-4 text-ink-primary" />
    case "no-leak":
      return <Lock className="size-4 text-ink-primary" />
    case "no-grading":
      return <GraduationCap className="size-4 text-ink-primary" />
    case "no-surveillance":
      return <EyeOff className="size-4 text-ink-primary" />
  }
}

export function EthicsSection() {
  return (
    <section id="privasi-etika" className="scroll-mt-20 py-14 sm:py-16">
      <div className="max-w-2xl space-y-2.5">
        <p className="font-mono text-xs font-medium tracking-wide text-ink-tertiary">
          PRIVASI &amp; ETIKA • UU PDP NO. 27/2022
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
          Apa yang Sengaja TIDAK Dilakukan AI
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Prinsip keras BERSAMA adalah{" "}
          <span className="font-medium text-ink-primary">
            AI mengusulkan, manusia memutuskan.
          </span>{" "}
          Keamanan psikologis mahasiswa dijaga langsung di arsitektur database dan policy engine.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ETHICS_GUARDRAILS.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-line-subtle bg-surface p-5 shadow-surface"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-line-subtle bg-canvas">
                <GuardrailIcon id={item.id} />
              </span>
              <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-tertiary">
                {item.badge}
              </span>
            </div>

            <h3 className="mt-3.5 font-heading text-base font-medium text-ink-primary">
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary text-pretty">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-line-subtle bg-surface px-4 py-3.5 text-xs shadow-surface sm:flex-row sm:items-center sm:px-5 sm:text-sm">
        <div className="flex flex-wrap items-center gap-2 text-ink-secondary">
          <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-primary">
            M1 Privat &amp; Skor P(L) Individu
          </span>
          <span>→ Pemilik saja (terenkripsi, hak hapus UU PDP)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-ink-secondary">
          <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-info">
            Metrik Agregat
          </span>
          <span>→ Tim &amp; Dosen (Coverage, Bus Factor, Gini)</span>
        </div>
      </div>
    </section>
  )
}
