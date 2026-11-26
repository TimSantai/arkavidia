import { useState } from "react"
import { Eye, EyeOff, HelpCircle, Lock, ShieldCheck, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { MemoryItem } from "@/types/bersama"

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
          "border-line-subtle bg-surface-card p-5 text-center text-xs text-ink-tertiary shadow-card",
          className,
        )}
      >
        Memuat konteks keputusan...
      </Card>
    )
  }

  const isUnlocked = isStepCompleted || peekUnlocked

  const assigneeUser =
    SEED_USERS.find((u) => u.id === decisionItem.ownerId) ??
    SEED_USERS.find((u) => u.id === decisionItem.content.assigneeId) ??
    SEED_USERS[0]

  return (
    <Card
      className={cn(
        "overflow-hidden border-line-subtle bg-surface-card py-0 shadow-card transition-[border-color,box-shadow] duration-150 ease-out",
        className,
      )}
    >
      <CardHeader className="border-b border-line-subtle bg-wash-cyan/45 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-cyan">
              {decisionItem.code}
            </span>
            <Badge
              variant="outline"
              className="gap-1 border-success/40 bg-success-subtle text-xs font-medium text-text-success"
            >
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              <span>M2 Terkonfirmasi</span>
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Info asal-usul keputusan"
                  className="inline-flex size-7 items-center justify-center rounded-full text-ink-secondary transition-[background-color,color] duration-150 hover:bg-muted hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <PopoverHeader>
                  <PopoverTitle>Asal-Usul Keputusan</PopoverTitle>
                  <PopoverDescription className="text-ink-secondary">
                    {decisionItem.provenance}
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => setPeekUnlocked((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface-card px-2.5 py-1 text-xs font-medium text-ink-secondary transition-[background-color,color,border-color] duration-150 hover:border-line-default hover:text-ink-primary"
            >
              {isUnlocked ? (
                <>
                  <EyeOff className="size-3.5" aria-hidden="true" />
                  <span>Kunci</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5" aria-hidden="true" />
                  <span>Intip</span>
                </>
              )}
            </button>
          </div>
        </div>

        <CardTitle className="font-sans pt-1.5 text-base font-semibold text-ink-primary">
          {decisionItem.content.title}
        </CardTitle>

        <div className="flex items-center gap-2 pt-1">
          <Avatar className="size-6 border border-line-subtle">
            <AvatarImage
              src={USER_AVATAR_MAP[assigneeUser.id]}
              alt={assigneeUser.name}
              className="object-cover"
            />
            <AvatarFallback className="text-xs font-semibold">
              {assigneeUser.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-ink-secondary">
            PIC: <strong className="text-ink-primary">{assigneeUser.name}</strong>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 text-xs">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-ink-tertiary">
            Ringkasan
          </span>
          <p className="text-sm leading-relaxed text-ink-primary">
            {decisionItem.content.summary}
          </p>
        </div>

        {isUnlocked ? (
          <div className="space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="space-y-1 rounded-xl border border-line-subtle bg-surface p-3.5">
              <span className="text-xs font-semibold text-ink-primary">
                Alasan Teknis
              </span>
              <p className="text-xs leading-relaxed text-ink-secondary">
                {decisionItem.content.rationale}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-ink-tertiary">
                Alternatif Ditolak
              </span>
              <div className="flex flex-wrap gap-1.5">
                {decisionItem.content.rejectedAlternatives.map((alt, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md border border-line-subtle bg-surface px-2.5 py-1 text-xs text-ink-secondary"
                  >
                    <X className="size-3 shrink-0 text-ink-tertiary" aria-hidden="true" />
                    <span>{alt}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-cyan-subtle bg-wash-cyan/45 p-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-surface-card text-ink-cyan shadow-badge">
                <Lock className="size-4" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-ink-primary">
                Alasan & Alternatif Terkunci
              </p>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Jawab dialog Socratic di samping untuk membuka detail penuh.
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPeekUnlocked(true)}
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  <span>Buka Referensi</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
