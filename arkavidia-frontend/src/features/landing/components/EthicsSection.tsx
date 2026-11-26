import { ArrowRight, Check, EyeOff, HelpCircle, Lock, ShieldCheck } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ETHICS_GUARDRAILS, type EthicsGuardrail } from "../landingData"

function GuardrailMicroVisual({ id }: { id: EthicsGuardrail["id"] }) {
  switch (id) {
    case "no-override":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-subtle bg-wash-brand px-3 py-2.5">
          <span className="rounded-full border border-line-subtle bg-surface-card px-2.5 py-0.5 font-sans text-xs font-medium text-ink-secondary">
            Usulan AI
          </span>
          <ArrowRight className="size-3.5 text-ink-tertiary" aria-hidden="true" />
          <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-on-brand">
            <Check className="size-3.5" aria-hidden="true" />
            Rani: Konfirmasi
          </span>
        </div>
      )
    case "no-leak":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-subtle bg-wash-brand px-3 py-2">
          <div className="flex items-center gap-2">
            <AgentStickerAvatar
              role="private"
              size={28}
              interactive={false}
            />
            <span className="inline-flex items-center gap-1 font-sans text-xs tabular-nums text-text-error line-through">
              <Lock className="size-3.5" aria-hidden="true" />
              0812-3456-7890
            </span>
          </div>
          <ArrowRight className="size-3.5 text-ink-tertiary" aria-hidden="true" />
          <span className="rounded-md bg-success-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-success">
            [Phone Redacted]
          </span>
        </div>
      )
    case "no-grading":
      return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-subtle bg-wash-brand px-3 py-2.5">
          <div className="flex flex-1 items-center gap-2">
            <span className="font-sans text-xs font-semibold tabular-nums text-ink-primary">
              P(L) 0.78
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-card">
              <div className="h-full w-[78%] rounded-full bg-success" />
            </div>
          </div>
          <span className="rounded-full bg-error-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-error line-through">
            Nilai A/B/C
          </span>
        </div>
      )
    case "no-surveillance":
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-line-subtle bg-surface px-2.5 py-2 font-sans text-xs text-ink-secondary">
            <EyeOff
              className="size-3.5 shrink-0 text-text-error"
              aria-hidden="true"
            />
            <span className="truncate">Skor Individu: Terkunci</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-brand-subtle bg-wash-brand px-2.5 py-2 font-sans text-xs font-medium text-ink-link">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Dosen: Agregat Tim</span>
          </div>
        </div>
      )
  }
}

export function EthicsSection() {
  return (
    <section id="privasi-etika" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
            Apa yang Sengaja{" "}
            <span className="font-display-oblique text-ink-link">TIDAK</span>{" "}
            Dilakukan AI
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Detail kepatuhan privasi UU PDP"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface-card text-ink-secondary shadow-control transition-colors duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <HelpCircle className="size-4" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-80 text-left">
              <PopoverHeader>
                <PopoverTitle>Kepatuhan UU PDP No. 27/2022</PopoverTitle>
                <PopoverDescription>
                  Pemisahan memori M1/M2 ditegakkan lewat Postgres RLS, Cedar
                  Policy engine, serta persetujuan eksplisit sebelum pemrosesan
                  data pembelajaran.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
          Prinsip utama:{" "}
          <span className="font-medium text-ink-primary">
            AI mengusulkan, manusia memutuskan.
          </span>
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        {ETHICS_GUARDRAILS.map((item) => (
          <Card key={item.id} className="rounded-2xl py-5">
            <CardContent className="flex flex-1 flex-col justify-between gap-4 px-5">
              <GuardrailMicroVisual id={item.id} />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-line-subtle bg-surface px-2.5 py-0.5 font-sans text-xs font-medium text-ink-secondary">
                    {item.badge}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Detail teknis ${item.title}`}
                        className="inline-flex size-7 items-center justify-center rounded-full border border-line-subtle bg-surface text-ink-secondary transition-colors duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <HelpCircle className="size-3.5" aria-hidden="true" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72">
                      <PopoverHeader>
                        <PopoverTitle>{item.badge}</PopoverTitle>
                        <PopoverDescription>
                          {item.technicalNote}
                        </PopoverDescription>
                      </PopoverHeader>
                    </PopoverContent>
                  </Popover>
                </div>

                <h3 className="mt-2.5 font-sans text-base font-semibold text-ink-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary text-pretty">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
