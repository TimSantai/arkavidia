import { useEffect, useRef, useState } from "react"
import {
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Clock,
  HelpCircle,
  Lock,
  MessageSquare,
  Search,
} from "lucide-react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { CountUp } from "@/components/ui/count-up"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DECISION_GROUPS,
  DEMO_TEAM_MEMBERS,
  EMPIRICAL_STATS,
} from "../landingData"
import { CoverageRing } from "./CoverageRing"
import { GlowWindow } from "./GlowWindow"

const MEMBER_MAP = new Map(DEMO_TEAM_MEMBERS.map((m) => [m.id, m]))
const EASE = [0.2, 0.8, 0.2, 1] as const

function EmpiricalStatValue({
  id,
  fallback,
}: {
  readonly id: string
  readonly fallback: string
}) {
  if (id === "bastani") {
    return (
      <CountUp
        from={0}
        to={-17}
        suffix="%"
        mode="roll"
        easing="spring"
        duration={0.95}
        trigger="view"
        replayOnHover
      />
    )
  }

  if (id === "anthropic") {
    return (
      <span className="inline-flex items-baseline gap-2">
        <CountUp
          from={0}
          to={50}
          suffix="%"
          mode="roll"
          easing="spring"
          duration={0.9}
          trigger="view"
          replayOnHover
        />
        <span>vs</span>
        <CountUp
          from={0}
          to={67}
          suffix="%"
          mode="roll"
          easing="spring"
          duration={1.05}
          delay={0.08}
          trigger="view"
          replayOnHover
        />
      </span>
    )
  }

  if (id === "cscl") {
    return (
      <CountUp
        from={0}
        to={0.61}
        decimals={2}
        prefix="g = "
        mode="roll"
        easing="spring"
        duration={1.05}
        trigger="view"
        replayOnHover
      />
    )
  }

  return <>{fallback}</>
}

export function ComparisonSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotion() ?? false

  const [dec14Upgraded, setDec14Upgraded] = useState(false)
  const [showLiveChip, setShowLiveChip] = useState(false)

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return

    const upgradeTimer = window.setTimeout(() => {
      setDec14Upgraded(true)
      setShowLiveChip(true)
    }, 2400)

    const hideChipTimer = window.setTimeout(() => {
      setShowLiveChip(false)
    }, 5400)

    return () => {
      window.clearTimeout(upgradeTimer)
      window.clearTimeout(hideChipTimer)
    }
  }, [isInView, prefersReducedMotion])

  return (
    <section
      id="riset"
      ref={sectionRef}
      aria-labelledby="riset-heading"
      className="scroll-mt-24 bg-[var(--bg-page)] pt-8 pb-24 sm:pb-32"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="riset-heading"
            className="font-display max-w-[16ch] text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-ink-primary text-balance sm:text-5xl"
          >
            Ringkasan rapat bukan berarti paham.
          </h2>
          <p className="mt-4 max-w-[560px] font-sans text-base leading-relaxed text-ink-secondary text-pretty sm:text-lg">
            Setiap keputusan di BERSAMA menunjukkan berapa anggota yang
            benar-benar bisa menjelaskannya.
          </p>
        </div>

        {/* Illuminated Decision List Mockup Window */}
        <div className="relative mx-auto mt-14 max-w-[1080px] sm:mt-[72px]">
          <AnimatePresence>
            {showLiveChip && !prefersReducedMotion && (
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="pointer-events-none absolute -top-11 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-ink-primary shadow-raised dark:bg-surface-raised"
              >
                <CheckCircle2
                  className="size-3.5 text-text-success"
                  aria-hidden="true"
                />
                <span>Sari lulus explain-back DEC-14</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <GlowWindow lit={isInView} reducedMotion={prefersReducedMotion}>
              {/* Purely illustrative window: no interactive buttons/inputs inside */}
              <div aria-hidden="true" className="flex select-none">
                {/* Mini Left Sidebar */}
                <div className="hidden w-16 shrink-0 flex-col items-center gap-4 border-r border-[#e9ebef] bg-[#f8f9fb] py-4 sm:flex dark:border-line-subtle dark:bg-surface">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#1d1e21] font-sans text-sm font-semibold text-white dark:bg-white dark:text-[#1d1e21]">
                    B
                  </div>

                  <div className="flex w-12 flex-col items-center rounded-lg border border-[#e9ebef] bg-white px-1 py-1.5 text-center dark:border-line-subtle dark:bg-surface-card">
                    <span className="font-sans text-xs leading-tight font-semibold tabular-nums text-ink-primary">
                      {dec14Upgraded ? "68%" : "62%"}
                    </span>
                    <div className="mt-1 h-[3px] w-8 overflow-hidden rounded-full bg-[#e9ebef] dark:bg-muted">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-500"
                        style={{ width: dec14Upgraded ? "68%" : "62%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-1 flex flex-col items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg text-ink-tertiary">
                      <MessageSquare className="size-[18px]" />
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#e9ebef] text-[#1d1e21] dark:bg-surface-card dark:text-ink-primary">
                      <CheckSquare className="size-[18px]" />
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-lg text-ink-tertiary">
                      <Clock className="size-[18px]" />
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-lg text-ink-tertiary">
                      <Lock className="size-[18px]" />
                    </div>
                  </div>
                </div>

                {/* Decision List Content */}
                <div className="min-w-0 flex-1 space-y-3 p-4 pb-0">
                  {/* Mock Toolbar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-9 flex-1 items-center gap-2 rounded-[9px] bg-[#f4f6f9] px-3 font-sans text-xs text-ink-tertiary dark:bg-surface">
                      <Search className="size-3.5 shrink-0" />
                      <span>Cari keputusan...</span>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="inline-flex h-9 items-center rounded-[9px] border border-[#e9ebef] bg-white px-3 font-sans text-xs font-medium text-ink-secondary dark:border-line-subtle dark:bg-surface">
                        Tampilan
                      </span>
                      <span className="inline-flex h-9 items-center rounded-[9px] border border-[#e9ebef] bg-white px-3 font-sans text-xs font-medium text-ink-secondary dark:border-line-subtle dark:bg-surface">
                        Filter
                      </span>
                    </div>
                  </div>

                  {/* Decision Groups */}
                  {DECISION_GROUPS.map((group, groupIdx) => (
                    <div
                      key={group.label}
                      className="rounded-xl bg-[#f8f9fb] py-1 dark:bg-surface/75"
                      style={
                        group.faded
                          ? {
                              maskImage:
                                "linear-gradient(to bottom, #000 30%, transparent)",
                              WebkitMaskImage:
                                "linear-gradient(to bottom, #000 30%, transparent)",
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1.5 px-3.5 py-2 font-sans text-xs font-semibold tracking-wide text-ink-secondary">
                        <ChevronDown className="size-3.5 text-ink-tertiary" />
                        <span>
                          {group.label} · {group.count}
                        </span>
                      </div>

                      <div>
                        {group.rows.map((row, rowIdx) => {
                          const owner = MEMBER_MAP.get(row.ownerId)
                          const absoluteIdx = groupIdx * 3 + rowIdx
                          const currentUnderstood =
                            row.id === "DEC-14" && dec14Upgraded
                              ? 2
                              : row.understood

                          return (
                            <motion.div
                              key={row.id}
                              initial={
                                prefersReducedMotion
                                  ? false
                                  : { opacity: 0, x: -8 }
                              }
                              animate={
                                isInView ? { opacity: 1, x: 0 } : undefined
                              }
                              transition={{
                                duration: 0.4,
                                delay: 0.25 + absoluteIdx * 0.06,
                                ease: EASE,
                              }}
                              className="flex items-center gap-3 border-t border-[#eef0f3] px-3.5 py-2.5 dark:border-line-subtle"
                            >
                              <span className="hidden w-14 shrink-0 font-sans text-xs font-medium tabular-nums text-ink-tertiary sm:inline">
                                {row.id}
                              </span>

                              <span className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-ink-primary">
                                {row.title}
                              </span>

                              {row.aiAssisted && (
                                <span className="hidden shrink-0 rounded-full bg-warning-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-warning md:inline-flex">
                                  Dibantu AI
                                </span>
                              )}

                              {typeof row.comments === "number" && (
                                <span className="hidden shrink-0 items-center gap-1 font-sans text-xs tabular-nums text-ink-tertiary md:inline-flex">
                                  <MessageSquare className="size-3.5" />
                                  {row.comments}
                                </span>
                              )}

                              <span className="hidden shrink-0 rounded-md bg-[#e1ecff] px-2 py-0.5 font-sans text-xs font-medium text-ink-link sm:inline-flex dark:bg-wash-brand">
                                {row.kc}
                              </span>

                              <CoverageRing
                                understood={currentUnderstood}
                                total={row.total}
                                animate={isInView}
                                delay={0.45 + absoluteIdx * 0.08}
                              />

                              <span className="hidden w-12 shrink-0 text-right font-sans text-xs tabular-nums text-ink-tertiary sm:inline">
                                {row.date}
                              </span>

                              <Avatar size="sm" className="size-6 shrink-0">
                                {owner?.avatarSrc && (
                                  <AvatarImage
                                    src={owner.avatarSrc}
                                    alt={owner.name}
                                  />
                                )}
                                <AvatarFallback className="text-xs font-medium">
                                  {owner?.initials ?? "TM"}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlowWindow>
          </motion.div>
        </div>

        {/* 3 Empirical Research Stat Cards */}
        <div className="mx-auto mt-16 grid max-w-[1080px] grid-cols-1 gap-4 sm:mt-[72px] sm:grid-cols-3">
          {EMPIRICAL_STATS.map((stat) => (
            <Card
              key={stat.id}
              className="justify-between rounded-3xl border-[#dce7fb] bg-gradient-to-b from-white to-[#f7faff] py-5 shadow-[0_4px_16px_-10px_rgb(29_30_33/0.08)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#c6daff] hover:shadow-[0_10px_24px_-14px_rgb(26_81_196/0.14)] dark:border-[#4784ff]/20 dark:from-[#161c2e] dark:to-[#131826]"
            >
              <CardContent className="flex flex-1 flex-col justify-between gap-4 px-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="kpi-hero text-[40px] leading-none font-semibold tracking-[-0.03em] text-ink-primary sm:text-[44px]">
                      <EmpiricalStatValue id={stat.id} fallback={stat.value} />
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Sumber riset ${stat.citation}`}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface text-ink-secondary transition-colors duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <HelpCircle className="size-3.5" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <PopoverHeader>
                          <PopoverTitle>{stat.citation}</PopoverTitle>
                          <PopoverDescription>
                            {stat.methodNote}
                          </PopoverDescription>
                        </PopoverHeader>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink-secondary text-pretty">
                    {stat.description}
                  </p>
                </div>

                <p className="border-t border-line-subtle pt-3 font-sans text-xs font-medium text-ink-tertiary">
                  {stat.citation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
