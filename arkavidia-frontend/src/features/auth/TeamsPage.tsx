import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  ArrowRight,
  Check,
  Compass,
  Copy,
  KeyRound,
  Plus,
  UserCheck,
  Users,
} from "lucide-react"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import { bersamaApi } from "@/services/api"
import type { Team, User } from "@/types/bersama"
import { CreateTeamDialog } from "./components/CreateTeamDialog"
import { JoinTeamDialog } from "./components/JoinTeamDialog"
import { getStoredDemoUser, setStoredDemoUser } from "./components/demoSession"

export function TeamsPage() {
  const { theme, setTheme } = useTheme()
  const [teams, setTeams] = useState<readonly Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeUser, setActiveUser] = useState<User>(() => getStoredDemoUser())
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null)
  const activeAvatarSrc = USER_AVATAR_MAP[activeUser.id]

  useEffect(() => {
    let active = true
    void bersamaApi
      .getTeams()
      .then((data) => {
        if (active) setTeams(data)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleCopyInviteCode = async (team: Team) => {
    try {
      await navigator.clipboard.writeText(team.inviteCode)
    } catch {
      // Clipboard fallback ignored if blocked by permissions; still show feedback
    }
    setCopiedTeamId(team.id)
    window.setTimeout(() => {
      setCopiedTeamId((prev) => (prev === team.id ? null : prev))
    }, 2000)
  }

  const handleCreateTeam = (newTeam: Team) => {
    setTeams((prev) => [newTeam, ...prev])
  }

  const handleJoinTeam = (teamId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team
        const isMember = team.members.some((m) => m.id === activeUser.id)
        if (isMember) return team
        return {
          ...team,
          members: [...team.members, activeUser],
        }
      })
    )
  }

  const handleSwitchPersona = (user: User) => {
    setStoredDemoUser(user.id)
    setActiveUser(user)
  }

  const isNewMemberSari = activeUser.id === "user-sari"

  return (
    <div className="min-h-screen bg-canvas text-ink-primary">
      <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-semibold text-on-brand">
                B
              </span>
              <span className="font-heading text-base font-semibold tracking-tight text-ink-primary">
                BERSAMA
              </span>
            </Link>
            <span className="hidden h-4 w-px bg-line-subtle sm:block" />
            <div className="hidden items-center gap-2 rounded-full border border-line-subtle bg-canvas px-2.5 py-1 sm:flex">
              <Avatar size="sm">
                {activeAvatarSrc && (
                  <AvatarImage src={activeAvatarSrc} alt={activeUser.name} className="object-cover" />
                )}
                <AvatarFallback className="text-[10px] font-semibold">
                  {activeUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-ink-primary">
                {activeUser.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher value={theme} onChange={setTheme} />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setJoinOpen(true)}
            >
              <KeyRound className="size-3.5" />
              <span className="hidden sm:inline">Gabung Kode</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-brand text-on-brand hover:bg-brand-hover"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-3.5" />
              <span>Buat Tim Baru</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        {/* Page Heading + Inline Demo Persona Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <p className="font-mono text-[11px] font-medium text-ink-tertiary">
              RUANG KERJA PROYEK • S1 TEAMS
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
              Pilih Ruang Tim Proyek
            </h1>
            <p className="text-sm text-ink-secondary">
              Masuk ke workspace kelompokmu atau uji peran anggota lain menggunakan pemilih persona demo.
            </p>
          </div>

          <Button variant="outline" size="sm" className="self-start" asChild>
            <Link to="/login">Ubah Consent / Login</Link>
          </Button>
        </div>

        {/* Demo Persona Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-subtle bg-surface p-3.5 shadow-surface">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            <UserCheck className="size-4 text-ink-link" />
            <span>Persona Demo Aktif:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SEED_USERS.map((user) => {
              const selected = user.id === activeUser.id
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSwitchPersona(user)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150",
                    selected
                      ? "border-line-active bg-brand text-on-brand"
                      : "border-line-subtle bg-canvas text-ink-secondary hover:border-line-default hover:text-ink-primary"
                  )}
                >
                  <span>{user.name.split(" ")[0]}</span>
                  {user.id === "user-sari" && (
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        selected ? "opacity-90" : "text-text-warning"
                      )}
                    >
                      (Baru)
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Highlight Banner for Sari (New Member Minggu ke-3) */}
        {isNewMemberSari && teams[0] && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line-subtle bg-info-subtle p-5 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-text-info">
                <Compass className="size-3.5" aria-hidden="true" />
                <span>ONBOARDING ANGGOTA BARU • MINGGU KE-3</span>
              </div>
              <p className="text-sm font-semibold text-ink-primary">
                Baru bergabung sebagai Sari? Mulai Tutored Briefing (~10 mnt)
              </p>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Dialog Socratic interaktif membantumu memahami keputusan arsitektur MVC, JWT, dan skema antrean yang sudah dikonfirmasi tim.
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 gap-1.5 bg-brand text-on-brand hover:bg-brand-hover"
              asChild
            >
              <Link to={`/teams/${teams[0].id}/briefing`}>
                Mulai Tutored Briefing
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* Team Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="status" aria-label="Memuat daftar tim">
            {[1, 2].map((slot) => (
              <div
                key={slot}
                className="h-52 rounded-2xl border border-line-subtle bg-surface p-5 shadow-surface"
              >
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-4 h-5 w-3/4 rounded bg-muted/80" />
                <div className="mt-2 h-3.5 w-full rounded bg-muted/60" />
              </div>
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-line-subtle bg-surface p-8 text-center shadow-surface">
            <p className="font-heading text-base font-semibold text-ink-primary">
              Belum ada ruang tim
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              Buat tim proyek baru atau masukkan kode undangan untuk bergabung ke tim yang sudah ada.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const isCopied = copiedTeamId === team.id
            return (
              <article
                key={team.id}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-line-subtle bg-surface p-5 shadow-surface"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
                      {team.courseCode}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-tertiary tabular-nums">
                      <Users className="size-3.5" aria-hidden="true" />
                      {team.members.length} anggota
                    </span>
                  </div>

                  <div>
                    <h2 className="font-heading text-lg font-semibold text-ink-primary">
                      {team.name}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                      {team.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <AvatarStack size={30}>
                      {team.members.map((member) => {
                        const avatarSrc = USER_AVATAR_MAP[member.id]
                        return (
                          <Avatar key={member.id}>
                            {avatarSrc && (
                              <AvatarImage src={avatarSrc} alt={member.name} className="object-cover" />
                            )}
                            <AvatarFallback className="border border-line-subtle bg-canvas text-[11px] font-medium text-ink-primary">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                        )
                      })}
                    </AvatarStack>

                    <button
                      type="button"
                      onClick={() => void handleCopyInviteCode(team)}
                      aria-label={`Salin kode undangan ${team.inviteCode}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors duration-150",
                        isCopied
                          ? "border-line-subtle bg-success-subtle text-text-success"
                          : "border-line-subtle bg-canvas text-ink-secondary hover:border-line-default hover:text-ink-primary"
                      )}
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <span>{team.inviteCode}</span>
                          <Copy className="size-3.5 text-ink-tertiary" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 bg-brand text-on-brand hover:bg-brand-hover"
                    asChild
                  >
                    <Link to={`/teams/${team.id}/chat`}>
                      Buka Ruang Tim
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={
                        isNewMemberSari
                          ? `/teams/${team.id}/briefing`
                          : `/teams/${team.id}/understanding`
                      }
                    >
                      {isNewMemberSari ? "Briefing" : "Peta Pemahaman"}
                    </Link>
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
        )}
      </main>

      <CreateTeamDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        activeUser={activeUser}
        onCreateTeam={handleCreateTeam}
      />

      <JoinTeamDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        availableTeams={teams}
        activeUser={activeUser}
        onJoinTeam={handleJoinTeam}
      />
    </div>
  )
}
