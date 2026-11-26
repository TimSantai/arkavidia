import { Link } from "react-router"
import { ArrowRight, ArrowUpRight, HelpCircle, Lock, ShieldOff, X } from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

interface IfcBlockedCardProps {
  readonly teamId: string
}

export function IfcBlockedCard({ teamId }: IfcBlockedCardProps) {
  return (
    <div className="mt-2 rounded-2xl border border-line-error/50 bg-error-subtle/80 p-4 text-text-error shadow-card">
      {/* Header Row with Blocked Agent Sticker + ? Info Popover */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <AgentStickerAvatar
            role="team"
            state="blocked"
            size={36}
            interactive={false}
            label="Team Agent memblokir akses M1"
          />
          <div>
            <p className="text-sm font-semibold text-text-error">
              Akses M1 Ditolak
            </p>
            <p className="text-xs text-ink-secondary">
              Gerbang RLS &amp; Cedar aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-line-error/30 bg-surface-card px-2.5 py-0.5 text-xs font-semibold text-text-error shadow-badge">
            IFC · Zero-Leak
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Penjelasan blokir IFC dan UU PDP"
                className="rounded-full border-line-error/30 bg-surface-card text-text-error hover:bg-surface-top"
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <PopoverHeader>
                <PopoverTitle>Information-Flow Control (M1 &rarr; M2)</PopoverTitle>
                <PopoverDescription>
                  Sesuai aturan RLS dan Cedar Policy, memori pribadi (M1) berlabel
                  private disaring sebelum prompt dikirim ke LLM untuk menjaga
                  privasi dan kepatuhan UU PDP.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Compact Visual 3-Node Firewall Diagram */}
      <div className="mt-3 grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="flex items-center gap-2 rounded-xl border border-line-subtle bg-surface-card px-3 py-2 text-ink-primary">
          <Lock className="size-3.5 shrink-0 text-ink-violet" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">M1 Pribadi</p>
            <p className="text-xs text-ink-tertiary">Terkunci</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-line-error/30 bg-surface-card px-2.5 py-0.5 text-xs font-semibold text-text-error shadow-badge">
            <X className="size-3" aria-hidden="true" />
            Ditolak
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-line-error/40 bg-surface-card px-3 py-2 text-text-error">
          <ShieldOff className="size-3.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">RLS + Cedar</p>
            <p className="text-xs text-ink-secondary">Filter Pre-LLM</p>
          </div>
        </div>

        <div className="flex items-center justify-center text-text-error">
          <ArrowRight className="size-4" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-brand-subtle bg-surface-card px-3 py-2 text-ink-primary">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Konteks LLM</p>
            <p className="text-xs text-ink-link">Hanya M2</p>
          </div>
        </div>
      </div>

      {/* Concise 1-Line Guidance + Link */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-primary">
        <span>
          Berbagi catatan pribadi hanya sah lewat Context Passport.
        </span>
        <Link
          to={`/teams/${teamId}/private`}
          className="inline-flex shrink-0 items-center gap-1 font-semibold text-ink-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span>Context Passport</span>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
