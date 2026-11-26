import { Link } from "react-router"
import { ArrowRight, ShieldCheck } from "lucide-react"
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
        {/* Centered team-brain.com / Campsite style Hero */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center space-y-5 text-center">
            <Announcement className="border-line-subtle bg-surface text-ink-secondary shadow-surface">
              <AnnouncementTag className="bg-brand/10 font-sans text-[11px] font-semibold tracking-wide text-ink-link">
                HACKVIDIA 11.0
              </AnnouncementTag>
              <AnnouncementTitle className="gap-1.5 font-sans text-xs">
                <ShieldCheck className="size-3.5 text-ink-link" aria-hidden="true" />
                <span>AI for Learning &amp; Self-Growth</span>
              </AnnouncementTitle>
            </Announcement>

            <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-ink-primary text-balance sm:text-5xl lg:text-[3.5rem]">
              Satu tim, semua paham.
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-ink-secondary text-pretty sm:text-lg">
              ChatGPT membantu tim tahu <em>apa yang diputuskan</em>.{" "}
              <strong className="font-semibold text-ink-primary">BERSAMA</strong>{" "}
              memastikan setiap anggota bisa menjelaskan <em>kenapa</em>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
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

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <AvatarStack size={26}>
                {DEMO_TEAM_MEMBERS.map((member) => (
                  <Avatar key={member.id}>
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback className="text-[10px]">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarStack>
              <span className="font-sans text-xs font-medium text-ink-tertiary">
                Skenario IF2210 PBO • ≤ 5 mnt/minggu • IFC Zero-Leak
              </span>
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
