import { Link } from "react-router"
import { ArrowRight, HelpCircle, ShieldCheck } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ComparisonSection } from "./components/ComparisonSection"
import { EcosystemLogoMarquee } from "./components/EcosystemLogoMarquee"
import { EthicsSection } from "./components/EthicsSection"
import { HeroWorkspaceShowcase } from "./components/HeroWorkspaceShowcase"
import { LandingFooterCta } from "./components/LandingFooterCta"
import { LandingHeader } from "./components/LandingHeader"
import { WeeklyCycleSection } from "./components/WeeklyCycleSection"
import { DEMO_TEAM_MEMBERS } from "./landingData"

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-ink-primary">
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pt-10 pb-8 sm:pt-14 sm:pb-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center space-y-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-subtle bg-wash-brand px-3 py-1 text-xs font-medium text-ink-primary shadow-badge">
              <ShieldCheck className="size-3.5 text-ink-link" aria-hidden="true" />
              <span>Hackvidia 11.0 · AI for Learning</span>
            </div>

            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-ink-primary text-balance sm:text-5xl lg:text-[3.5rem]">
              Satu tim,{" "}
              <span className="font-display-oblique text-ink-link">
                semua paham.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-ink-secondary text-pretty sm:text-lg">
              Chat AI membantu tim tahu <em>apa</em> yang diputuskan.{" "}
              <strong className="font-semibold text-ink-primary">BERSAMA</strong>{" "}
              memastikan setiap anggota paham <em>kenapa</em>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/teams/team-pbo-01/chat">
                  Buka Demo Ruang Tim
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/teams/team-pbo-01/understanding">
                  Lihat Peta Pemahaman
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <AvatarStack size={28}>
                {DEMO_TEAM_MEMBERS.map((member) => (
                  <Avatar key={member.id}>
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback className="text-xs font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarStack>

              <div className="flex items-center -space-x-2">
                <AgentStickerAvatar role="team" size={30} />
                <AgentStickerAvatar role="private" size={30} />
                <AgentStickerAvatar role="tutor" size={30} />
              </div>

              <span className="font-sans text-xs font-medium text-ink-secondary">
                IF2210 PBO · Demo 4 mahasiswa &amp; 3 AI companion
              </span>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Info skenario demo dan standar privasi"
                    className="inline-flex size-7 items-center justify-center rounded-full border border-line-subtle bg-surface-card text-ink-secondary shadow-control transition-colors duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <HelpCircle className="size-3.5" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-80">
                  <PopoverHeader>
                    <PopoverTitle>Skenario Demo IF2210 PBO</PopoverTitle>
                    <PopoverDescription>
                      Menguji 4 alur inti: isolasi memori pribadi M1 ke M2 (IFC
                      Zero-Leak), Context Passport PII masking, Explain-Back
                      adaptif di bawah 5 menit/minggu, dan deteksi Bus Factor.
                    </PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-10 sm:mt-12">
            <HeroWorkspaceShowcase />
          </div>
        </section>

        <EcosystemLogoMarquee />
        <ComparisonSection />
        <WeeklyCycleSection />
        <EthicsSection />
        <LandingFooterCta />
      </main>
    </div>
  )
}
