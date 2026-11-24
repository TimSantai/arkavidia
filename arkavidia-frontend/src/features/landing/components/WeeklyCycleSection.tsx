import { useState } from "react"
import { Link } from "react-router"
import { ArrowRight, CheckCircle2, MessageSquare } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DEMO_TEAM_MEMBERS,
  TEAM_COLLAB_SCENE_SRC,
  WEEKLY_CYCLES,
  type WeeklyCyclePhase,
} from "../landingData"

const MEMBER_MAP = new Map(DEMO_TEAM_MEMBERS.map((m) => [m.id, m]))

function PhaseVisualDiagram({ phaseId }: { phaseId: WeeklyCyclePhase["id"] }) {
  const rani = MEMBER_MAP.get("user-rani")
  const dimas = MEMBER_MAP.get("user-dimas")
  const sari = MEMBER_MAP.get("user-sari")

  switch (phaseId) {
    case "capture":
      return (
        <div className="space-y-2.5">
          <p className="font-mono text-[10px] font-medium text-ink-tertiary uppercase">
            Bitemporal Decision Chain • DEC-02
          </p>
          <div className="rounded-lg border border-line-subtle bg-surface p-3 opacity-75">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-ink-tertiary">
                v0 • 04 Nov 2026
              </span>
              <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[10px] text-ink-tertiary">
                SUPERSEDED
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-ink-secondary line-through">
              Login memakai Cookie Session dasar
            </p>
          </div>
          <div className="flex justify-center font-mono text-[10px] text-ink-tertiary">
            ↓ supersedes
          </div>
          <div className="rounded-lg border border-line-active/40 bg-surface p-3 shadow-surface">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-ink-link">
                v1 • 10 Nov 2026
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-text-success">
                <CheckCircle2 className="size-3" />
                CONFIRMED
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
          <p className="font-mono text-[10px] font-medium text-ink-tertiary uppercase">
            Graf Knowledge Components (KC)
          </p>
          <svg
            viewBox="0 0 280 120"
            className="h-28 w-full rounded-lg border border-line-subtle bg-surface p-2"
            aria-hidden="true"
          >
            <line
              x1="60"
              y1="60"
              x2="140"
              y2="34"
              stroke="var(--border-default)"
              strokeWidth="1.5"
            />
            <line
              x1="60"
              y1="60"
              x2="140"
              y2="88"
              stroke="var(--border-default)"
              strokeWidth="1.5"
            />
            <line
              x1="140"
              y1="34"
              x2="224"
              y2="60"
              stroke="var(--border-default)"
              strokeWidth="1.5"
            />
            <circle cx="60" cy="60" r="18" fill="var(--bg-brand)" />
            <text
              x="60"
              y="63"
              textAnchor="middle"
              fill="var(--text-on-brand)"
              className="font-mono text-[9px] font-semibold"
            >
              KC-01
            </text>

            <circle
              cx="140"
              cy="34"
              r="21"
              fill="var(--bg-warning-subtle)"
              stroke="var(--bg-warning)"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
            <text
              x="140"
              y="32"
              textAnchor="middle"
              fill="var(--text-warning)"
              className="font-mono text-[9px] font-semibold"
            >
              KC-02
            </text>
            <text
              x="140"
              y="43"
              textAnchor="middle"
              fill="var(--text-warning)"
              className="font-mono text-[7px]"
            >
              1/4 SILO
            </text>

            <circle cx="140" cy="88" r="17" fill="var(--bg-tertiary)" />
            <text
              x="140"
              y="91"
              textAnchor="middle"
              fill="var(--text-on-tertiary)"
              className="font-mono text-[9px] font-semibold"
            >
              KC-03
            </text>

            <circle cx="224" cy="60" r="17" fill="var(--bg-accent)" />
            <text
              x="224"
              y="63"
              textAnchor="middle"
              fill="var(--text-on-accent)"
              className="font-mono text-[9px] font-semibold"
            >
              KC-04
            </text>
          </svg>
          <p className="font-mono text-[11px] text-text-warning">
            Alert: KC-02 (JWT) menjadi titik rapuh Bus Factor = 1
          </p>
        </div>
      )

    case "check":
      return (
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-medium text-ink-tertiary uppercase">
            Kurva IRT 2PL &amp; Zona Abstention
          </p>
          <svg
            viewBox="0 0 280 120"
            className="h-28 w-full rounded-lg border border-line-subtle bg-surface p-2"
            aria-hidden="true"
          >
            <rect
              x="165"
              y="14"
              width="75"
              height="92"
              rx="6"
              fill="var(--bg-warning-subtle)"
              opacity="0.7"
            />
            <line
              x1="28"
              y1="98"
              x2="255"
              y2="98"
              stroke="var(--border-default)"
              strokeWidth="1"
            />
            <path
              d="M 30 92 C 95 92, 120 22, 245 20"
              fill="none"
              stroke="var(--bg-brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="195" cy="24" r="5" fill="var(--bg-warning)" />
            <text
              x="202"
              y="42"
              textAnchor="middle"
              fill="var(--text-warning)"
              className="font-mono text-[8px] font-semibold"
            >
              ABSTAIN
            </text>
            <text
              x="54"
              y="26"
              fill="currentColor"
              className="font-mono text-[9px] text-ink-tertiary"
            >
              P_j(θ)
            </text>
          </svg>
          <p className="font-mono text-[11px] text-ink-secondary">
            Ketidakpastian tinggi → dialihkan ke peer explanation
          </p>
        </div>
      )

    case "close":
      return (
        <div className="space-y-2.5">
          <p className="font-mono text-[10px] font-medium text-ink-tertiary uppercase">
            Pairing &amp; Tutored Briefing
          </p>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-line-subtle bg-surface p-3 shadow-surface">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={dimas?.avatarSrc} alt="Dimas" />
                <AvatarFallback>DP</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-ink-primary">Dimas</span>
              <span className="font-mono text-xs text-ink-tertiary">↔</span>
              <Avatar size="sm">
                <AvatarImage src={rani?.avatarSrc} alt="Rani" />
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-ink-primary">Rani</span>
            </div>
            <span className="rounded-full bg-success-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-text-success">
              +25% COV
            </span>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-line-subtle bg-surface p-3">
            <Avatar size="sm">
              <AvatarImage src={sari?.avatarSrc} alt="Sari" />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-ink-link">
                <MessageSquare className="size-3" />
                <span>TUTOR SOCRATIC • SARI</span>
              </div>
              <p className="mt-0.5 text-xs text-ink-secondary">
                &ldquo;Menurutmu, apa risiko kalau modul antrean disatukan tanpa MVC?&rdquo;
              </p>
            </div>
          </div>
        </div>
      )
  }
}

export function WeeklyCycleSection() {
  const [selectedId, setSelectedId] = useState<WeeklyCyclePhase["id"]>("capture")
  const activePhase =
    WEEKLY_CYCLES.find((phase) => phase.id === selectedId) ?? WEEKLY_CYCLES[0]

  return (
    <section id="cara-kerja" className="scroll-mt-20 py-14 sm:py-16">
      {/* Top Visual Story Bento (team-brain.com editorial photo cadence) */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-raised">
            <img
              src={TEAM_COLLAB_SCENE_SRC}
              alt="Empat mahasiswa Indonesia berkolaborasi tenang dengan laptop di ruang belajar kampus"
              className="aspect-video w-full object-cover outline-1 -outline-offset-1 outline-ink-primary/10"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle bg-surface/95 px-4 py-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <AvatarStack size={26}>
                  {DEMO_TEAM_MEMBERS.map((member) => (
                    <Avatar key={member.id}>
                      <AvatarImage src={member.avatarSrc} alt={member.name} />
                      <AvatarFallback className="text-[10px]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarStack>
                <span className="font-sans text-xs font-medium text-ink-primary">
                  Rani, Dimas, Budi &amp; Sari
                </span>
              </div>
              <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-sans text-[11px] font-medium text-text-info">
                IF2210 PBO • Minggu 3
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          <p className="font-sans text-xs font-semibold tracking-wider text-ink-tertiary uppercase">
            Siklus Mingguan BERSAMA
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.018em] text-ink-primary text-balance sm:text-3xl">
            Tangkap → Petakan → Uji Paham → Tutup Celah.
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary text-pretty sm:text-base">
            Kerja kelompok sering pecah jadi silo: satu orang paham backend, yang lain hanya mengejar deadline UI. BERSAMA menjaga diskusi mengalir sambil mendeteksi celah pemahaman sebelum presentasi.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-xl border border-line-subtle bg-surface p-3 shadow-surface">
              <p className="font-mono text-lg font-semibold tabular-nums text-ink-primary">
                ≤ 5 mnt
              </p>
              <p className="mt-0.5 text-[11px] text-ink-tertiary">Uji mingguan</p>
            </div>
            <div className="rounded-xl border border-line-subtle bg-surface p-3 shadow-surface">
              <p className="font-mono text-lg font-semibold tabular-nums text-ink-primary">
                0 Leak
              </p>
              <p className="mt-0.5 text-[11px] text-ink-tertiary">Target IFC M1</p>
            </div>
            <div className="rounded-xl border border-line-subtle bg-surface p-3 shadow-surface">
              <p className="font-mono text-lg font-semibold tabular-nums text-ink-primary">
                10 mnt
              </p>
              <p className="mt-0.5 text-[11px] text-ink-tertiary">Sesi pairing</p>
            </div>
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
                    ? "border-line-active bg-surface shadow-raised"
                    : "border-line-subtle bg-surface/80 shadow-surface hover:border-line-default"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "font-mono text-[11px] font-medium tabular-nums",
                      isSelected ? "text-ink-link" : "text-ink-tertiary"
                    )}
                  >
                    FASE {phase.step}
                  </span>
                  <span
                    className={cn(
                      "size-2 rounded-full transition-colors duration-150",
                      isSelected ? "bg-brand" : "bg-muted"
                    )}
                  />
                </div>
                <span className="mt-1.5 font-heading text-sm font-semibold text-ink-primary sm:text-base">
                  {phase.title}
                </span>
                <span className="mt-1 hidden text-xs leading-relaxed text-ink-secondary sm:block">
                  {phase.shortSummary}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 min-h-[250px] rounded-2xl border border-line-subtle bg-surface p-5 shadow-surface sm:p-6">
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
                  <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-info">
                    FASE {activePhase.step} • {activePhase.title.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                    {activePhase.formulaTag}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-semibold text-ink-primary sm:text-xl">
                  {activePhase.mechanismTitle}
                </h3>

                <p className="text-sm leading-relaxed text-ink-secondary text-pretty">
                  {activePhase.mechanismPlain}
                </p>

                <div className="pt-1">
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <Link to={activePhase.demoPath}>
                      {activePhase.demoCta}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-line-subtle bg-canvas/60 p-4 lg:col-span-6">
                <PhaseVisualDiagram phaseId={activePhase.id} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
