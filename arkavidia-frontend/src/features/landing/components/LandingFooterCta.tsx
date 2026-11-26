import { useRef } from "react"
import { Link } from "react-router"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { ArrowRight } from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { CLOSING_CONTENT } from "../landingData"
import { CycleClock3D } from "./closing/CycleClock3D"
import { LightBeams } from "./closing/LightBeams"
import { PixelHeart } from "./closing/PixelHeart"
import { useTilt } from "./closing/useTilt"

const EASE = [0.2, 0.8, 0.2, 1] as const

export function LandingFooterCta() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })
  const hasEntered = useInView(sectionRef, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotion() ?? false

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
      className="relative overflow-hidden bg-[#0c0d0f] pt-28 text-[#f4f6f9] sm:pt-36 lg:pt-40"
    >
      <LightBeams
        rotateY={rotateY}
        active={hasEntered}
        reducedMotion={prefersReducedMotion}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: 3D Weekly Cycle Clock */}
          <div className="flex justify-center lg:-ml-12 lg:justify-start">
            <CycleClock3D
              rotateX={rotateX}
              rotateY={rotateY}
              active={isInView}
              reducedMotion={prefersReducedMotion}
            />
          </div>

          {/* Right: Closing CTA */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.h2
              {...fadeUp(0.08)}
              className="font-display text-[3rem] leading-[0.92] font-medium tracking-[-0.045em] text-balance sm:text-7xl lg:text-[5.25rem]"
              style={{
                background:
                  "linear-gradient(to right bottom, #ffffff 35%, #c6daff 72%, #fce9c2)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {CLOSING_CONTENT.title}
            </motion.h2>

            <motion.p
              {...fadeUp(0.16)}
              className="mt-6 max-w-[440px] font-sans text-lg leading-relaxed text-[#9fa2a7] text-pretty"
            >
              {CLOSING_CONTENT.subtitle}
            </motion.p>

            <motion.div
              {...fadeUp(0.24)}
              className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                to={CLOSING_CONTENT.primaryCta.to}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 font-sans text-sm font-medium text-[#1d1e21] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_0_32px_-6px_rgb(224_187_108/0.7)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-[#f4f6f9] hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_0_40px_-4px_rgb(241_214_155/0.88)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ea0ff] sm:w-auto"
              >
                <span>{CLOSING_CONTENT.primaryCta.label}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <a
                href={CLOSING_CONTENT.secondaryCta.href}
                target="_blank"
                rel="noreferrer"
                aria-label="Repositori BERSAMA di GitHub"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1d1e21] px-6 font-sans text-sm font-medium text-[#e9ebef] transition-[background-color,border-color,transform] duration-150 hover:border-white/25 hover:bg-[#28292d] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ea0ff] sm:w-auto"
              >
                <SiGithub size={16} color="currentColor" aria-hidden="true" />
                <span>{CLOSING_CONTENT.secondaryCta.label}</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Single-row footer bar */}
        <div className="mt-24 flex flex-col items-center justify-between gap-5 border-t border-white/[0.06] py-8 text-center font-sans text-[13px] sm:mt-32 sm:flex-row sm:text-left">
          <p className="text-[#9fa2a7]">{CLOSING_CONTENT.copyright}</p>

          <div className="flex items-center gap-5">
            {CLOSING_CONTENT.legal.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#9fa2a7] transition-colors duration-150 hover:text-[#e9ebef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ea0ff]"
              >
                {item.label}
              </a>
            ))}
            <a
              href={CLOSING_CONTENT.secondaryCta.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Repositori BERSAMA di GitHub"
              className="text-[#9fa2a7] transition-colors duration-150 hover:text-[#e9ebef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ea0ff]"
            >
              <SiGithub size={18} color="currentColor" aria-hidden="true" />
            </a>
          </div>

          <p className="inline-flex items-center gap-1.5 text-[#9fa2a7]">
            <span>{CLOSING_CONTENT.madeWithPrefix}</span>
            <PixelHeart className="shrink-0" />
            <span>{CLOSING_CONTENT.madeWithSuffix}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
