import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  DEMO_TEAM_MEMBERS,
  TEAM_COLLAB_SCENE_SRC,
  WEEKLY_CYCLES,
  type WeeklyCyclePhase,
} from "../landingData"

const MEMBER_MAP = new Map(DEMO_TEAM_MEMBERS.map((m) => [m.id, m]))

const PHASE_WASH_CLASS: Readonly<Record<WeeklyCyclePhase["id"], string>> = {
  capture: "border-brand-subtle bg-wash-brand",
  map: "border-brand-subtle bg-wash-brand",
  check: "border-brand-subtle bg-wash-brand",
  close: "border-brand-subtle bg-wash-brand",
}

function PhaseVisualDiagram({ phaseId }: { phaseId: WeeklyCyclePhase["id"] }) {
  const rani = MEMBER_MAP.get("user-rani")
  const dimas = MEMBER_MAP.get("user-dimas")
  const sari = MEMBER_MAP.get("user-sari")

  switch (phaseId) {
    case "capture":
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans text-xs font-semibold text-ink-primary">
              Riwayat Keputusan · DEC-02
            </p>
            <AgentStickerAvatar
              role="team"
              size={30}
              interactive={false}
            />
          </div>
          <div className="rounded-lg border border-line-subtle bg-surface-card p-3 opacity-80">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs tabular-nums text-ink-secondary">
                v0 · 04 Nov 2026
              </span>
              <span className="rounded-full border border-line-subtle bg-surface px-2 py-0.5 font-sans text-xs text-ink-secondary">
                Digantikan
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-ink-secondary line-through">
              Login memakai Cookie Session dasar
            </p>
          </div>
          <div className="flex justify-center text-ink-secondary" aria-hidden="true">
            <ArrowDown className="size-4" />
          </div>
          <div className="rounded-lg border border-brand-subtle bg-surface-card p-3 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs font-medium tabular-nums text-ink-link">
                v1 · 10 Nov 2026
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 font-sans text-xs font-medium text-text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Terkonfirmasi
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-ink-primary">
              Login beralih ke JWT stateless oleh Dimas
            </p>
          </div>
        </div>
      )

    case "map":
      return (
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold text-ink-primary">
            Graf Knowledge Components (KC)
          </p>
          <svg
            viewBox="0 0 300 132"
            className="h-32 w-full rounded-lg border border-line-subtle bg-surface-card p-2"
            aria-hidden="true"
          >
            <line
              x1="60"
              y1="66"
              x2="150"
              y2="38"
              stroke="var(--border-default)"
              strokeWidth="1.5"
            />
            <line
              x1="60"
              y1="66"
              x2="150"
              y2="98"
              stroke="var(--border-default)"
              strokeWidth="1.5"
            />
            <line
              x1="150"
              y1="38"
              x2="240"
              y2="66"
              stroke="var(--border-default)"
              strokeWidth="1.5"
            />
            <circle cx="60" cy="66" r="24" fill="var(--bg-brand)" />
            <text
              x="60"
              y="70"
              textAnchor="middle"
              fill="var(--text-on-brand)"
              className="font-sans text-xs font-semibold"
            >
              KC-01
            </text>

            <circle
              cx="150"
              cy="38"
              r="26"
              fill="var(--bg-warning-subtle)"
              stroke="var(--bg-warning)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text
              x="150"
              y="36"
              textAnchor="middle"
              fill="var(--text-warning)"
              className="font-sans text-xs font-semibold"
            >
              KC-02
            </text>
            <text
              x="150"
              y="50"
              textAnchor="middle"
              fill="var(--text-warning)"
              className="font-sans text-xs font-medium"
            >
              Silo 1/4
            </text>

            <circle cx="150" cy="98" r="24" fill="var(--bg-brand)" />
            <text
              x="150"
              y="102"
              textAnchor="middle"
              fill="var(--text-on-brand)"
              className="font-sans text-xs font-semibold"
            >
              KC-03
            </text>

            <circle cx="240" cy="66" r="24" fill="var(--bg-accent)" />
            <text
              x="240"
              y="70"
              textAnchor="middle"
              fill="var(--text-on-brand)"
              className="font-sans text-xs font-semibold"
            >
              KC-04
            </text>
          </svg>
          <p className="font-sans text-xs font-medium text-text-warning">
            Peringatan: KC-02 (JWT) berada pada Bus Factor = 1
          </p>
        </div>
      )

    case "check":
      return (
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold text-ink-primary">
            Kurva Adaptif &amp; Zona Abstain
          </p>
          <svg
            viewBox="0 0 300 132"
            className="h-32 w-full rounded-lg border border-line-subtle bg-surface-card p-2"
            aria-hidden="true"
          >
            <rect
              x="170"
              y="14"
              width="95"
              height="96"
              rx="8"
              fill="var(--bg-warning-subtle)"
              opacity="0.8"
            />
            <line
              x1="28"
              y1="106"
              x2="275"
              y2="106"
              stroke="var(--border-default)"
              strokeWidth="1"
            />
            <path
              d="M 32 98 C 100 98, 128 24, 260 22"
              fill="none"
              stroke="var(--bg-brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="204" cy="25" r="5.5" fill="var(--bg-warning)" />
            <text
              x="217"
              y="52"
              textAnchor="middle"
              fill="var(--text-warning)"
              className="font-sans text-xs font-semibold"
            >
              Abstain
            </text>
            <text
              x="44"
              y="28"
              fill="currentColor"
              className="font-sans text-xs font-medium text-ink-secondary"
            >
              P(paham)
            </text>
          </svg>
          <p className="font-sans text-xs text-ink-secondary">
            Saat grader ragu, pertanyaan dialihkan ke peer explanation.
          </p>
        </div>
      )

    case "close":
      return (
        <div className="space-y-2.5">
          <p className="font-sans text-xs font-semibold text-ink-primary">
            Pairing 10 Menit &amp; Tutored Briefing
          </p>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-line-subtle bg-surface-card p-3 shadow-card">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={dimas?.avatarSrc} alt="Dimas" />
                <AvatarFallback className="text-xs">DP</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-ink-primary">Dimas</span>
              <ArrowRight
                className="size-3.5 text-ink-tertiary"
                aria-hidden="true"
              />
              <Avatar size="sm">
                <AvatarImage src={rani?.avatarSrc} alt="Rani" />
                <AvatarFallback className="text-xs">RK</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-ink-primary">Rani</span>
            </div>
            <span className="rounded-full bg-success-subtle px-2.5 py-0.5 font-sans text-xs font-semibold tabular-nums text-text-success">
              +25% Cov
            </span>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-line-subtle bg-surface-card p-3">
            <AgentStickerAvatar
              role="tutor"
              state="speaking"
              size={32}
              interactive={false}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-sans text-xs font-medium text-ink-link">
                <MessageSquare className="size-3.5" aria-hidden="true" />
                <span>Socratic Tutor · Sari</span>
                <Avatar size="sm" className="ml-auto size-5">
                  <AvatarImage src={sari?.avatarSrc} alt="Sari" />
                  <AvatarFallback className="text-xs">SW</AvatarFallback>
                </Avatar>
              </div>
              <p className="mt-1 text-xs text-ink-secondary">
                &ldquo;Apa risiko kalau modul antrean disatukan tanpa MVC?&rdquo;
              </p>
            </div>
          </div>
        </div>
      )
  }
}

export function WeeklyCycleSection() {
  const [selectedId, setSelectedId] =
    useState<WeeklyCyclePhase["id"]>("capture")
  const activePhase =
    WEEKLY_CYCLES.find((phase) => phase.id === selectedId) ?? WEEKLY_CYCLES[0]

  return (
    <section id="cara-kerja" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl border border-line-subtle bg-surface-card shadow-raised">
            <img
              src={TEAM_COLLAB_SCENE_SRC}
              alt="Empat mahasiswa Indonesia berkolaborasi tenang dengan laptop di ruang belajar kampus"
              width={1376}
              height={768}
              fetchPriority="high"
              decoding="async"
              className="aspect-video w-full object-cover"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle bg-surface-card px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <AvatarStack size={26}>
                  {DEMO_TEAM_MEMBERS.map((member) => (
                    <Avatar key={member.id}>
                      <AvatarImage src={member.avatarSrc} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarStack>
                <span className="font-sans text-xs font-medium text-ink-primary">
                  Rani, Dimas, Budi &amp; Sari
                </span>
              </div>
              <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-info">
                IF2210 PBO · Minggu 3
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
            Tangkap, Petakan,{" "}
            <span className="font-display-oblique text-ink-link">
              Uji &amp; Tutup Celah.
            </span>
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
            BERSAMA menjaga alur diskusi kelompok tetap mengalir sekaligus
            mendeteksi celah pemahaman sebelum presentasi.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <Card className="py-3">
              <CardContent className="px-3">
                <p className="kpi-hero text-xl font-semibold text-ink-primary sm:text-2xl">
                  &le; 5 mnt
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Uji mingguan
                </p>
              </CardContent>
            </Card>
            <Card className="py-3">
              <CardContent className="px-3">
                <p className="kpi-hero text-xl font-semibold text-ink-primary sm:text-2xl">
                  0 Leak
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Isolasi M1
                </p>
              </CardContent>
            </Card>
            <Card className="py-3">
              <CardContent className="px-3">
                <p className="kpi-hero text-xl font-semibold text-ink-primary sm:text-2xl">
                  10 mnt
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Sesi pairing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Interactive 4-Phase Selector + Diagram */}
      <div className="mx-auto mt-10 max-w-5xl">
        <div
          role="tablist"
          aria-label="Siklus mingguan BERSAMA"
          className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
        >
          {WEEKLY_CYCLES.map((phase) => {
            const isSelected = phase.id === activePhase.id
            return (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedId(phase.id)}
                className={cn(
                  "flex flex-col rounded-xl border p-3.5 text-left transition-[border-color,box-shadow,background-color] duration-150 ease-out sm:p-4",
                  isSelected
                    ? "border-line-active bg-surface-card shadow-raised"
                    : "border-line-subtle bg-surface-card/75 shadow-card hover:border-line-default"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "font-sans text-xs font-semibold tabular-nums",
                      isSelected ? "text-ink-link" : "text-ink-secondary"
                    )}
                  >
                    Fase {phase.step}
                  </span>
                  <span
                    className={cn(
                      "size-2 rounded-full transition-colors duration-150",
                      isSelected ? "bg-brand" : "bg-muted"
                    )}
                  />
                </div>
                <span className="mt-1.5 font-sans text-base font-semibold text-ink-primary">
                  {phase.title}
                </span>
                <span className="mt-1 hidden text-xs leading-relaxed text-ink-secondary sm:block">
                  {phase.shortSummary}
                </span>
              </button>
            )
          })}
        </div>

        <Card className="mt-4 min-h-[250px] rounded-2xl py-5 sm:py-6">
          <CardContent className="px-5 sm:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12"
              >
                <div className="space-y-3 lg:col-span-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-info">
                      Fase {activePhase.step} · {activePhase.title}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Detail teknis ${activePhase.title}`}
                          className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2.5 py-0.5 font-sans text-xs font-medium text-ink-secondary transition-colors duration-150 hover:border-line-default hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <span>{activePhase.formulaTag}</span>
                          <HelpCircle className="size-3.5" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80">
                        <PopoverHeader>
                          <PopoverTitle>
                            {activePhase.mechanismTitle}
                          </PopoverTitle>
                          <PopoverDescription>
                            {activePhase.technicalNote}
                          </PopoverDescription>
                        </PopoverHeader>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-ink-primary sm:text-2xl">
                    {activePhase.mechanismTitle}
                  </h3>

                  <p className="text-sm leading-relaxed text-ink-secondary text-pretty">
                    {activePhase.mechanismPlain}
                  </p>

                  <div className="pt-1">
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link to={activePhase.demoPath}>
                        {activePhase.demoCta}
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-xl border p-4 lg:col-span-6",
                    PHASE_WASH_CLASS[activePhase.id]
                  )}
                >
                  <PhaseVisualDiagram phaseId={activePhase.id} />
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
