import { useRef, useState } from "react"
import { Link } from "react-router"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { ArrowRight } from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { MagnetLines } from "@/components/ui/magnet-lines"
import { CLOSING_CONTENT } from "../landingData"
import { HeroAgentStage3D } from "./closing/HeroAgentStage3D"
import { PixelHeart } from "./closing/PixelHeart"
import { useTilt } from "./closing/useTilt"

const EASE = [0.2, 0.8, 0.2, 1] as const

export function LandingFooterCta() {
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
      data-nav-theme="dark"
      className="relative overflow-hidden border-t border-[#4784ff]/20 pt-28 text-[#f1f6ff] sm:pt-36 lg:pt-40"
      style={{
        background:
          "radial-gradient(60% 70% at 18% 45%, rgb(71 132 255 / 0.26) 0%, transparent 70%), radial-gradient(45% 55% at 86% 24%, rgb(252 233 194 / 0.12) 0%, transparent 65%), linear-gradient(155deg, #001652 0%, #042a7b 52%, #0c3c9f 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-55"
      >
        <MagnetLines
          lineColor="#6ea0ff"
          accentColor="#fce9c2"
          spacing={22}
          lineWidth={1.5}
          lineHeight={13}
          mode="dipole"
          shape="line"
          radius={240}
          fade={0.65}
          edgeFade={0.25}
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
              className="font-display text-[3rem] leading-[0.92] font-medium tracking-[-0.045em] text-balance sm:text-7xl lg:text-[5.25rem]"
              style={{
                background:
                  "linear-gradient(to right bottom, #ffffff 38%, #c6daff 74%, #fce9c2 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {CLOSING_CONTENT.title}
            </motion.h2>

            <motion.p
              {...fadeUp(0.16)}
              className="mt-6 max-w-[440px] font-sans text-lg leading-relaxed text-[#c6daff] text-pretty"
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
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 font-sans text-sm font-semibold text-[#042a7b] shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_10px_32px_-6px_rgb(159_193_255/0.6)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-[#f1f6ff] hover:shadow-[inset_0_1px_0_rgb(255_255_255/1),0_14px_38px_-4px_rgb(198_218_255/0.8)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fc1ff] sm:w-auto"
              >
                <span>{CLOSING_CONTENT.primaryCta.label}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <a
                href={CLOSING_CONTENT.secondaryCta.href}
                target="_blank"
                rel="noreferrer"
                aria-label="Repositori BERSAMA di GitHub"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-sans text-sm font-medium text-white backdrop-blur-sm transition-[background-color,border-color,transform] duration-150 hover:border-white/35 hover:bg-white/18 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fc1ff] sm:w-auto"
              >
                <SiGithub size={16} color="currentColor" aria-hidden="true" />
                <span>{CLOSING_CONTENT.secondaryCta.label}</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Single-row footer bar */}
        <div className="mt-24 flex flex-col items-center justify-between gap-5 border-t border-white/12 py-8 text-center font-sans text-[13px] sm:mt-32 sm:flex-row sm:text-left">
          <p className="text-[#c6daff]/85">{CLOSING_CONTENT.copyright}</p>

          <div className="flex items-center gap-5">
            {CLOSING_CONTENT.legal.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#c6daff]/85 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fc1ff]"
              >
                {item.label}
              </a>
            ))}
            <a
              href={CLOSING_CONTENT.secondaryCta.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Repositori BERSAMA di GitHub"
              className="text-[#c6daff]/85 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fc1ff]"
            >
              <SiGithub size={18} color="currentColor" aria-hidden="true" />
            </a>
          </div>

          <p className="inline-flex items-center gap-1.5 text-[#c6daff]/85">
            <span>{CLOSING_CONTENT.madeWithPrefix}</span>
            <PixelHeart className="shrink-0" />
            <span>{CLOSING_CONTENT.madeWithSuffix}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
