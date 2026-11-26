import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowRight,
  Bot,
  HelpCircle,
  Lock,
  Mic,
  Network,
  ShieldAlert,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from "@/components/kibo-ui/cursor"
import { PillDelta } from "@/components/kibo-ui/pill"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  HEATMAP_KCS,
  HEATMAP_MATRIX,
} from "../landingData"

type ShowcaseViewId = "ifc" | "explain" | "bus"

const SHOWCASE_VIEWS: readonly {
  readonly id: ShowcaseViewId
  readonly label: string
  readonly tag: string
  readonly roomToneClass: string
  readonly route: string
  readonly routeLabel: string
}[] = [
  {
    id: "ifc",
    label: "Ruang Tim",
    tag: "M1/M2 IFC",
    roomToneClass: "bg-wash-brand text-ink-link",
    route: "/teams/team-pbo-01/chat",
    routeLabel: "Buka Ruang Tim Demo",
  },
  {
    id: "explain",
    label: "Explain-Back",
    tag: "DEC-02",
    roomToneClass: "bg-wash-brand text-ink-link",
    route: "/teams/team-pbo-01/check",
    routeLabel: "Coba Explain-Back Check",
  },
  {
    id: "bus",
    label: "Peta Pemahaman",
    tag: "Bus Factor: 1",
    roomToneClass: "bg-wash-brand text-ink-link",
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
    return "bg-brand text-on-brand"
  }
  if (score >= 0.5) {
    return "bg-brand text-on-brand"
  }
  if (isSiloCol) {
    return "bg-warning-subtle text-text-warning border border-line-default"
  }
  return "bg-surface-card text-ink-secondary border border-line-subtle"
}

export function HeroWorkspaceShowcase() {
  const [activeView, setActiveView] = useState<ShowcaseViewId>("bus")
  const activeMeta =
    SHOWCASE_VIEWS.find((v) => v.id === activeView) ?? SHOWCASE_VIEWS[0]

  const rani = MEMBER_MAP.get("user-rani")
  const dimas = MEMBER_MAP.get("user-dimas")

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle bg-surface-card/70 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-muted" />
            <span className="size-2.5 rounded-full bg-muted" />
            <span className="size-2.5 rounded-full bg-muted" />
          </div>
          <span className="rounded-md border border-line-subtle bg-surface-card px-2.5 py-0.5 font-sans text-xs text-ink-secondary">
            bersama.app / if2210-pbo / kelompok-4
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AvatarStack size={24}>
            {DEMO_TEAM_MEMBERS.map((member) => (
              <Avatar key={member.id}>
                <AvatarImage src={member.avatarSrc} alt={member.name} />
                <AvatarFallback className="bg-surface-card text-xs font-medium text-ink-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarStack>

          <span className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-card px-2.5 py-0.5 font-sans text-xs font-medium text-ink-secondary shadow-badge">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            <span>Live Demo</span>
          </span>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div
        role="tablist"
        aria-label="Pilih tampilan workspace BERSAMA"
        className="grid grid-cols-3 gap-1 border-b border-line-subtle bg-well/70 p-1.5 md:hidden"
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
                  ? "border-line-subtle bg-surface-card text-ink-primary shadow-card"
                  : "border-transparent text-ink-secondary hover:text-ink-primary"
              )}
            >
              {view.label}
            </button>
          )
        })}
      </div>

      {/* 2-Pane Desktop Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden flex-col justify-between border-r border-line-subtle bg-well/65 p-3 md:flex">
          <div className="space-y-3">
            <div className="rounded-xl border border-line-subtle bg-surface-card px-3 py-2.5 shadow-card">
              <p className="font-sans text-xs font-semibold text-ink-primary">
                Kelompok 4 · PBO
              </p>
              <p className="mt-0.5 font-sans text-xs text-ink-secondary">
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
                      "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",
                      isSelected
                        ? "border-line-subtle bg-surface-card text-ink-primary shadow-card"
                        : "border-transparent text-ink-secondary hover:bg-surface-card/60 hover:text-ink-primary"
                    )}
                  >
                    <span className="truncate">{view.label}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 font-sans text-xs font-medium tabular-nums",
                        isSelected
                          ? view.roomToneClass
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
            <p className="px-1 font-sans text-xs font-semibold text-ink-secondary">
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
                    <AvatarFallback className="text-xs font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink-primary">
                      {member.shortName}
                    </p>
                    <p className="truncate font-sans text-xs text-ink-tertiary">
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
        <div className="relative flex min-h-[400px] flex-col justify-between bg-canvas/55 p-4 sm:p-6">
          <Cursor className="pointer-events-none absolute top-4 right-5 z-20 hidden lg:inline-flex">
            <CursorPointer className="text-ink-link" />
            <CursorBody className="border border-line-subtle bg-surface-raised text-ink-primary shadow-raised">
              <CursorName>Rani</CursorName>
              <CursorMessage className="text-ink-secondary">
                M1 Private Terisolasi
              </CursorMessage>
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
                <div className="flex items-start gap-3 rounded-xl border border-brand-subtle bg-wash-brand p-3.5 shadow-card">
                  <Avatar>
                    <AvatarImage src={dimas?.avatarSrc} alt="Dimas Pratama" />
                    <AvatarFallback className="text-xs">DP</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-ink-primary">
                        Dimas Pratama
                      </span>
                      <span className="rounded-full border border-brand-subtle bg-surface-card px-2.5 py-0.5 font-sans text-xs font-medium text-ink-link">
                        Ruang Tim · M2
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-secondary">
                      &ldquo;@TeamAgent rangkum catatan pribadi Rani soal kenapa dia sempat ragu pakai MVC.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Visual 3-Node IFC Pipeline Diagram */}
                <div className="grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                  <div className="flex flex-col items-center rounded-xl border border-brand-subtle bg-wash-brand p-3 text-center shadow-card">
                    <AgentStickerAvatar
                      role="private"
                      state="idle"
                      size={36}
                      interactive={false}
                    />
                    <p className="mt-2 inline-flex items-center gap-1 font-sans text-xs font-semibold text-ink-primary">
                      <Lock className="size-3.5 text-ink-link" aria-hidden="true" />
                      M1 Rani Private
                    </p>
                    <p className="font-sans text-xs text-ink-link">
                      Terenkripsi
                    </p>
                  </div>

                  <div className="flex items-center justify-center font-sans text-xs font-semibold text-text-error">
                    <span className="rounded-full bg-error-subtle px-2.5 py-1">
                      Blokir
                    </span>
                  </div>

                  <div className="rounded-xl border border-line-error/50 bg-error-subtle p-3 text-center">
                    <ShieldAlert
                      className="mx-auto size-5 text-text-error"
                      aria-hidden="true"
                    />
                    <p className="mt-1.5 font-sans text-xs font-semibold text-text-error">
                      IFC Gate (Pre-LLM)
                    </p>
                    <p className="font-sans text-xs text-text-error">
                      Akses M1 Ditolak
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-center font-sans text-xs text-ink-secondary"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" />
                  </div>

                  <div className="flex flex-col items-center rounded-xl border border-brand-subtle bg-wash-brand p-3 text-center shadow-card">
                    <AgentStickerAvatar
                      role="team"
                      state="blocked"
                      size={36}
                      interactive={false}
                    />
                    <p className="mt-2 font-sans text-xs font-semibold text-ink-primary">
                      Team Agent
                    </p>
                    <p className="font-sans text-xs text-ink-link">
                      Hanya baca M2
                    </p>
                  </div>
                </div>

                {/* Context Passport PII Preview Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line-subtle bg-surface-card p-3 shadow-card">
                  <div className="flex items-center gap-2 text-xs text-ink-secondary">
                    <span className="rounded-full bg-warning-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-warning">
                      Context Passport
                    </span>
                    <span>Masking PII saat berbagi M1 ke M2:</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-xs tabular-nums">
                    <span className="rounded bg-error-subtle px-2 py-0.5 text-text-error line-through">
                      13523042
                    </span>
                    <ArrowRight className="size-3 text-ink-tertiary" aria-hidden="true" />
                    <span className="rounded bg-success-subtle px-2 py-0.5 font-medium text-text-success">
                      [NIM Redacted]
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
                <div className="rounded-xl border border-brand-subtle bg-wash-brand p-4 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar>
                        <AvatarImage src={rani?.avatarSrc} alt="Rani Kusuma" />
                        <AvatarFallback className="text-xs">RK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-ink-primary">
                          Explain-Back · Rani Kusuma
                        </p>
                        <p className="font-sans text-xs text-ink-secondary">
                          DEC-02 · KC-02 JWT vs Session
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 font-sans text-xs font-medium text-text-warning">
                        <Bot className="size-3.5" aria-hidden="true" />
                        Item Dibantu AI
                      </span>
                      <span className="font-sans text-xs font-medium tabular-nums text-ink-secondary">
                        02:14 / 05:00
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-ink-primary">
                    &ldquo;Kenapa tim memilih JWT stateless dibanding Cookie Session untuk antrean klinik?&rdquo;
                  </p>

                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-line-subtle bg-surface-card px-3 py-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                      <Mic className="size-3.5" aria-hidden="true" />
                    </span>
                    <div
                      className="flex h-5 flex-1 items-center gap-1"
                      aria-hidden="true"
                    >
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
                    <span className="font-sans text-xs tabular-nums text-ink-secondary">
                      Voice · 0:18
                    </span>
                  </div>
                </div>

                {/* Conformal Uncertainty Scale + Handoff Visual */}
                <div className="rounded-xl border border-line-default bg-warning-subtle/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AgentStickerAvatar
                        role="tutor"
                        state="nudge"
                        size={32}
                        interactive={false}
                      />
                      <span className="font-sans text-xs font-semibold text-text-warning">
                        Grader Ragu · Dialihkan ke Rekan
                      </span>
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Detail ambang Conformal Abstention"
                          className="inline-flex size-7 items-center justify-center rounded-full border border-line-default bg-surface-card text-ink-secondary shadow-control transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <HelpCircle className="size-3.5" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <PopoverHeader>
                          <PopoverTitle>Conformal Risk Control</PopoverTitle>
                          <PopoverDescription>
                            Skor ketidakpastian s = 0.34 melampaui ambang kalibrasi
                            lambda = 0.25 (alpha = 0.10). Sistem abstain dan
                            mengajak diskusi rekan alih-alih memberi skor keliru.
                          </PopoverDescription>
                        </PopoverHeader>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="relative mt-3 h-2.5 w-full rounded-full bg-surface-card">
                    <div className="h-full w-[34%] rounded-full bg-warning" />
                    <div
                      className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-ink-primary"
                      style={{ left: "25%" }}
                      title="Ambang batas risiko"
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between font-sans text-xs tabular-nums text-text-warning">
                    <span>Yakin</span>
                    <span>Ambang</span>
                    <span>Ragu</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-line-subtle bg-surface-card px-3 py-2 text-xs text-ink-primary">
                    <Avatar size="sm">
                      <AvatarImage src={rani?.avatarSrc} alt="Rani" />
                      <AvatarFallback className="text-xs">RK</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Rani</span>
                    <ArrowRight
                      className="size-3.5 text-ink-tertiary"
                      aria-hidden="true"
                    />
                    <Avatar size="sm">
                      <AvatarImage src={dimas?.avatarSrc} alt="Dimas" />
                      <AvatarFallback className="text-xs">DP</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Dimas (Penulis DEC-02)</span>
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
                <div className="rounded-xl border border-line-subtle bg-surface-card p-3.5 shadow-card">
                  <div className="flex items-center justify-between gap-2 pb-2.5">
                    <p className="font-sans text-xs font-semibold text-ink-primary">
                      Peta Penguasaan Tim
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Metodologi skor penguasaan tim"
                          className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2 py-0.5 font-sans text-xs font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <span>Target 70%</span>
                          <HelpCircle className="size-3" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <PopoverHeader>
                          <PopoverTitle>Threshold Penguasaan BKT</PopoverTitle>
                          <PopoverDescription>
                            Anggota dinyatakan menguasai topik bila probabilitas
                            penguasaan P(L) mencapai ambang tau = 0.70.
                          </PopoverDescription>
                        </PopoverHeader>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="grid min-w-[400px] grid-cols-[96px_repeat(4,1fr)] items-center gap-1.5 text-center">
                      <div />
                      {HEATMAP_KCS.map((kc) => (
                        <div key={kc.code} className="space-y-0.5 pb-1">
                          <p className="font-sans text-xs font-semibold text-ink-primary">
                            {kc.code}
                          </p>
                          <p className="truncate font-sans text-xs text-ink-secondary">
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
                                <AvatarFallback className="text-xs">
                                  {member?.initials}
                                </AvatarFallback>
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
                                    "rounded-lg py-2 font-sans text-xs font-semibold tabular-nums",
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
                </div>

                {/* Bus Factor Gauge + Pairing Recommendation */}
                <div className="flex flex-col justify-between gap-3">
                  <div className="rounded-xl border border-line-subtle bg-surface-card p-3.5 shadow-card">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-error-subtle px-2.5 py-0.5 font-sans text-xs font-semibold tabular-nums text-text-error">
                        Bus Factor: 1
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            aria-label="Detail metrik Bus Factor dan Gini"
                            className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2 py-0.5 font-sans text-xs tabular-nums text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            <span>Gini 0.42</span>
                            <HelpCircle className="size-3" aria-hidden="true" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72">
                          <PopoverHeader>
                            <PopoverTitle>Deteksi Silo Pengetahuan</PopoverTitle>
                            <PopoverDescription>
                              Knowledge Bus Factor = 1 berarti kehilangan 1
                              anggota membuat cakupan topik tim turun di bawah
                              50%. Indeks Gini 0.42 menandai ketimpangan
                              penguasaan.
                            </PopoverDescription>
                          </PopoverHeader>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="mt-2.5 flex items-center gap-3">
                      <svg
                        viewBox="0 0 120 70"
                        className="h-16 w-24 shrink-0"
                        aria-hidden="true"
                      >
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
                          y="56"
                          textAnchor="middle"
                          fill="currentColor"
                          className="kpi-hero text-xl font-semibold"
                        >
                          1 / 4
                        </text>
                      </svg>
                      <p className="text-xs leading-snug text-ink-secondary">
                        KC-02 JWT baru dikuasai 1 anggota.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-brand-subtle bg-wash-brand p-3.5 shadow-card">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-ink-link">
                        <Network className="size-3.5" aria-hidden="true" />
                        Saran Pairing 10 mnt
                      </span>
                      <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold tabular-nums text-text-success">
                        <PillDelta delta={25} />
                        +25%
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarImage src={dimas?.avatarSrc} alt="Dimas" />
                          <AvatarFallback className="text-xs">DP</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-ink-primary">
                          Dimas
                        </span>
                        <ArrowRight
                          className="size-3.5 text-ink-tertiary"
                          aria-hidden="true"
                        />
                        <Avatar size="sm">
                          <AvatarImage src={rani?.avatarSrc} alt="Rani" />
                          <AvatarFallback className="text-xs">RK</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-ink-primary">
                          Rani
                        </span>
                      </div>
                      <AgentStickerAvatar
                        role="tutor"
                        state="warning"
                        size={32}
                        interactive={false}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action Strip */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-line-subtle pt-3">
            <span className="font-sans text-xs font-medium text-ink-secondary">
              {activeMeta.label} · {activeMeta.tag}
            </span>
            <Link
              to={activeMeta.route}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-link hover:underline"
            >
              {activeMeta.routeLabel}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
