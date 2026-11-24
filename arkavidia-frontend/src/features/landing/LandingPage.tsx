import { Link } from "react-router"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComparisonSection } from "./components/ComparisonSection"
import { EthicsSection } from "./components/EthicsSection"
import { HeroInteractivePreview } from "./components/HeroInteractivePreview"
import { LandingFooterCta } from "./components/LandingFooterCta"
import { LandingHeader } from "./components/LandingHeader"
import { WeeklyCycleSection } from "./components/WeeklyCycleSection"

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-ink-primary">
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface px-3.5 py-1 text-xs font-medium text-ink-secondary shadow-surface">
              <Sparkles className="size-3.5 text-ink-link" />
              <span>Hackvidia 11.0 • AI for Learning &amp; Self-Growth</span>
            </div>

            <h1 className="font-heading text-3xl font-semibold leading-[1.12] tracking-[-0.028em] text-ink-primary text-balance sm:text-[2.625rem]">
              Satu tim, semua paham.
            </h1>

            <p className="text-base leading-relaxed text-ink-secondary text-pretty sm:text-[17px]">
              ChatGPT membantu tim tahu <em>apa yang diputuskan</em>.{" "}
              <strong className="font-semibold text-ink-primary">BERSAMA</strong>{" "}
              memastikan setiap anggota bisa menjelaskan <em>kenapa</em>. Setiap
              anggota mendapat agen pribadi terisolasi, explain-back singkat berbasis
              keputusan nyata, dan peta cakupan pemahaman tim.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                className="gap-2 bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
                asChild
              >
                <Link to="/teams/team-pbo-01/chat">
                  Buka Demo Ruang Tim
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/teams/team-pbo-01/understanding">
                  Lihat Peta Pemahaman
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-mono text-[11px] text-ink-tertiary">
              <span>≤ 5 mnt/minggu</span>
              <span aria-hidden="true">·</span>
              <span>IFC Zero-Leak M1</span>
              <span aria-hidden="true">·</span>
              <span>Bukan untuk nilai kuliah</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <HeroInteractivePreview />
          </div>
        </section>

        <ComparisonSection />
        <WeeklyCycleSection />
        <EthicsSection />
        <LandingFooterCta />
      </main>
    </div>
  )
}
