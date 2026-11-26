import { useRef, useState } from "react"
import { Link } from "react-router"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { ArrowRight } from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { useTheme } from "@/components/theme/useTheme"
import { MagnetLines } from "@/components/ui/magnet-lines"
import { CLOSING_CONTENT } from "../landingData"
import { HeroAgentStage3D } from "./closing/HeroAgentStage3D"
import { PixelHeart } from "./closing/PixelHeart"
import { useTilt } from "./closing/useTilt"

const EASE = [0.2, 0.8, 0.2, 1] as const

export function LandingFooterCta() {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme !== "dark"
  const sectionRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })
  const hasEntered = useInView(sectionRef, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotion() ?? false
  const [ctaHovered, setCtaHovered] = useState(false)

  const { rotateX, rotateY } = useTilt(sectionRef, {
    max: 12,
    active: isInView,
  })

  const fadeUp = (delay: number) =>
    prefersReducedMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: hasEntered ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.6, delay, ease: EASE },
        }

  return (
    <footer
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[#e4ecfb] pt-28 text-ink-primary sm:pt-36 lg:pt-40 dark:border-white/10"
      style={{
        background: isLight
          ? "radial-gradient(58% 68% at 14% 84%, rgb(198 218 255 / 0.42) 0%, transparent 72%), radial-gradient(52% 62% at 88% 22%, rgb(252 233 194 / 0.44) 0%, rgb(255 228 224 / 0.16) 45%, transparent 74%), radial-gradient(48% 52% at 52% 0%, rgb(225 236 255 / 0.32) 0%, transparent 70%), linear-gradient(to bottom, #ffffff 0%, #f8fbff 100%)"
          : "radial-gradient(58% 68% at 14% 84%, rgb(71 132 255 / 0.16) 0%, transparent 72%), radial-gradient(52% 62% at 88% 22%, rgb(197 155 55 / 0.12) 0%, transparent 74%), linear-gradient(to bottom, #16181d 0%, #141518 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-50 dark:opacity-55"
      >
        <MagnetLines
          lineColor={isLight ? "#bec0c5" : "#717479"}
          accentColor={isLight ? "#2d6ae7" : "#6ea0ff"}
          spacing={22}
          lineWidth={1.5}
          lineHeight={13}
          mode="dipole"
          shape="line"
          radius={240}
          fade={0.65}
          edgeFade={0.28}
          stretch={0.5}
          idle
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Solo 3D Hero BoopFace helping the 4 teammates */}
          <div className="flex justify-center lg:-ml-8 lg:justify-start">
            <HeroAgentStage3D
              rotateX={rotateX}
              rotateY={rotateY}
              active={isInView}
              reducedMotion={prefersReducedMotion}
              ctaHovered={ctaHovered}
            />
          </div>

          {/* Right: Closing CTA */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.h2
              {...fadeUp(0.08)}
              className="font-display pb-[0.06em] text-[3rem] leading-[0.94] font-semibold tracking-[-0.045em] text-balance sm:text-7xl lg:text-[5.25rem]"
              style={{
                background: isLight
                  ? "linear-gradient(to right bottom, #141518 34%, #1e315c 72%, #2d6ae7 100%)"
                  : "linear-gradient(to right bottom, #ffffff 38%, #c6daff 74%, #fce9c2 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {CLOSING_CONTENT.title}
            </motion.h2>

            <motion.p
              {...fadeUp(0.16)}
              className="mt-5 max-w-[440px] font-sans text-lg leading-relaxed text-ink-secondary text-pretty"
            >
              {CLOSING_CONTENT.subtitle}
            </motion.p>

            <motion.div
              {...fadeUp(0.24)}
              className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                to={CLOSING_CONTENT.primaryCta.to}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                onFocus={() => setCtaHovered(true)}
                onBlur={() => setCtaHovered(false)}
                className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-7 font-sans text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
              >
                <span>{CLOSING_CONTENT.primaryCta.label}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <a
                href={CLOSING_CONTENT.secondaryCta.href}
                target="_blank"
                rel="noreferrer"
                aria-label="Repositori BERSAMA di GitHub"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#dce7fb] bg-white/90 px-6 font-sans text-sm font-medium text-ink-primary shadow-[0_4px_14px_-8px_rgb(29_30_33/0.12)] backdrop-blur-sm transition-[background-color,border-color,transform] duration-150 hover:border-[#c6daff] hover:bg-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/15"
              >
                <SiGithub size={16} color="currentColor" aria-hidden="true" />
                <span>{CLOSING_CONTENT.secondaryCta.label}</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Single-row footer bar */}
        <div className="mt-24 flex flex-col items-center justify-between gap-5 border-t border-[#e4ecfb] py-8 text-center font-sans text-[13px] sm:mt-32 sm:flex-row sm:text-left dark:border-white/10">
          <p className="text-ink-tertiary">{CLOSING_CONTENT.copyright}</p>

          <div className="flex items-center gap-5">
            {CLOSING_CONTENT.legal.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-ink-tertiary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {item.label}
              </a>
            ))}
            <a
              href={CLOSING_CONTENT.secondaryCta.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Repositori BERSAMA di GitHub"
              className="text-ink-tertiary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <SiGithub size={18} color="currentColor" aria-hidden="true" />
            </a>
          </div>

          <p className="inline-flex items-center gap-1.5 text-ink-tertiary">
            <span>{CLOSING_CONTENT.madeWithPrefix}</span>
            <PixelHeart className="shrink-0" />
            <span>{CLOSING_CONTENT.madeWithSuffix}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
