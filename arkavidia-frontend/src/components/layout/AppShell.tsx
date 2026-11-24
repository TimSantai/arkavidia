import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useParams } from "react-router"
import {
  Activity,
  BookOpen,
  Brain,
  ClipboardCheck,
  GraduationCap,
  Lock,
  Menu,
  MessageSquare,
  X,
} from "lucide-react"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CURRENT_USER } from "@/mocks/seedData"
import { bersamaApi } from "@/services/api"
import type { Team } from "@/types/bersama"

interface NavItem {
  readonly to: string
  readonly label: string
  readonly badge?: string
  readonly icon: typeof MessageSquare
}

export function AppShell() {
  const { teamId = "team-pbo-01" } = useParams()
  const { theme, setTheme } = useTheme()
  const [team, setTeam] = useState<Team | undefined>(undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    void bersamaApi.getTeamById(teamId).then(setTeam)
  }, [teamId])

  const workspaceLinks: readonly NavItem[] = [
    { to: `/teams/${teamId}/chat`, label: "Ruang Tim", badge: "M2", icon: MessageSquare },
    { to: `/teams/${teamId}/private`, label: "Ruang Pribadi", badge: "M1", icon: Lock },
    { to: `/teams/${teamId}/brain`, label: "Project Brain", icon: Brain },
  ]

  const learningLinks: readonly NavItem[] = [
    { to: `/teams/${teamId}/understanding`, label: "Peta Pemahaman", icon: Activity },
    { to: `/teams/${teamId}/check`, label: "Explain-Back Check", icon: ClipboardCheck },
    { to: `/teams/${teamId}/briefing`, label: "Tutored Briefing", icon: GraduationCap },
  ]

  const renderLinkGroup = (title: string, items: readonly NavItem[]) => (
    <div className="space-y-1">
      <p className="px-2.5 pb-1 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
        {title}
      </p>
      {items.map(({ to, label, badge, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${isActive
              ? "bg-brand text-on-brand"
              : "text-ink-secondary hover:bg-muted hover:text-ink-primary"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
              </span>
              {badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${isActive
                      ? "bg-on-brand/15 text-on-brand"
                      : "border border-line-subtle bg-canvas text-ink-tertiary"
                    }`}
                >
                  {badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-canvas text-ink-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line-subtle bg-surface lg:flex">
        <div className="flex h-14 items-center justify-between border-b border-line-subtle px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand font-heading text-xs font-semibold text-on-brand">
              B
            </span>
            <span className="font-heading text-sm font-semibold tracking-tight">BERSAMA</span>
          </Link>
          <Link
            to="/teams"
            className="rounded-md px-2 py-1 font-mono text-[11px] text-ink-tertiary hover:bg-muted hover:text-ink-primary"
          >
            Tim
          </Link>
        </div>

        <div className="border-b border-line-subtle px-4 py-3">
          <p className="font-mono text-[11px] text-ink-tertiary">{team?.courseCode ?? "PROYEK"}</p>
          <p className="truncate text-sm font-semibold text-ink-primary">
            {team?.name ?? "Memuat tim..."}
          </p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {renderLinkGroup("Kolaborasi & Memori", workspaceLinks)}
          {renderLinkGroup("Pemahaman & Tutor", learningLinks)}
        </nav>

        <div className="border-t border-line-subtle p-3">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-canvas px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink-primary">{CURRENT_USER.name}</p>
              <p className="truncate font-mono text-[10px] text-ink-tertiary">
                {CURRENT_USER.role.toUpperCase()}
              </p>
            </div>
            <BookOpen className="size-4 shrink-0 text-ink-tertiary" />
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-inverse/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex w-72 flex-col border-r border-line-subtle bg-surface-raised shadow-raised">
            <div className="flex h-14 items-center justify-between border-b border-line-subtle px-4">
              <span className="font-heading text-sm font-semibold">BERSAMA</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {renderLinkGroup("Kolaborasi & Memori", workspaceLinks)}
              {renderLinkGroup("Pemahaman & Tutor", learningLinks)}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-subtle bg-surface/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              aria-label="Buka navigasi"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <span className="truncate text-sm font-medium text-ink-secondary lg:hidden">
              {team?.name ?? "BERSAMA"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {team && (
              <AvatarStack animate size={28}>
                {team.members.map((member) => (
                  <Avatar key={member.id} title={member.name}>
                    <AvatarFallback className="bg-muted font-mono text-[10px] font-medium text-ink-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarStack>
            )}
            <ThemeSwitcher value={theme} onChange={setTheme} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
