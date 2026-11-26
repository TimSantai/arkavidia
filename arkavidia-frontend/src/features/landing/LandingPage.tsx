import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
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
import { HeroBackdrop } from "./components/HeroBackdrop"
import { HeroWorkspaceShowcase } from "./components/HeroWorkspaceShowcase"
import { LandingFooterCta } from "./components/LandingFooterCta"
import { LandingHeader } from "./components/LandingHeader"
import { WeeklyCycleSection } from "./components/WeeklyCycleSection"
import { DEMO_TEAM_MEMBERS, HERO_CONTENT } from "./landingData"
import "./landing.css"

const HERO_EASE = [0.2, 0.8, 0.2, 1] as const

export function LandingPage() {
  const prefersReducedMotion = useReducedMotion()

  const fadeUp = (delaySeconds: number) =>
    prefersReducedMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.6,
            delay: delaySeconds,
            ease: HERO_EASE,
          },
        }

  const windowMotion = prefersReducedMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0, scale: 1 } }
    : {
        initial: { opacity: 0, y: 40, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: 0.9,
          delay: 0.2,
          ease: HERO_EASE,
        },
      }

  return (
    <div className="landing-root min-h-screen overflow-x-clip bg-[var(--bg-page)] text-ink-primary">
      <LandingHeader />

      <main>
        {/* Full-width white hero so dawn glows extend cleanly without clipping */}
        <section className="relative overflow-x-clip pt-12 pb-12 sm:pt-20 sm:pb-16 lg:pt-24">
          <HeroBackdrop />

          <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <motion.div {...fadeUp(0)}>
                <Announcement className="border-line-subtle bg-white px-3 py-1 text-xs shadow-badge transition-shadow duration-150 dark:bg-surface-card">
                  <AnnouncementTag className="bg-[#e1ecff] px-2.5 py-0.5 font-sans text-xs font-semibold tracking-wide text-ink-link dark:bg-wash-brand">
                    {HERO_CONTENT.announcementTag}
                  </AnnouncementTag>
                  <AnnouncementTitle className="py-0.5 font-sans text-xs font-medium text-ink-secondary">
                    {HERO_CONTENT.announcementText}
                  </AnnouncementTitle>
                </Announcement>
              </motion.div>

              <motion.h1
                {...fadeUp(0.08)}
                className="font-display mt-6 max-w-[13ch] text-[2.75rem] leading-none font-semibold tracking-[-0.045em] text-[#1d1e21] text-balance sm:text-6xl lg:text-[5.25rem] dark:text-ink-primary"
              >
                {HERO_CONTENT.titleLead}{" "}
                <span className="font-display-oblique">
                  {HERO_CONTENT.titleAccent}
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.16)}
                className="mt-6 max-w-[620px] font-sans text-[17px] leading-relaxed font-normal text-ink-secondary text-pretty sm:text-xl"
              >
                {HERO_CONTENT.leadBefore}{" "}
                <em className="italic font-medium text-ink-primary">
                  {HERO_CONTENT.leadWhat}
                </em>{" "}
                {HERO_CONTENT.leadMiddle}{" "}
                <em className="italic font-medium text-ink-primary">
                  {HERO_CONTENT.leadWhy}
                </em>
                .
              </motion.p>

              <motion.div
                {...fadeUp(0.24)}
                className="mt-8 flex flex-wrap items-center justify-center gap-4"
              >
                <Button
                  asChild
                  className="btn-primary h-12 gap-2 rounded-full border-0 px-6 text-sm font-medium"
                >
                  <Link to={HERO_CONTENT.primaryCta.to}>
                    {HERO_CONTENT.primaryCta.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>

                <a
                  href={HERO_CONTENT.secondaryCta.href}
                  className="inline-flex h-12 items-center gap-1.5 rounded-full px-3 font-sans text-sm font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span>{HERO_CONTENT.secondaryCta.label}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </motion.div>

              <motion.div
                {...fadeUp(0.32)}
                className="mt-7 flex flex-wrap items-center justify-center gap-3"
              >
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

                <span className="font-sans text-[13px] font-normal text-ink-tertiary">
                  {HERO_CONTENT.socialProof}
                </span>
              </motion.div>
            </div>

            {/* Workspace window framed on two-temperature "Fajar" dawn wallpaper */}
            <motion.div
              {...windowMotion}
              className="relative mx-auto mt-14 max-w-[1140px] sm:mt-16"
            >
              {/* Centered vertical beam descending into the top edge of the workspace window */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 left-1/2 z-0 h-[420px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--beam)] to-transparent opacity-65 blur-[0.5px] sm:-top-14 dark:opacity-50"
              />
              <div className="bg-dawn grain relative z-10 rounded-[28px] border border-line-subtle p-3 sm:p-6">
                <div className="relative z-10">
                  <HeroWorkspaceShowcase />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <EcosystemLogoMarquee />
          <ComparisonSection />
          <WeeklyCycleSection />
          <EthicsSection />
          <LandingFooterCta />
        </div>
      </main>
    </div>
  )
}
