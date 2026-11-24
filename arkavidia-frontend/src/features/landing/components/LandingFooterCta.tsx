import { Link } from "react-router"
import { ArrowRight, ExternalLink } from "lucide-react"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DEMO_TEAM_MEMBERS } from "../landingData"

export function LandingFooterCta() {
  return (
    <footer className="pb-10 pt-6 sm:pb-12">
      <div className="mx-auto max-w-5xl rounded-2xl border border-line-subtle bg-surface p-6 shadow-raised sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <AvatarStack size={36}>
                {DEMO_TEAM_MEMBERS.map((member) => (
                  <Avatar key={member.id}>
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback className="border border-line-subtle bg-canvas text-xs font-medium text-ink-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarStack>
              <span className="text-xs font-medium text-ink-secondary">
                Skenario demo siap pakai: Rani, Dimas, Budi &amp; Sari
              </span>
            </div>

            <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
              Lihat bagaimana satu tim benar-benar saling paham.
            </h2>

            <p className="text-sm leading-relaxed text-ink-secondary text-pretty">
              Masuk langsung ke demo IF2210 PBO untuk menguji IFC Block M1→M2, Context Passport PII, Explain-Back, dan Peta Pemahaman tim.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap lg:justify-end">
            <Button
              size="lg"
              className="gap-2 bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
              asChild
            >
              <Link to="/teams/team-pbo-01/chat">
                Masuk Demo Ruang Tim
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/teams">Pilih Ruang Tim</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col items-start justify-between gap-4 border-t border-line-subtle pt-6 text-xs text-ink-tertiary sm:flex-row sm:items-center">
        <p>
          BERSAMA v2.0 — Hackvidia, Arkavidia 11.0 (HMIF ITB) • AI for Learning &amp; Self-Growth
        </p>
        <a
          href="https://github.com/TimSantai/arkavidia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary"
        >
          TimSantai/arkavidia
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </footer>
  )
}
