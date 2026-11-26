import { useState } from "react"
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { MemoryItem } from "@/types/bersama"
import avatarRani from "@/features/landing/assets/avatar-rani.jpg"
import avatarDimas from "@/features/landing/assets/avatar-dimas.jpg"
import avatarBudi from "@/features/landing/assets/avatar-budi.jpg"
import avatarSari from "@/features/landing/assets/avatar-sari.jpg"

const USER_AVATARS: Record<string, string> = {
  "user-rani": avatarRani,
  "user-dimas": avatarDimas,
  "user-budi": avatarBudi,
  "user-sari": avatarSari,
}

interface DecisionContextPanelProps {
  readonly decisionItem: MemoryItem | null
  readonly isStepCompleted: boolean
  readonly className?: string
}

export function DecisionContextPanel({
  decisionItem,
  isStepCompleted,
  className,
}: DecisionContextPanelProps) {
  const [peekUnlocked, setPeekUnlocked] = useState(false)

  if (!decisionItem) {
    return (
      <Card
        className={cn(
          "border border-line-subtle bg-surface p-5 text-center text-xs text-ink-tertiary shadow-surface",
          className,
        )}
      >
        Memuat konteks keputusan dari Project Brain...
      </Card>
    )
  }

  const isUnlocked = isStepCompleted || peekUnlocked

  // Resolve author/assignee
  const assigneeUser =
    SEED_USERS.find((u) => u.id === decisionItem.ownerId) ??
    SEED_USERS.find((u) => u.id === decisionItem.content.assigneeId) ??
    SEED_USERS[0]

  return (
    <Card
      className={cn(
        "overflow-hidden border border-line-subtle bg-surface shadow-surface transition-[border-color,box-shadow] duration-150 ease-out",
        className,
      )}
    >
      <CardHeader className="border-b border-line-subtle bg-canvas/30 p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-brand">
              {decisionItem.code}
            </span>
            <Badge
              variant="outline"
              className="border-success/40 bg-success-subtle font-mono text-[10px] text-text-success"
            >
              <ShieldCheck className="size-3 mr-1" />
              M2 TERKONFIRMASI
            </Badge>
          </div>

          <button
            type="button"
            onClick={() => setPeekUnlocked((prev) => !prev)}
            className="flex items-center gap-1 font-mono text-[11px] text-ink-tertiary hover:text-brand"
            title={isUnlocked ? "Sembunyikan detail" : "Buka contekan referensi"}
          >
            {isUnlocked ? (
              <>
                <EyeOff className="size-3" />
                <span>Kunci</span>
              </>
            ) : (
              <>
                <Eye className="size-3" />
                <span>Buka Contekan</span>
              </>
            )}
          </button>
        </div>

        <CardTitle className="font-heading pt-1.5 text-base font-semibold text-ink-primary">
          {decisionItem.content.title}
        </CardTitle>

        {/* Assignee / PIC info */}
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="size-5 border border-line-subtle">
            <AvatarImage
              src={USER_AVATARS[assigneeUser.id]}
              alt={assigneeUser.name}
              className="object-cover"
            />
            <AvatarFallback className="text-[9px] font-semibold">
              {assigneeUser.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-ink-secondary">
            PIC Keputusan: <strong>{assigneeUser.name}</strong>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 text-xs">
        {/* Ringkasan Keputusan */}
        <div className="space-y-1">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
            RINGKASAN KEPUTUSAN
          </span>
          <p className="leading-relaxed text-ink-primary">{decisionItem.content.summary}</p>
        </div>

        {/* Content Section: Open or Blurred */}
        {isUnlocked ? (
          <div className="space-y-3.5 animate-in fade-in-50 duration-200">
            {/* Rationale */}
            <div className="space-y-1 rounded-xl bg-canvas/40 p-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
                ALASAN & JUSTIFIKASI TEKNIS
              </span>
              <p className="leading-relaxed text-ink-secondary">
                {decisionItem.content.rationale}
              </p>
            </div>

            {/* Rejected Alternatives */}
            <div className="space-y-1.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
                ALTERNATIF YANG DITOLAK TIM
              </span>
              <div className="flex flex-wrap gap-1.5">
                {decisionItem.content.rejectedAlternatives.map((alt, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md border border-line-subtle bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-ink-secondary"
                  >
                    ✕ {alt}
                  </span>
                ))}
              </div>
            </div>

            {/* Provenance Footnote */}
            <div className="border-t border-line-subtle pt-2 text-[10px] text-ink-tertiary">
              <span className="font-medium text-ink-secondary">Asal-usul:</span>{" "}
              {decisionItem.provenance}
            </div>
          </div>
        ) : (
          /* Locked State Preview */
          <div className="relative rounded-xl border border-line-subtle bg-canvas/30 p-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted text-ink-tertiary">
                <Lock className="size-4" />
              </div>
              <p className="text-xs font-medium text-ink-secondary">
                Detail Alasan & Alternatif Terkunci
              </p>
              <p className="text-[11px] leading-relaxed text-ink-tertiary">
                Tantang dirimu untuk menjawab pertanyaan Socratic di sebelah kiri terlebih dahulu.
                Setelah selesai, detail keputusan akan terbuka penuh!
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPeekUnlocked(true)}
                  className="border-line-subtle text-xs"
                >
                  <Eye className="size-3 mr-1" />
                  Buka Contekan Referensi
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
