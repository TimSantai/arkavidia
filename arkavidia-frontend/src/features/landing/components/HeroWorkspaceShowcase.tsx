import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowRight,
  Brain,
  Lock,
  Mic,
  Network,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from "@/components/kibo-ui/cursor"
import { PillDelta } from "@/components/kibo-ui/pill"
import { Status, StatusIndicator, StatusLabel } from "@/components/kibo-ui/status"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  DEMO_TEAM_MEMBERS,
  HEATMAP_KCS,
  HEATMAP_MATRIX,
} from "../landingData"

type ShowcaseViewId = "ifc" | "explain" | "bus"

const SHOWCASE_VIEWS: readonly {
  readonly id: ShowcaseViewId
  readonly label: string
  readonly tag: string
  readonly route: string
  readonly routeLabel: string
}[] = [
  {
    id: "ifc",
    label: "Ruang Tim",
    tag: "M1/M2 IFC",
    route: "/teams/team-pbo-01/chat",
    routeLabel: "Buka Ruang Tim Demo",
  },
  {
    id: "explain",
    label: "Explain-Back",
    tag: "DEC-02",
    route: "/teams/team-pbo-01/check",
    routeLabel: "Coba Explain-Back Check",
  },
  {
    id: "bus",
    label: "Peta Pemahaman",
    tag: "BUS FACTOR: 1",
    route: "/teams/team-pbo-01/understanding",
    routeLabel: "Lihat Peta Pemahaman Tim",
  },
]

const MEMBER_MAP = new Map(DEMO_TEAM_MEMBERS.map((m) => [m.id, m]))

function getScoreStyle(score: number, isSiloCol?: boolean) {
  if (score >= 0.8) {
    return "bg-brand text-on-brand"
  }
  if (score >= 0.7) {
    return "bg-tertiary text-on-tertiary"
  }
  if (score >= 0.5) {
    return "bg-accent-violet text-on-accent"
  }
  if (isSiloCol) {
    return "bg-warning-subtle text-text-warning border border-line-default"
  }
  return "bg-canvas text-ink-secondary border border-line-subtle"
}

export function HeroWorkspaceShowcase() {
  const [activeView, setActiveView] = useState<ShowcaseViewId>("bus")
  const activeMeta =
    SHOWCASE_VIEWS.find((v) => v.id === activeView) ?? SHOWCASE_VIEWS[0]

  const rani = MEMBER_MAP.get("user-rani")
  const dimas = MEMBER_MAP.get("user-dimas")

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-line-subtle bg-surface shadow-raised overflow-hidden">
      {/* Top Browser/App Window Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle bg-canvas/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-muted" />
            <span className="size-2.5 rounded-full bg-muted" />
            <span className="size-2.5 rounded-full bg-muted" />
          </div>
          <span className="rounded-md border border-line-subtle bg-surface px-2.5 py-0.5 font-mono text-[11px] text-ink-tertiary">
            bersama.app / if2210-pbo / kelompok-4
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AvatarStack size={24}>
            {DEMO_TEAM_MEMBERS.map((member) => (
              <Avatar key={member.id}>
                <AvatarImage src={member.avatarSrc} alt={member.name} />
                <AvatarFallback className="bg-canvas text-[10px] font-medium text-ink-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarStack>

          <Status
            status="online"
            className="border border-line-subtle bg-surface px-2.5 py-0.5 font-mono text-[11px] font-medium"
          >
            <StatusIndicator />
            <StatusLabel className="text-ink-secondary">LIVE WORKSPACE</StatusLabel>
          </Status>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div
        role="tablist"
        aria-label="Pilih tampilan workspace BERSAMA"
        className="grid grid-cols-3 gap-1 border-b border-line-subtle bg-canvas/40 p-1.5 md:hidden"
      >
        {SHOWCASE_VIEWS.map((view) => {
          const isSelected = activeView === view.id
          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveView(view.id)}
              className={cn(
                "min-h-10 rounded-lg border px-2 py-1.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",
                isSelected
                  ? "border-line-subtle bg-surface text-ink-primary shadow-surface"
                  : "border-transparent text-ink-tertiary hover:text-ink-primary"
              )}
            >
              {view.label}
            </button>
          )
        })}
      </div>

      {/* 2-Pane Desktop Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-[224px_1fr]">
        {/* Left Sidebar */}
        <aside className="hidden flex-col justify-between border-r border-line-subtle bg-canvas/45 p-3 md:flex">
          <div className="space-y-3">
            <div className="rounded-lg border border-line-subtle bg-surface px-3 py-2">
              <p className="font-heading text-xs font-semibold text-ink-primary">
                Kelompok 4 • PBO
              </p>
              <p className="mt-0.5 font-sans text-[11px] text-ink-tertiary">
                Sistem Antrean Klinik
              </p>
            </div>

            <div role="tablist" aria-label="Modul workspace" className="space-y-1">
              {SHOWCASE_VIEWS.map((view) => {
                const isSelected = activeView === view.id
                return (
                  <button
                    key={view.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveView(view.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",
                      isSelected
                        ? "border-line-subtle bg-surface text-ink-primary shadow-surface"
                        : "border-transparent text-ink-secondary hover:bg-surface/60 hover:text-ink-primary"
                    )}
                  >
                    <span>{view.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-mono text-[9px]",
                        isSelected
                          ? "bg-brand/10 text-ink-link"
                          : "text-ink-tertiary"
                      )}
                    >
                      {view.tag}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-line-subtle pt-3">
            <p className="px-1 font-sans text-[11px] font-semibold text-ink-tertiary">
              Anggota Tim
            </p>
            <div className="space-y-1.5">
              {DEMO_TEAM_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1"
                >
                  <Avatar size="sm">
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback className="text-[10px]">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink-primary">
                      {member.shortName}
                    </p>
                    <p className="truncate font-sans text-[11px] text-ink-tertiary">
                      {member.roleLabel}
                    </p>
                  </div>
                  <span className="size-1.5 shrink-0 rounded-full bg-success" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Stage */}
        <div className="relative flex min-h-[400px] flex-col justify-between bg-canvas/25 p-4 sm:p-6">
          {/* Decorative live cursor in desktop corner */}
          <Cursor className="pointer-events-none absolute top-4 right-5 z-20 hidden lg:inline-flex">
            <CursorPointer className="text-ink-link" />
            <CursorBody className="border border-line-subtle bg-surface-raised text-ink-primary shadow-raised">
              <CursorName>Rani</CursorName>
              <CursorMessage>M1 Private Terisolasi</CursorMessage>
            </CursorBody>
          </Cursor>

          <AnimatePresence mode="wait">
            {activeView === "ifc" && (
              <motion.div
                key="ifc"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Chat Request */}
                <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface">
                  <Avatar>
                    <AvatarImage src={dimas?.avatarSrc} alt="Dimas Pratama" />
                    <AvatarFallback>DP</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-ink-primary">
                        Dimas Pratama
                      </span>
                      <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[10px] text-ink-tertiary">
                        RUANG TIM • M2
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-secondary">
                      &ldquo;@TeamAgent rangkum catatan pribadi Rani soal kenapa dia sempat ragu pakai MVC.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Visual 3-Node IFC Pipeline Diagram */}
                <div className="grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                  <div className="rounded-xl border border-line-subtle bg-surface p-3 text-center shadow-surface">
                    <Lock className="mx-auto size-4 text-ink-tertiary" />
                    <p className="mt-1 font-mono text-[11px] font-medium text-ink-primary">
                      M1 Rani Private
                    </p>
                    <p className="font-mono text-[10px] text-ink-tertiary">
                      scope: private
                    </p>
                  </div>

                  <div className="flex items-center justify-center font-mono text-xs font-semibold text-text-error">
                    <span className="rounded-full bg-error-subtle px-2 py-0.5">✕ BLOKIR</span>
                  </div>

                  <div className="rounded-xl border border-line-error/50 bg-error-subtle p-3 text-center">
                    <ShieldAlert className="mx-auto size-4 text-text-error" />
                    <p className="mt-1 font-mono text-[11px] font-semibold text-text-error">
                      RLS + Cedar Gate
                    </p>
                    <p className="font-mono text-[10px] text-text-error">
                      IFC DENY (Pre-LLM)
                    </p>
                  </div>

                  <div className="flex items-center justify-center font-mono text-xs text-ink-tertiary">
                    →
                  </div>

                  <div className="rounded-xl border border-line-subtle bg-surface p-3 text-center shadow-surface">
                    <Brain className="mx-auto size-4 text-ink-link" />
                    <p className="mt-1 font-mono text-[11px] font-medium text-ink-primary">
                      Team Agent
                    </p>
                    <p className="font-mono text-[10px] text-ink-tertiary">
                      Hanya baca M2
                    </p>
                  </div>
                </div>

                {/* Context Passport PII Preview Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line-subtle bg-surface p-3 shadow-surface">
                  <div className="flex items-center gap-2 text-xs text-ink-secondary">
                    <span className="rounded-full bg-warning-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-text-warning">
                      CONTEXT PASSPORT
                    </span>
                    <span>Berbagi M1 → M2 menyamarkan PII otomatis:</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="rounded bg-error-subtle px-1.5 py-0.5 text-text-error line-through">
                      13523042
                    </span>
                    <span className="text-ink-tertiary">→</span>
                    <span className="rounded bg-success-subtle px-1.5 py-0.5 text-text-success">
                      [NIM REDACTED]
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "explain" && (
              <motion.div
                key="explain"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-line-subtle bg-surface p-4 shadow-surface">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar>
                        <AvatarImage src={rani?.avatarSrc} alt="Rani Kusuma" />
                        <AvatarFallback>RK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-ink-primary">
                          Explain-Back Check • Rani Kusuma
                        </p>
                        <p className="font-mono text-[10px] text-ink-tertiary">
                          DEC-02 • KC-02 JWT vs Session
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 font-mono text-[10px] font-medium text-text-warning">
                        <Sparkles className="size-3" />
                        Item Dibantu AI
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-ink-tertiary">
                        02:14 / 05:00
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-ink-primary">
                    &ldquo;Kenapa tim memilih JWT stateless dibanding Cookie Session untuk antrean klinik?&rdquo;
                  </p>

                  {/* Mini Voice / Answer Bar */}
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-line-subtle bg-canvas/70 px-3 py-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                      <Mic className="size-3.5" />
                    </span>
                    <div className="flex h-5 flex-1 items-center gap-1" aria-hidden="true">
                      {[35, 70, 55, 90, 45, 80, 65, 95, 50, 75, 40, 60, 85, 50].map(
                        (h, idx) => (
                          <span
                            key={idx}
                            className="w-1 flex-1 rounded-full bg-brand/60"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-ink-tertiary">
                      Voice Note • 0:18
                    </span>
                  </div>
                </div>

                {/* Conformal Uncertainty Scale + Handoff Visual */}
                <div className="rounded-xl border border-line-default bg-warning-subtle/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-text-warning">
                      CONFORMAL ABSTAIN • s = 0.34 &gt; λ̂ (0.25)
                    </span>
                    <span className="font-mono text-[10px] text-text-warning">
                      α = 0.1 Risk Control
                    </span>
                  </div>

                  {/* Uncertainty Bar */}
                  <div className="relative mt-3 h-2.5 w-full rounded-full bg-surface">
                    <div className="h-full w-[34%] rounded-full bg-warning" />
                    <div
                      className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-ink-primary"
                      style={{ left: "25%" }}
                      title="Ambang batas λ̂"
                    />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-text-warning">
                    <span>0.0 Yakin</span>
                    <span>λ̂ = 0.25</span>
                    <span>1.0 Ragu</span>
                  </div>

                  {/* Peer Handoff Pill */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-line-subtle bg-surface px-3 py-2 text-xs text-ink-primary">
                    <Avatar size="sm">
                      <AvatarImage src={rani?.avatarSrc} alt="Rani" />
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Rani</span>
                    <ArrowRight className="size-3.5 text-ink-tertiary" />
                    <Avatar size="sm">
                      <AvatarImage src={dimas?.avatarSrc} alt="Dimas" />
                      <AvatarFallback>DP</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Dimas (Penulis DEC-02)</span>
                    <span className="font-mono text-[10px] text-ink-tertiary">
                      Peer Explanation
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "bus" && (
              <motion.div
                key="bus"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]"
              >
                {/* 4x4 Knowledge Coverage Heatmap Matrix */}
                <div className="rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface">
                  <div className="flex items-center justify-between gap-2 pb-2.5">
                    <p className="font-heading text-xs font-semibold text-ink-primary">
                      Peta Penguasaan Tim P(L)
                    </p>
                    <span className="font-mono text-[10px] tabular-nums text-ink-tertiary">
                      Threshold τ = 0.70
                    </span>
                  </div>

                  <div className="grid grid-cols-[100px_repeat(4,1fr)] items-center gap-1.5 text-center">
                    <div />
                    {HEATMAP_KCS.map((kc) => (
                      <div key={kc.code} className="space-y-0.5 pb-1">
                        <p className="font-mono text-[10px] font-semibold text-ink-primary">
                          {kc.code}
                        </p>
                        <p className="truncate text-[10px] text-ink-tertiary">
                          {kc.shortLabel}
                        </p>
                      </div>
                    ))}

                    {HEATMAP_MATRIX.map((row) => {
                      const member = MEMBER_MAP.get(row.memberId)
                      return (
                        <div key={row.memberId} className="contents">
                          <div className="flex items-center gap-2 pr-1 text-left">
                            <Avatar size="sm">
                              <AvatarImage
                                src={member?.avatarSrc}
                                alt={member?.name}
                              />
                              <AvatarFallback>{member?.initials}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-xs font-medium text-ink-primary">
                              {member?.shortName}
                            </span>
                          </div>

                          {row.scores.map((score, idx) => {
                            const col = HEATMAP_KCS[idx]
                            return (
                              <div
                                key={`${row.memberId}-${col.code}`}
                                className={cn(
                                  "rounded-lg py-2 font-mono text-[11px] font-semibold tabular-nums",
                                  getScoreStyle(score, col.isSilo)
                                )}
                              >
                                {Math.round(score * 100)}%
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bus Factor Gauge + Pairing Recommendation */}
                <div className="flex flex-col justify-between gap-3">
                  <div className="rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-error-subtle px-2.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-text-error">
                        BUS FACTOR: 1
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-ink-tertiary">
                        Gini 0.42
                      </span>
                    </div>

                    {/* SVG Semi-Circular Gauge */}
                    <div className="mt-2 flex items-center gap-3">
                      <svg viewBox="0 0 120 68" className="h-14 w-24 shrink-0" aria-hidden="true">
                        <path
                          d="M 14 58 A 46 46 0 0 1 106 58"
                          fill="none"
                          stroke="var(--border-subtle)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 14 58 A 46 46 0 0 1 42 18"
                          fill="none"
                          stroke="var(--bg-accent)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <text
                          x="60"
                          y="54"
                          textAnchor="middle"
                          fill="currentColor"
                          className="font-mono text-[18px] font-semibold"
                        >
                          1 / 4
                        </text>
                      </svg>
                      <p className="text-xs leading-snug text-ink-secondary">
                        KC-02 JWT hanya dikuasai 1 anggota (silo risiko tinggi).
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-text-warning">
                        <Network className="size-3.5" />
                        SARAN PAIRING 10 MNT
                      </span>
                      <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold tabular-nums text-text-success">
                        <PillDelta delta={25} />
                        +25%
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarImage src={dimas?.avatarSrc} alt="Dimas" />
                        <AvatarFallback>DP</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-ink-primary">
                        Dimas
                      </span>
                      <span className="font-mono text-xs text-ink-tertiary">↔</span>
                      <Avatar size="sm">
                        <AvatarImage src={rani?.avatarSrc} alt="Rani" />
                        <AvatarFallback>RK</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-ink-primary">
                        Rani
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3">
            <span className="font-sans text-xs text-ink-tertiary">
              Klik tab di samping untuk simulasi 3 mekanisme inti
            </span>
            <Link
              to={activeMeta.route}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-link hover:underline"
            >
              {activeMeta.routeLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
