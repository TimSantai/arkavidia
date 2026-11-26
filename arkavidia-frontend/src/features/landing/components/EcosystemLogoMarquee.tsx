import { useState } from "react"
import { Pause, Play } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import type { EcosystemBrandId } from "../landingData"
import { BrandLogo } from "./BrandLogos"

const ECOSYSTEM_BRANDS: readonly {
  readonly id: EcosystemBrandId
  readonly name: string
  readonly role: string
}[] = [
  { id: "chatgpt", name: "ChatGPT", role: "LLM Gateway" },
  { id: "claude", name: "Claude", role: "Reasoning & Grader" },
  { id: "gemini", name: "Gemini", role: "Fast Extraction" },
  { id: "notion", name: "Notion", role: "Docs Alternatif" },
  { id: "whatsapp", name: "WhatsApp", role: "Import Chat Tim" },
  { id: "github", name: "GitHub", role: "Repo & Decisions" },
  { id: "postgresql", name: "PostgreSQL", role: "Hybrid Retrieval" },
  { id: "supabase", name: "Supabase", role: "IFC RLS Lapis 1" },
  { id: "fastapi", name: "FastAPI", role: "AI Orchestrator" },
]

export function EcosystemLogoMarquee() {
  const prefersReducedMotion = useReducedMotion()
  const [isPaused, setIsPaused] = useState(false)
  const shouldAnimate = !prefersReducedMotion && !isPaused
  const repeatedBrands = shouldAnimate
    ? [...ECOSYSTEM_BRANDS, ...ECOSYSTEM_BRANDS]
    : ECOSYSTEM_BRANDS

  return (
    <section
      aria-label="Ekosistem dan arsitektur pendukung BERSAMA"
      className="py-10 sm:py-12"
    >
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-center">
        <p className="font-sans text-xs font-medium text-ink-secondary">
          Terhubung dengan alur kerja &amp; infrastruktur AI tim mahasiswa
        </p>
        {!prefersReducedMotion && (
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={
              isPaused ? "Lanjutkan animasi ekosistem" : "Jeda animasi ekosistem"
            }
            aria-pressed={isPaused}
            className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-line-subtle bg-surface-card px-2.5 py-0.5 font-sans text-xs font-medium text-ink-secondary shadow-control transition-[border-color,color] duration-150 hover:border-line-default hover:text-ink-primary active:scale-[0.97]"
          >
            {isPaused ? (
              <>
                <Play className="size-3" aria-hidden="true" />
                <span>Putar</span>
              </>
            ) : (
              <>
                <Pause className="size-3" aria-hidden="true" />
                <span>Jeda</span>
              </>
            )}
          </button>
        )}
      </div>

      <div
        className="relative mt-5 overflow-hidden py-1"
        style={
          shouldAnimate
            ? {
                maskImage:
                  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              }
            : undefined
        }
      >
        <motion.div
          className={
            shouldAnimate
              ? "flex w-max items-center gap-3"
              : "flex flex-wrap items-center justify-center gap-2.5"
          }
          animate={shouldAnimate ? { x: ["0%", "-50%"] } : { x: 0 }}
          transition={
            shouldAnimate
              ? {
                  duration: 32,
                  ease: "linear",
                  repeat: Infinity,
                }
              : { duration: 0.2 }
          }
        >
          {repeatedBrands.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-line-subtle bg-surface-card px-4 py-2 text-ink-primary shadow-card"
            >
              <BrandLogo
                brandId={brand.id}
                size={16}
                className="text-ink-primary"
              />
              <span className="font-sans text-xs font-medium whitespace-nowrap">
                {brand.name}
              </span>
              <span className="hidden font-sans text-xs text-ink-tertiary sm:inline">
                · {brand.role}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
