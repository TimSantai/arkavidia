import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react"
import { cn } from "@/lib/utils"

export interface FloatingNavItem {
  readonly name: string
  readonly link: string
  readonly icon: ReactNode
}

export interface FloatingNavProps {
  readonly navItems: readonly FloatingNavItem[]
  readonly className?: string
}

const NAV_EASE = [0.2, 0.8, 0.2, 1] as const

export function FloatingNav({ navItems, className }: FloatingNavProps) {
  const { scrollY } = useScroll()
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [activeHref, setActiveHref] = useState<string | null>(null)
  const [overDarkStage, setOverDarkStage] = useState(false)

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0
    const delta = current - previous

    if (current < 80) {
      setVisible(true)
      return
    }

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight
    if (current >= maxScroll - 4) {
      return
    }

    if (delta > 4) {
      setVisible(false)
    } else if (delta < -4) {
      setVisible(true)
    }
  })

  // Track active anchor section with IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined") return
    const sectionIds = navItems
      .map((item) => item.link)
      .filter((href) => href.startsWith("#"))
      .map((href) => href.slice(1))

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleEntries[0]) {
          setActiveHref(`#${visibleEntries[0].target.id}`)
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [navItems])

  // Switch glass surface to dark variant automatically when positioned over [data-nav-theme="dark"]
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkDarkStageOverlap = () => {
      const darkSections = document.querySelectorAll<HTMLElement>(
        '[data-nav-theme="dark"]'
      )
      const navProbeY = 44
      let overlaps = false
      for (const section of darkSections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= navProbeY && rect.bottom >= navProbeY) {
          overlaps = true
          break
        }
      }
      setOverDarkStage(overlaps)
    }

    checkDarkStageOverlap()
    window.addEventListener("scroll", checkDarkStageOverlap, { passive: true })
    window.addEventListener("resize", checkDarkStageOverlap, { passive: true })
    return () => {
      window.removeEventListener("scroll", checkDarkStageOverlap)
      window.removeEventListener("resize", checkDarkStageOverlap)
    }
  }, [])

  return (
    <motion.header
      initial={false}
      animate={
        visible
          ? { y: 0, opacity: 1 }
          : prefersReducedMotion
            ? { y: 0, opacity: 0 }
            : { y: "-120%", opacity: 0 }
      }
      transition={{ duration: 0.22, ease: NAV_EASE }}
      inert={!visible ? true : undefined}
      className={cn(
        "fixed inset-x-0 top-4 z-50 mx-auto w-fit max-w-[calc(100vw-24px)] sm:top-6",
        !visible && "pointer-events-none",
        className
      )}
    >
      <nav
        aria-label="Navigasi utama"
        className={cn(
          "flex items-center gap-1 rounded-full py-1.5 pr-1.5 pl-2.5 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,color,box-shadow] duration-200 sm:gap-2 sm:pl-4",
          overDarkStage
            ? "border border-white/15 bg-[#1d1e21]/65 text-[#e9ebef] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_8px_32px_-12px_rgb(0_0_0/0.6)] supports-[not(backdrop-filter:blur(1px))]:bg-[#1d1e21]/92"
            : "border border-[#1d1e21]/10 bg-white/65 text-ink-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.85),0_8px_32px_-12px_rgb(29_30_33/0.25)] supports-[not(backdrop-filter:blur(1px))]:bg-white/92 dark:border-white/15 dark:bg-[#1d1e21]/65 dark:text-[#e9ebef] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_8px_32px_-12px_rgb(0_0_0/0.6)] dark:supports-[not(backdrop-filter:blur(1px))]:bg-[#1d1e21]/92"
        )}
      >
        {/* Brand */}
        <Link
          to="/"
          aria-label="Beranda BERSAMA"
          className="flex shrink-0 items-center gap-2 rounded-full pr-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand font-sans text-sm font-semibold text-on-brand">
            B
          </span>
          <span
            className={cn(
              "hidden font-sans text-base font-semibold tracking-tight sm:inline",
              overDarkStage ? "text-[#e9ebef]" : "text-ink-primary dark:text-[#e9ebef]"
            )}
          >
            BERSAMA
          </span>
        </Link>

        {/* Subtle divider */}
        <span
          aria-hidden="true"
          className={cn(
            "mx-0.5 h-5 w-px shrink-0",
            overDarkStage ? "bg-white/15" : "bg-[#1d1e21]/10 dark:bg-white/15"
          )}
        />

        {/* Navigation links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = activeHref === item.link
            return (
              <a
                key={item.link}
                href={item.link}
                aria-label={item.name}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => {
                  if (item.link.startsWith("#")) {
                    const target = document.getElementById(item.link.slice(1))
                    if (target) {
                      event.preventDefault()
                      target.scrollIntoView({
                        behavior: prefersReducedMotion ? "auto" : "smooth",
                      })
                      setActiveHref(item.link)
                    }
                  }
                }}
                className={cn(
                  "inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 font-sans text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-w-0 sm:px-3",
                  overDarkStage
                    ? isActive
                      ? "bg-white/15 text-white"
                      : "text-[#bec0c5] hover:bg-white/10 hover:text-white"
                    : isActive
                      ? "bg-white/80 text-ink-primary dark:bg-white/15 dark:text-white"
                      : "text-ink-secondary hover:bg-white/60 hover:text-ink-primary dark:text-[#bec0c5] dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                <span className="sm:hidden" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="hidden whitespace-nowrap sm:inline">
                  {item.name}
                </span>
              </a>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link
            to="/login"
            className={cn(
              "hidden rounded-full px-3 py-2 font-sans text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex",
              overDarkStage
                ? "text-[#bec0c5] hover:bg-white/10 hover:text-white"
                : "text-ink-secondary hover:bg-white/60 hover:text-ink-primary dark:text-[#bec0c5] dark:hover:bg-white/10 dark:hover:text-white"
            )}
          >
            Masuk
          </Link>

          <Link
            to="/teams/team-pbo-01/chat"
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-full px-3.5 font-sans text-sm font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-10 sm:px-4",
              overDarkStage
                ? "bg-[#4784ff] text-[#001652] shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] hover:bg-[#6ea0ff]"
                : "bg-[#1a51c4] text-[#f1f6ff] shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_8px_20px_-8px_rgb(26_81_196/0.55)] hover:bg-[#0c3c9f] dark:bg-[#4784ff] dark:text-[#001652] dark:hover:bg-[#6ea0ff]"
            )}
          >
            Coba demo
          </Link>
        </div>
      </nav>
    </motion.header>
  )
}
