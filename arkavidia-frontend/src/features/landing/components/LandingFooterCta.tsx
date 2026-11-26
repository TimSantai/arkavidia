import { Link } from "react-router"
import { ArrowRight, ExternalLink } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DEMO_TEAM_MEMBERS } from "../landingData"

export function LandingFooterCta() {
  return (
    <footer className="pt-6 pb-10 sm:pb-12">
      <Card className="mx-auto max-w-5xl rounded-2xl border-brand-subtle bg-wash-brand py-0 shadow-raised">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <AvatarStack size={36}>
                {DEMO_TEAM_MEMBERS.map((member) => (
                  <Avatar key={member.id}>
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback className="border border-line-subtle bg-surface-card text-xs font-medium text-ink-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarStack>
              <AgentStickerAvatar role="team" size={38} />
              <span className="text-xs font-medium text-ink-secondary">
                Rani, Dimas, Budi &amp; Sari · IF2210 PBO
              </span>
            </div>

            <h2 className="font-display text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
              Lihat bagaimana satu tim{" "}
              <span className="font-display-oblique text-ink-link">
                benar-benar saling paham.
              </span>
            </h2>

            <p className="text-sm leading-relaxed text-ink-secondary text-pretty">
              Uji langsung isolasi M1 ke M2, Context Passport PII, Explain-Back,
              dan Peta Pemahaman tim.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap lg:justify-end">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/teams/team-pbo-01/chat">
                Masuk Demo Ruang Tim
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/teams">Pilih Ruang Tim</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col items-start justify-between gap-4 border-t border-line-subtle pt-6 text-xs text-ink-secondary sm:flex-row sm:items-center">
        <p>
          BERSAMA v2.0 · Hackvidia, Arkavidia 11.0 (HMIF ITB) · AI for Learning
          &amp; Self-Growth
        </p>
        <a
          href="https://github.com/TimSantai/arkavidia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary"
        >
          TimSantai/arkavidia
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
