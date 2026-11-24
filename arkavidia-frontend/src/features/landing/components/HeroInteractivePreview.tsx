import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowRight,
  Brain,
  Lock,
  Network,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Status, StatusIndicator, StatusLabel } from "@/components/kibo-ui/status"
import { cn } from "@/lib/utils"

type PreviewTabId = "ifc" | "explain" | "bus"

const PREVIEW_TABS: readonly {
  readonly id: PreviewTabId
  readonly label: string
  readonly fullLabel: string
}[] = [
  { id: "ifc", label: "M1 vs M2", fullLabel: "M1 vs M2 Guardrail" },
  { id: "explain", label: "Explain-Back", fullLabel: "Explain-Back & Abstention" },
  { id: "bus", label: "Bus Factor", fullLabel: "Knowledge Bus Factor" },
]

export function HeroInteractivePreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabId>("ifc")

  return (
    <div className="rounded-2xl border border-line-subtle bg-surface p-2 shadow-raised">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2">
        <span className="font-mono text-[11px] font-medium text-ink-tertiary">
          IF2210 PBO • Kelompok 4
        </span>
        <Status
          status="online"
          className="border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium"
        >
          <StatusIndicator />
          <StatusLabel className="text-ink-secondary">LIVE DEMO</StatusLabel>
        </Status>
      </div>

      <div
        role="tablist"
        aria-label="Pratinjau mekanisme BERSAMA"
        className="grid grid-cols-3 gap-1 rounded-xl border border-line-subtle bg-canvas p-1"
      >
        {PREVIEW_TABS.map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={tab.fullLabel}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-h-10 rounded-lg border px-2 py-1.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-out sm:px-3",
                isSelected
                  ? "border-line-subtle bg-surface text-ink-primary shadow-surface"
                  : "border-transparent text-ink-tertiary hover:text-ink-primary"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-2 min-h-[340px] rounded-xl border border-line-subtle bg-canvas/70 p-4 sm:min-h-[320px]">
        <AnimatePresence mode="wait">
          {activeTab === "ifc" && (
            <motion.div
              key="ifc"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex min-h-[306px] flex-col justify-between gap-4 sm:min-h-[286px]"
            >
              <div className="space-y-3">
                <div className="rounded-lg border border-line-subtle bg-surface p-3 shadow-surface">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ink-primary">
                      Dimas Pratama
                    </span>
                    <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[10px] text-ink-tertiary">
                      RUANG TIM • M2
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                    &ldquo;@TeamAgent tolong rangkum catatan pribadi Rani soal kenapa dia sempat ragu pakai MVC.&rdquo;
                  </p>
                </div>

                <div className="rounded-lg border border-line-error/40 bg-error-subtle p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <ShieldAlert className="size-4 shrink-0 text-text-error" />
                    <span className="font-mono text-[11px] font-semibold text-text-error">
                      IFC DENY
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-line-error/40 bg-surface px-2 py-0.5 font-mono text-[10px] font-medium text-text-error">
                      <Lock className="size-2.5" />
                      M1 PRIVATE
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-primary sm:text-[13px]">
                    Query diblokir oleh Postgres RLS + Cedar Policy sebelum mencapai LLM. Catatan pribadi Rani tidak dapat diakses Team Agent tanpa berbagi eksplisit melalui Context Passport.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line-subtle pt-3">
                <span className="font-mono text-[11px] text-ink-tertiary">
                  0 kasus kebocoran M1 → M2
                </span>
                <Link
                  to="/teams/team-pbo-01/chat"
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-link hover:underline"
                >
                  Uji IFC Block di Ruang Tim
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === "explain" && (
            <motion.div
              key="explain"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex min-h-[306px] flex-col justify-between gap-4 sm:min-h-[286px]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-line-subtle bg-surface px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-primary">
                      DEC-02
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-warning">
                      <Sparkles className="size-3" />
                      Item Dibantu AI
                    </span>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-ink-tertiary">
                    ≤ 5 mnt
                  </span>
                </div>

                <div className="rounded-lg border border-line-subtle bg-surface p-3 shadow-surface">
                  <div className="flex items-start gap-2">
                    <Brain className="mt-0.5 size-4 shrink-0 text-ink-link" />
                    <p className="text-sm font-medium leading-snug text-ink-primary">
                      &ldquo;Kenapa tim memakai JWT stateless, bukan Cookie Session, untuk sistem antrean klinik?&rdquo;
                    </p>
                  </div>
                  <p className="mt-2 border-l-2 border-line-default pl-2.5 text-xs italic text-ink-secondary">
                    Draft jawaban Rani: &ldquo;Supaya lebih modern dan cepat untuk API.&rdquo;
                  </p>
                </div>

                <div className="rounded-lg border border-line-default bg-warning-subtle/80 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-text-warning">
                      CONFORMAL ABSTAIN • s = 0.34 &gt; λ̂
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-primary sm:text-[13px]">
                    Ketidakpastian grader tinggi (argumen stateless &amp; multi-klien belum lengkap). Sistem menahan skor otomatis dan meneruskan ke Dimas untuk peer explanation.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line-subtle pt-3">
                <span className="font-mono text-[11px] text-ink-tertiary">
                  IRT 2PL • Prioritas tinggi
                </span>
                <Link
                  to="/teams/team-pbo-01/check"
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-link hover:underline"
                >
                  Coba Explain-Back Check
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === "bus" && (
            <motion.div
              key="bus"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex min-h-[306px] flex-col justify-between gap-4 sm:min-h-[286px]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-error-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-text-error">
                    BUS FACTOR: 1
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-ink-tertiary">
                    <span>Gini 0.42</span>
                    <span>•</span>
                    <span>4 Anggota</span>
                  </div>
                </div>

                <div className="space-y-2.5 rounded-lg border border-line-subtle bg-surface p-3 shadow-surface">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink-primary">
                        KC-01 Arsitektur MVC
                      </span>
                      <span className="font-mono tabular-nums text-ink-secondary">3/4</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-brand" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-ink-primary">
                        KC-02 JWT vs Session
                        <span className="rounded-full bg-warning-subtle px-1.5 py-0.5 font-mono text-[10px] font-medium text-text-warning">
                          SILO
                        </span>
                      </span>
                      <span className="font-mono tabular-nums text-text-warning">1/4</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/4 rounded-full bg-accent-violet" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink-primary">
                        KC-03 Skema Antrean
                      </span>
                      <span className="font-mono tabular-nums text-ink-secondary">2/4</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-2/4 rounded-full bg-tertiary" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-line-subtle bg-surface p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-text-warning">
                    <Network className="size-3.5" />
                    SILO ALERT • SARAN PAIRING
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-primary sm:text-[13px]">
                    <span className="font-semibold">Dimas ↔ Rani (10 mnt)</span> — Sesi &ldquo;Jelaskan ke aku&rdquo; untuk KC-02 menaikkan coverage +25%.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line-subtle pt-3">
                <span className="font-mono text-[11px] text-ink-tertiary">
                  Submodular Coverage Optimizer
                </span>
                <Link
                  to="/teams/team-pbo-01/understanding"
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-link hover:underline"
                >
                  Buka Peta Pemahaman Tim
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
