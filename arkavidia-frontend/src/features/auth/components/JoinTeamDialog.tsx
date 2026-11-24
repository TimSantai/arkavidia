import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { ArrowRight, CheckCircle2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Team, User } from "@/types/bersama"

interface JoinTeamDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly availableTeams: readonly Team[]
  readonly activeUser: User
  readonly onJoinTeam: (teamId: string) => void
}

export function JoinTeamDialog({
  open,
  onOpenChange,
  availableTeams,
  activeUser,
  onJoinTeam,
}: JoinTeamDialogProps) {
  const [inviteCode, setInviteCode] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [joinedTeam, setJoinedTeam] = useState<Team | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setInviteCode("")
      setErrorMsg(null)
      setJoinedTeam(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = inviteCode.trim().toUpperCase()

    if (!normalized) {
      setErrorMsg("Masukkan kode undangan tim terlebih dahulu.")
      return
    }

    const matched = availableTeams.find(
      (team) => team.inviteCode.toUpperCase() === normalized
    )

    if (!matched) {
      setErrorMsg(
        `Kode "${normalized}" tidak ditemukan. Coba kode demo PBO-K4-2026.`
      )
      return
    }

    onJoinTeam(matched.id)
    setErrorMsg(null)
    setJoinedTeam(matched)
  }

  const alreadyMember = joinedTeam
    ? joinedTeam.members.some((member) => member.id === activeUser.id)
    : false

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-line-subtle bg-surface-raised shadow-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-ink-primary">
            Gabung Tim via Kode Undangan
          </DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Masukkan kode undangan dari ketua kelompok untuk mengakses Ruang Tim &amp; Project Brain.
          </DialogDescription>
        </DialogHeader>

        {joinedTeam ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-line-subtle bg-success-subtle p-4 text-text-success">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {alreadyMember
                      ? `Kamu sudah tergabung di ${joinedTeam.name}`
                      : `Berhasil bergabung ke ${joinedTeam.name}`}
                  </p>
                  <p className="text-xs opacity-90">
                    {activeUser.id === "user-sari"
                      ? "Karena kamu baru bergabung di Minggu ke-3, disarankan mulai lewat Tutored Briefing."
                      : "Semua memori tim terkonfirmasi (M2) kini tersedia untukmu."}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-line-subtle bg-canvas/60">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Tutup
              </Button>
              <Button
                className="gap-1.5 bg-brand text-on-brand hover:bg-brand-hover"
                asChild
              >
                <Link
                  to={
                    activeUser.id === "user-sari"
                      ? `/teams/${joinedTeam.id}/briefing`
                      : `/teams/${joinedTeam.id}/chat`
                  }
                >
                  {activeUser.id === "user-sari"
                    ? "Mulai Tutored Briefing"
                    : "Buka Ruang Tim"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="join-invite-code"
                  className="text-xs font-medium text-ink-primary"
                >
                  Kode Undangan
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setInviteCode("PBO-K4-2026")
                    setErrorMsg(null)
                  }}
                  className="font-mono text-[11px] font-medium text-ink-link hover:underline"
                >
                  Pakai kode demo: PBO-K4-2026
                </button>
              </div>
              <Input
                id="join-invite-code"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase())
                  if (errorMsg) setErrorMsg(null)
                }}
                placeholder="PBO-K4-2026"
                aria-invalid={Boolean(errorMsg)}
                className={cn(
                  "bg-surface font-mono uppercase text-ink-primary",
                  errorMsg ? "border-line-error" : "border-line-default"
                )}
              />
              {errorMsg && (
                <p className="text-xs text-text-error">{errorMsg}</p>
              )}
            </div>

            <DialogFooter className="border-t border-line-subtle bg-canvas/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="gap-1.5 bg-brand text-on-brand hover:bg-brand-hover"
              >
                <KeyRound className="size-4" />
                Gabung Tim
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
