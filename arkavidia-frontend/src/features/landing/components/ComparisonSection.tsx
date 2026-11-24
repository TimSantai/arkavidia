import { Check, Minus } from "lucide-react"
import { COMPARISON_ROWS, EMPIRICAL_STATS } from "../landingData"

export function ComparisonSection() {
  return (
    <section id="perbedaan" className="scroll-mt-20 py-14 sm:py-16">
      <div className="max-w-2xl space-y-2.5">
        <p className="font-mono text-xs font-medium tracking-wide text-ink-tertiary">
          MENGAPA BERSAMA
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
          Kenapa Tidak ChatGPT, Gemini, atau Notion Saja?
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Alat kolaborasi AI modern efisien mencatat hasil rapat dan action item, tetapi berhenti sebelum memastikan setiap mahasiswa benar-benar paham alasan di baliknya.
        </p>
      </div>

      {/* Desktop comparison table */}
      <div className="mt-8 hidden overflow-hidden rounded-xl border border-line-subtle bg-surface shadow-surface md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-subtle bg-canvas/50">
              <th className="w-[22%] px-5 py-3.5 font-mono text-xs font-medium text-ink-tertiary">
                DIMENSI
              </th>
              <th className="w-[37%] px-5 py-3.5 font-heading text-sm font-medium text-ink-secondary">
                ChatGPT / Gemini / Notion AI
              </th>
              <th className="w-[41%] bg-brand/5 px-5 py-3.5 font-heading text-sm font-semibold text-ink-primary">
                BERSAMA v2
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="px-5 py-4 font-medium text-ink-primary">
                  {row.dimension}
                </td>
                <td className="px-5 py-4 text-ink-secondary">
                  <div className="flex items-start gap-2.5">
                    <Minus className="mt-0.5 size-4 shrink-0 text-ink-tertiary" />
                    <span className="leading-relaxed text-pretty">{row.existingTools}</span>
                  </div>
                </td>
                <td className="bg-brand/5 px-5 py-4 text-ink-primary">
                  <div className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-text-success" />
                    <span className="leading-relaxed text-pretty">{row.bersama}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile comparison cards (no horizontal scroll at 375px) */}
      <div className="mt-7 space-y-3 md:hidden">
        {COMPARISON_ROWS.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-line-subtle bg-surface p-4 shadow-surface"
          >
            <h3 className="font-heading text-sm font-semibold text-ink-primary">
              {row.dimension}
            </h3>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-lg border border-line-subtle bg-canvas/60 p-3">
                <p className="font-mono text-[10px] font-medium text-ink-tertiary">
                  CHATGPT / GEMINI / NOTION AI
                </p>
                <p className="mt-1 flex items-start gap-2 text-xs leading-relaxed text-ink-secondary">
                  <Minus className="mt-0.5 size-3.5 shrink-0 text-ink-tertiary" />
                  <span>{row.existingTools}</span>
                </p>
              </div>
              <div className="rounded-lg border border-line-active/40 bg-brand/5 p-3">
                <p className="font-mono text-[10px] font-semibold text-ink-link">
                  BERSAMA V2
                </p>
                <p className="mt-1 flex items-start gap-2 text-xs leading-relaxed text-ink-primary">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-text-success" />
                  <span>{row.bersama}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empirical basis strip */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {EMPIRICAL_STATS.map((stat) => (
          <div
            key={stat.id}
            className="rounded-xl border border-line-subtle bg-surface p-4 shadow-surface"
          >
            <p className="font-mono text-xl font-semibold tabular-nums text-ink-primary">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary text-pretty">
              {stat.description}
            </p>
            <p className="mt-2 font-mono text-[11px] text-ink-tertiary">
              {stat.citation}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
