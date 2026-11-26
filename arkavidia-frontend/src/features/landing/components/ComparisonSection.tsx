import { Check, GripVertical, Lock, ShieldAlert, X } from "lucide-react"
import {
  Comparison,
  ComparisonHandle,
  ComparisonItem,
} from "@/components/kibo-ui/comparison"
import { EMPIRICAL_STATS } from "../landingData"
import { BrandLogo } from "./BrandLogos"

export function ComparisonSection() {
  return (
    <section id="perbedaan" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <p className="font-sans text-xs font-semibold tracking-wider text-ink-tertiary uppercase">
          Mengapa BERSAMA
        </p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
          Kenapa Tidak ChatGPT atau Notion Saja?
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Geser pembanding di bawah untuk melihat beda alur chat generik yang berhenti di hasil rapat dibanding workspace yang memvalidasi pemahaman.
        </p>
      </div>

      {/* Interactive Kibo UI Before/After Slider */}
      <div className="mx-auto mt-8 max-w-5xl">
        <Comparison
          mode="drag"
          className="h-[370px] rounded-2xl border border-line-subtle bg-surface shadow-raised sm:h-[340px]"
        >
          <ComparisonItem position="right" className="bg-surface p-5 sm:p-7">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2.5 text-ink-primary">
                  <BrandLogo brandId="chatgpt" size={16} />
                  <BrandLogo brandId="gemini" size={16} />
                  <BrandLogo brandId="notion" size={16} />
                  <span className="font-heading text-sm font-semibold text-ink-primary">
                    ChatGPT / Gemini / Notion AI
                  </span>
                </div>
                <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-sans text-[11px] font-medium text-ink-tertiary">
                  Fokus: Apa yang diputuskan
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line-subtle bg-canvas/70 p-3.5">
                  <p className="font-sans text-[11px] font-medium text-ink-tertiary">
                    Ringkasan Chat Otomatis
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                    &ldquo;Tim sepakat pakai JWT. Task beres.&rdquo; Semua anggota membalas &ldquo;Oke sip&rdquo; tanpa diuji apakah paham alasannya.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-line-subtle bg-canvas/70 p-3.5">
                  <div className="flex items-center gap-2 text-xs text-text-error">
                    <X className="size-3.5 shrink-0" />
                    <span>Catatan pribadi rawan tercampur di thread tim</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-error">
                    <X className="size-3.5 shrink-0" />
                    <span>LLM tetap menebak skor meski ragu</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-error">
                    <X className="size-3.5 shrink-0" />
                    <span>Silo pengetahuan baru ketahuan saat demo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between font-sans text-xs text-ink-tertiary">
                <span>Bus Factor: Tidak Terukur</span>
                <span>← Geser ke kiri</span>
              </div>
            </div>
          </ComparisonItem>

          <ComparisonItem position="left" className="bg-surface p-5 sm:p-7">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-md bg-brand font-heading text-xs font-semibold text-on-brand">
                    B
                  </span>
                  <span className="font-heading text-sm font-semibold text-ink-primary">
                    BERSAMA v2 Workspace
                  </span>
                </div>
                <span className="rounded-full bg-success-subtle px-2.5 py-0.5 font-sans text-[11px] font-medium text-text-success">
                  Fokus: Kenapa diputuskan
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line-subtle bg-canvas/70 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold text-ink-primary">
                      DEC-02 • CONFIRMED
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[10px] text-text-info">
                      <Lock className="size-2.5" />
                      M1 ISOLATED
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                    Keputusan JWT dicatat beserta alternatif yang ditolak, diproteksi Postgres RLS + Cedar Policy.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-line-subtle bg-canvas/70 p-3.5">
                  <div className="flex items-center gap-2 text-xs text-text-success">
                    <Check className="size-3.5 shrink-0" />
                    <span>IFC M1 → Context Passport → M2 bebas bocor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-success">
                    <Check className="size-3.5 shrink-0" />
                    <span>Conformal Abstain meneruskan ke rekan tim</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-success">
                    <Check className="size-3.5 shrink-0" />
                    <span>Bus Factor &amp; pairing 10 menit terukur</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between font-sans text-xs font-medium text-ink-link">
                <span className="inline-flex items-center gap-1">
                  <ShieldAlert className="size-3.5" />
                  IFC Zero-Leak • IRT 2PL
                </span>
                <span>Geser ke kanan →</span>
              </div>
            </div>
          </ComparisonItem>

          <ComparisonHandle>
            <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-brand" />
            <div className="z-50 flex size-8 items-center justify-center rounded-full border border-line-subtle bg-surface text-ink-primary shadow-raised">
              <GripVertical className="size-4" />
            </div>
          </ComparisonHandle>
        </Comparison>
      </div>

      {/* Visual Empirical Spark Cards */}
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
        {EMPIRICAL_STATS.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col justify-between gap-3 rounded-xl border border-line-subtle bg-surface p-4 shadow-surface"
          >
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-ink-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary text-pretty">
                {stat.description}
              </p>
            </div>

            <div className="space-y-1.5 border-t border-line-subtle pt-2.5">
              <div className="flex items-center gap-2 font-sans text-[11px] text-ink-tertiary">
                <span className="w-24 truncate">{stat.barLabelA}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-ink-tertiary"
                    style={{ width: `${stat.barPercentA}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 font-sans text-[11px] font-medium text-ink-primary">
                <span className="w-24 truncate">{stat.barLabelB}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${stat.barPercentB}%` }}
                  />
                </div>
              </div>
              <p className="pt-0.5 font-sans text-[11px] text-ink-tertiary">
                {stat.citation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
