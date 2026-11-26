import { Check, GripVertical, HelpCircle, Lock, ShieldAlert, X } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import {
  Comparison,
  ComparisonHandle,
  ComparisonItem,
} from "@/components/kibo-ui/comparison"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EMPIRICAL_STATS } from "../landingData"
import { BrandLogo } from "./BrandLogos"

export function ComparisonSection() {
  return (
    <section id="perbedaan" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
          Kenapa Tidak{" "}
          <span className="font-display-oblique text-ink-link">
            ChatGPT atau Notion
          </span>{" "}
          Saja?
        </h2>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Geser pembanding untuk melihat beda chat generik dan workspace yang
          memvalidasi pemahaman tim.
        </p>
      </div>

      {/* Interactive Kibo UI Before/After Slider */}
      <div className="mx-auto mt-8 max-w-5xl">
        <Comparison
          mode="drag"
          className="h-[380px] rounded-2xl border border-line-subtle bg-surface-card shadow-raised sm:h-[340px]"
        >
          <ComparisonItem
            position="right"
            className="bg-surface-card p-5 sm:p-7"
          >
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2.5 text-ink-primary">
                  <BrandLogo brandId="chatgpt" size={16} />
                  <BrandLogo brandId="gemini" size={16} />
                  <BrandLogo brandId="notion" size={16} />
                  <span className="font-sans text-sm font-semibold text-ink-primary">
                    ChatGPT / Gemini / Notion AI
                  </span>
                </div>
                <span className="rounded-full border border-line-subtle bg-surface px-2.5 py-0.5 font-sans text-xs font-medium text-ink-secondary">
                  Fokus: Hasil Rapat
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line-subtle bg-surface p-3.5">
                  <p className="font-sans text-xs font-medium text-ink-tertiary">
                    Ringkasan Chat Otomatis
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                    &ldquo;Tim sepakat pakai JWT. Task beres.&rdquo; Semua
                    membalas &ldquo;Oke sip&rdquo; tanpa tahu alasannya.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-line-subtle bg-surface p-3.5">
                  <div className="flex items-center gap-2 text-xs text-text-error">
                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>Catatan pribadi rawan bocor ke tim</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-error">
                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>LLM menebak skor meski ragu</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-error">
                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>Silo pengetahuan ketahuan saat demo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between font-sans text-xs text-ink-secondary">
                <span>Bus Factor: Tidak Terukur</span>
                <span>Geser ke kiri</span>
              </div>
            </div>
          </ComparisonItem>

          <ComparisonItem
            position="left"
            className="bg-surface-card p-5 sm:p-7"
          >
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2 border-b border-line-subtle pb-3">
                <div className="flex items-center gap-2.5">
                  <AgentStickerAvatar
                    role="team"
                    size={30}
                    interactive={false}
                  />
                  <span className="font-sans text-sm font-semibold text-ink-primary">
                    BERSAMA Workspace
                  </span>
                </div>
                <span className="rounded-full bg-success-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-success">
                  Fokus: Kenapa Diputuskan
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-brand-subtle bg-wash-brand p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-sans text-xs font-semibold text-ink-primary">
                      DEC-02 · Confirmed
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-card px-2 py-0.5 font-sans text-xs font-medium text-ink-link">
                      <Lock className="size-3" aria-hidden="true" />
                      M1 Terisolasi
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                    Keputusan JWT tercatat beserta alternatif yang ditolak dan
                    proteksi privasi per anggota.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-line-subtle bg-surface p-3.5">
                  <div className="flex items-center gap-2 text-xs text-text-success">
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>IFC M1 ke M2 bebas bocor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-success">
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>Conformal Abstain ke rekan tim</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-success">
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>Bus Factor &amp; pairing 10 menit</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between font-sans text-xs font-medium text-ink-link">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5" aria-hidden="true" />
                  IFC Zero-Leak · IRT 2PL
                </span>
                <span>Geser ke kanan</span>
              </div>
            </div>
          </ComparisonItem>

          <ComparisonHandle>
            <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-brand" />
            <div className="z-50 flex size-8 items-center justify-center rounded-full border border-line-subtle bg-surface-raised text-ink-primary shadow-raised">
              <GripVertical className="size-4" aria-hidden="true" />
            </div>
          </ComparisonHandle>
        </Comparison>
      </div>

      {/* Visual Empirical Spark Cards */}
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
        {EMPIRICAL_STATS.map((stat) => (
          <Card key={stat.id} className="justify-between gap-3 py-4">
            <CardContent className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="kpi-hero text-2xl font-semibold text-ink-primary sm:text-3xl">
                    {stat.value}
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Sumber riset ${stat.citation}`}
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface text-ink-secondary transition-colors duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <HelpCircle className="size-3.5" aria-hidden="true" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72">
                      <PopoverHeader>
                        <PopoverTitle>{stat.citation}</PopoverTitle>
                        <PopoverDescription>
                          {stat.methodNote}
                        </PopoverDescription>
                      </PopoverHeader>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary text-pretty">
                  {stat.description}
                </p>
              </div>

              <div className="space-y-1.5 border-t border-line-subtle pt-2.5">
                <div className="flex items-center gap-2 font-sans text-xs text-ink-secondary">
                  <span className="w-28 truncate">{stat.barLabelA}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-ink-tertiary"
                      style={{ width: `${stat.barPercentA}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 font-sans text-xs font-medium text-ink-primary">
                  <span className="w-28 truncate">{stat.barLabelB}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${stat.barPercentB}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
