import { motion } from "motion/react"
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
  const repeatedBrands = [...ECOSYSTEM_BRANDS, ...ECOSYSTEM_BRANDS]

  return (
    <section aria-label="Ekosistem dan arsitektur pendukung BERSAMA" className="py-10 sm:py-12">
      <p className="text-center font-sans text-xs font-medium text-ink-tertiary">
        Terintegrasi dengan alur kerja &amp; infrastruktur AI tim mahasiswa
      </p>

      <div
        className="relative mt-5 overflow-hidden py-1"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          className="flex w-max items-center gap-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 32,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {repeatedBrands.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-line-subtle bg-surface px-4 py-2 text-ink-primary shadow-surface"
            >
              <BrandLogo brandId={brand.id} size={16} className="text-ink-primary" />
              <span className="font-sans text-xs font-medium whitespace-nowrap">{brand.name}</span>
              <span className="hidden font-sans text-[11px] text-ink-tertiary sm:inline">
                • {brand.role}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
