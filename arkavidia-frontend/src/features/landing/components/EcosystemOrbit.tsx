import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { useTheme } from "@/components/theme/useTheme"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WebThreads } from "@/components/ui/web-threads"
import { cn } from "@/lib/utils"
import {
  ECOSYSTEM_NODES,
  PULSE_EVENTS,
  type EcosystemBrandId,
  type EcosystemNode,
  type PulseEvent,
} from "../landingData"
import { BrandLogo } from "./BrandLogos"

const OUTER_RADIUS = 250
const INNER_RADIUS = 148
const INITIAL_SOURCES = 312
const PULSE_INTERVAL_MS = 2400
const PULSE_TRAVEL_MS = 880

interface FeedEntry extends PulseEvent {
  readonly key: number
}

const STATIC_FEED: readonly FeedEntry[] = PULSE_EVENTS.slice(0, 3).map(
  (event, idx) => ({ ...event, key: idx })
)

function LogoBubble({
  node,
  sizeClass,
  logoSize,
  isPulsing,
  dimmed,
}: {
  readonly node: EcosystemNode
  readonly sizeClass: string
  readonly logoSize: number
  readonly isPulsing: boolean
  readonly dimmed?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          aria-label={`${node.name}: ${node.role}${node.status === "soon" ? " (Segera hadir)" : ""}`}
          animate={isPulsing ? { scale: [1, 1.09, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "relative flex items-center justify-center border bg-white text-ink-primary shadow-[0_8px_24px_-10px_rgb(29_30_33/0.28)] transition-[border-color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-surface-card dark:text-ink-primary dark:shadow-[0_10px_24px_-10px_rgb(0_0_0/0.6)]",
            sizeClass,
            isPulsing
              ? "border-[#4784ff] shadow-[0_0_0_3px_rgb(71_132_255/0.25),0_8px_24px_-10px_rgb(71_132_255/0.45)]"
              : "border-[#1d1e21]/10 hover:border-line-active dark:border-white/12"
          )}
        >
          <span className={cn(dimmed && "opacity-80")}>
            <BrandLogo brandId={node.id} size={logoSize} />
          </span>
          {node.status === "soon" && (
            <span className="pointer-events-none absolute -top-2.5 -right-2.5 rounded-full border border-line-subtle bg-[#f4f6f9] px-1.5 py-0.5 font-sans text-xs leading-none font-medium text-ink-secondary shadow-badge dark:bg-surface">
              Segera
            </span>
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className="max-w-[220px] text-center">
        <div className="space-y-0.5 py-0.5">
          <p className="font-sans text-xs font-semibold">
            {node.name}
            {node.status === "soon" ? " · Segera hadir" : ""}
          </p>
          <p className="font-sans text-xs opacity-85">{node.role}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function BrainCard({
  sources,
  feed,
  flashing,
  reducedMotion,
}: {
  readonly sources: number
  readonly feed: readonly FeedEntry[]
  readonly flashing: boolean
  readonly reducedMotion: boolean
}) {
  return (
    <motion.div
      animate={
        flashing && !reducedMotion
          ? {
              boxShadow: [
                "0 10px 28px -6px rgb(29 30 33 / 0.14), 0 0 0 0px rgb(225 236 255 / 0)",
                "0 10px 28px -6px rgb(29 30 33 / 0.14), 0 0 0 6px rgb(71 132 255 / 0.22)",
                "0 10px 28px -6px rgb(29 30 33 / 0.14), 0 0 0 0px rgb(225 236 255 / 0)",
              ],
            }
          : undefined
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[260px] rounded-2xl border border-line-subtle bg-white p-4 text-left shadow-raised dark:bg-surface-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded-full bg-wash-brand px-2.5 py-0.5 font-sans text-xs font-semibold tracking-wide text-ink-link">
            M2 · TEAM MEMORY
          </span>

          <h3 className="mt-2 font-sans text-base font-semibold text-ink-primary">
            Project Brain
          </h3>
        </div>

        <AgentStickerAvatar
          role="team"
          state={flashing ? "success" : "idle"}
          size={38}
          interactive
        />
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-1 font-sans text-xs text-ink-secondary tabular-nums">
        <span>14 keputusan · 6 KC ·</span>
        <span className="relative inline-flex h-4 min-w-[26px] items-center justify-center overflow-hidden font-semibold text-ink-primary">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={sources}
              initial={reducedMotion ? false : { y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reducedMotion ? undefined : { y: -8, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {sources}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>sumber</span>
      </p>

      <div className="mt-3 space-y-1.5 border-t border-line-subtle pt-3">
        <AnimatePresence initial={false} mode="popLayout">
          {feed.map((item) => (
            <motion.div
              key={item.key}
              layout={!reducedMotion}
              initial={reducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex items-center gap-2 rounded-lg bg-surface/80 px-2.5 py-1.5 text-xs text-ink-secondary dark:bg-surface"
            >
              <BrandLogo
                brandId={item.from}
                size={14}
                className="shrink-0 text-ink-primary"
              />
              <span className="truncate font-sans text-xs text-ink-primary">
                {item.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function EcosystemOrbit() {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme !== "dark"
  const sectionRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(sectionRef, { amount: 0.25 })
  const hasEntered = useInView(sectionRef, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotion() ?? false

  const [sources, setSources] = useState(INITIAL_SOURCES)
  const [feed, setFeed] = useState<readonly FeedEntry[]>(STATIC_FEED)
  const [activePulse, setActivePulse] = useState<{
    readonly from: EcosystemBrandId
    readonly key: number
  } | null>(null)
  const [flashing, setFlashing] = useState(false)

  const pulseIndexRef = useRef(0)
  const arrivalTimerRef = useRef<number | null>(null)
  const flashTimerRef = useRef<number | null>(null)

  const outerNodes = ECOSYSTEM_NODES.filter((node) => node.ring === "outer")
  const innerNodes = ECOSYSTEM_NODES.filter((node) => node.ring === "inner")

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      return
    }

    const triggerPulse = () => {
      const event = PULSE_EVENTS[pulseIndexRef.current % PULSE_EVENTS.length]
      const pulseKey = Date.now() + pulseIndexRef.current
      pulseIndexRef.current += 1

      setActivePulse({ from: event.from, key: pulseKey })

      arrivalTimerRef.current = window.setTimeout(() => {
        setSources((prev) => prev + 1)
        setFeed((prev) => [{ ...event, key: pulseKey }, ...prev].slice(0, 3))
        setFlashing(true)
        setActivePulse(null)

        flashTimerRef.current = window.setTimeout(() => {
          setFlashing(false)
        }, 520)
      }, PULSE_TRAVEL_MS)
    }

    const startDelay = window.setTimeout(() => {
      triggerPulse()
    }, 900)

    const intervalId = window.setInterval(triggerPulse, PULSE_INTERVAL_MS)

    return () => {
      window.clearTimeout(startDelay)
      window.clearInterval(intervalId)
      if (arrivalTimerRef.current) window.clearTimeout(arrivalTimerRef.current)
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    }
  }, [isInView, prefersReducedMotion])

  const shouldSpin = isInView && !prefersReducedMotion

  return (
    <section
      id="tim"
      ref={sectionRef}
      aria-labelledby="ekosistem-heading"
      className="scroll-mt-24 bg-[var(--bg-page)] py-24 sm:py-32"
    >
      <TooltipProvider delayDuration={150}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="ekosistem-heading"
              className="font-display mx-auto max-w-[18ch] text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-ink-primary text-balance sm:text-5xl"
            >
              Bekerja di atas tools yang sudah kalian pakai.
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-ink-secondary text-pretty sm:text-lg">
              WhatsApp, GitHub, Notion, dan AI favoritmu, dirangkum jadi satu
              memori tim.
            </p>
          </div>

          {/* Desktop 2-Ring Orbit Stage */}
          <div className="relative mt-14 hidden items-center justify-center sm:flex">
            {/* Subtle Cobalt-Violet WebThreads weaving across and converging behind Project Brain */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 h-[540px] -translate-y-1/2"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)",
              }}
            >
              <WebThreads
                colors={
                  isLight
                    ? ["#2d6ae7", "#6ea0ff", "#7f51db"]
                    : ["#4784ff", "#9fc1ff", "#9669f8"]
                }
                coreColor="#ffffff"
                threadCount={6}
                spread={0.15}
                pinch={0.5}
                position={0.5}
                lightMode={isLight}
                glow={0.018}
                brightness={isLight ? 0.82 : 0.6}
                opacity={isLight ? 0.42 : 0.38}
                fade={0.68}
                grain={0.012}
                speed={0.16}
                mouseInteraction
                mouseStrength={0.35}
                pulseOnClick
                dpr={1.5}
              />
            </div>

            <div className="group/orbit relative z-10 mx-auto flex size-[560px] max-w-full items-center justify-center">
            {/* Dashed concentric SVG rings */}
            <svg
              viewBox="0 0 560 560"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
            >
              <motion.circle
                cx="280"
                cy="280"
                r={OUTER_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 6"
                className="text-[#d7d9dd] dark:text-white/15"
                initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={hasEntered ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.circle
                cx="280"
                cy="280"
                r={INNER_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 6"
                className="text-[#e9ebef] dark:text-white/10"
                initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={hasEntered ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
              />
            </svg>

            {/* Outer Ring (6 tools, 80s clockwise) */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 will-change-transform",
                shouldSpin &&
                  "animate-[spin_80s_linear_infinite] group-hover/orbit:[animation-play-state:paused] group-focus-within/orbit:[animation-play-state:paused]"
              )}
            >
              {outerNodes.map((node, index) => {
                const angle = (360 / outerNodes.length) * index - 90
                const isSending = activePulse?.from === node.id
                return (
                  <div
                    key={node.id}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    {/* Inward pulse light traveling along radius */}
                    {isSending && !prefersReducedMotion && (
                      <motion.div
                        key={activePulse.key}
                        aria-hidden="true"
                        initial={{ x: OUTER_RADIUS, opacity: 0 }}
                        animate={{ x: 24, opacity: [0, 1, 1, 0] }}
                        transition={{
                          duration: PULSE_TRAVEL_MS / 1000,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="pointer-events-none absolute top-0 left-0 flex -translate-y-1/2 items-center"
                      >
                        <span className="size-1.5 rounded-full bg-[#4784ff] shadow-[0_0_12px_2px_rgb(71_132_255/0.65)]" />
                        <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#4784ff]" />
                      </motion.div>
                    )}

                    <div
                      className="pointer-events-auto"
                      style={{
                        transform: `translateX(${OUTER_RADIUS}px) rotate(${-angle}deg)`,
                      }}
                    >
                      <motion.div
                        initial={
                          prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }
                        }
                        animate={hasEntered ? { scale: 1, opacity: 1 } : undefined}
                        transition={{
                          duration: 0.45,
                          delay: index * 0.06,
                          ease: "easeOut",
                        }}
                      >
                        <div
                          className={cn(
                            "-translate-x-1/2 -translate-y-1/2",
                            shouldSpin &&
                              "animate-[spin_80s_linear_infinite] [animation-direction:reverse] group-hover/orbit:[animation-play-state:paused] group-focus-within/orbit:[animation-play-state:paused]"
                          )}
                        >
                          <LogoBubble
                            node={node}
                            sizeClass="size-14 rounded-2xl"
                            logoSize={24}
                            isPulsing={isSending}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Inner Ring (3 infrastructure nodes, 60s counter-clockwise) */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 will-change-transform",
                shouldSpin &&
                  "animate-[spin_60s_linear_infinite] [animation-direction:reverse] group-hover/orbit:[animation-play-state:paused] group-focus-within/orbit:[animation-play-state:paused]"
              )}
            >
              {innerNodes.map((node, index) => {
                const angle = (360 / innerNodes.length) * index - 30
                const isSending = activePulse?.from === node.id
                return (
                  <div
                    key={node.id}
                    className="absolute top-1/2 left-1/2"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div
                      className="pointer-events-auto"
                      style={{
                        transform: `translateX(${INNER_RADIUS}px) rotate(${-angle}deg)`,
                      }}
                    >
                      <motion.div
                        initial={
                          prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }
                        }
                        animate={hasEntered ? { scale: 1, opacity: 1 } : undefined}
                        transition={{
                          duration: 0.45,
                          delay: 0.36 + index * 0.06,
                          ease: "easeOut",
                        }}
                      >
                        <div
                          className={cn(
                            "-translate-x-1/2 -translate-y-1/2",
                            shouldSpin &&
                              "animate-[spin_60s_linear_infinite] group-hover/orbit:[animation-play-state:paused] group-focus-within/orbit:[animation-play-state:paused]"
                          )}
                        >
                          <LogoBubble
                            node={node}
                            sizeClass="size-11 rounded-xl"
                            logoSize={18}
                            isPulsing={isSending}
                            dimmed
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Center Project Brain Card */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={hasEntered ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="relative z-10"
            >
              <BrainCard
                sources={sources}
                feed={feed}
                flashing={flashing}
                reducedMotion={prefersReducedMotion}
              />
            </motion.div>
            </div>
          </div>

          {/* Mobile Stack (< 640px): Brain card + 3x3 grid */}
          <div className="mt-10 flex flex-col items-center gap-6 sm:hidden">
            <BrainCard
              sources={sources}
              feed={feed}
              flashing={flashing}
              reducedMotion={prefersReducedMotion}
            />

            <div className="grid w-full max-w-[300px] grid-cols-3 place-items-center gap-4">
              {ECOSYSTEM_NODES.map((node) => (
                <LogoBubble
                  key={node.id}
                  node={node}
                  sizeClass="size-14 rounded-2xl"
                  logoSize={22}
                  isPulsing={activePulse?.from === node.id}
                  dimmed={node.ring === "inner"}
                />
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </section>
  )
}
