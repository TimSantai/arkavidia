import { Link } from "react-router"
import { ArrowUpRight, Lock, ShieldAlert, ShieldOff } from "lucide-react"

interface IfcBlockedCardProps {
  readonly teamId: string
}

export function IfcBlockedCard({ teamId }: IfcBlockedCardProps) {
  return (
    <div className="mt-2 rounded-xl border border-line-error bg-error-subtle p-3.5 text-text-error">
      {/* Top Badge Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <ShieldAlert className="size-4 shrink-0" />
          <span className="font-mono text-[11px] font-semibold">
            IFC BLOCKED · RLS + CEDAR
          </span>
        </div>
        <span className="rounded-full border border-line-error/40 bg-surface px-2 py-0.5 font-mono text-[10px] font-medium text-text-error">
          ZERO-LEAK M1
        </span>
      </div>

      {/* Compact Visual 3-Node Firewall Diagram */}
      <div className="mt-3 grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="flex items-center gap-2 rounded-lg border border-line-subtle bg-surface px-2.5 py-2 text-ink-primary">
          <Lock className="size-3.5 shrink-0 text-ink-tertiary" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">M1 Ruang Pribadi</p>
            <p className="font-mono text-[10px] text-ink-tertiary">scope: private</p>
          </div>
        </div>

        <div className="flex items-center justify-center font-mono text-[11px] font-semibold text-text-error">
          <span className="rounded-full bg-surface px-2 py-0.5">✕ DENY</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-line-error/50 bg-surface px-2.5 py-2 text-text-error">
          <ShieldOff className="size-3.5 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">RLS + Cedar Gate</p>
            <p className="font-mono text-[10px]">Pre-LLM Filter</p>
          </div>
        </div>

        <div className="flex items-center justify-center font-mono text-xs text-text-error">
          →
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-line-subtle bg-surface px-2.5 py-2 text-ink-secondary">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink-primary">
              Prompt LLM Bersih
            </p>
            <p className="font-mono text-[10px] text-ink-tertiary">
              Hanya memori M2
            </p>
          </div>
        </div>
      </div>

      {/* 1 Concise Sentence + Link to Context Passport */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-primary">
        <span>
          Memori M1 anggota lain ditolak sebelum masuk konteks LLM; berbagi hanya sah lewat Context Passport.
        </span>
        <Link
          to={`/teams/${teamId}/private`}
          className="inline-flex shrink-0 items-center gap-1 font-medium text-ink-link hover:underline"
        >
          <span>Cek Context Passport</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
