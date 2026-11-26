import { useCallback, useEffect, useRef, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useParams } from "react-router"
import {
  Activity,
  BookOpen,
  Brain,
  ClipboardCheck,
  GraduationCap,
  House,
  Lock,
  Menu,
  MessageSquare,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import {
  AGENT_ROLE_META,
  type AgentRole,
} from "@/components/bersama/agentConfig"
import { AgentCustomizerDialog } from "@/components/bersama/AgentCustomizerDialog"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getStoredDemoUser } from "@/features/auth/components/demoSession"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { bersamaApi } from "@/services/api"
import type { Team } from "@/types/bersama"
import { cn } from "@/lib/utils"

interface NavItem {
  readonly to: string
  readonly label: string
  readonly badge?: string
  readonly icon: typeof MessageSquare
}

const ACTIVE_NAV_CLASSES = "bg-brand text-on-brand shadow-primary"

function resolveActiveAgentRole(pathname: string): AgentRole {
  if (pathname.includes("/private")) return "private"
  if (
    pathname.includes("/brain") ||
    pathname.includes("/understanding") ||
    pathname.includes("/check") ||
    pathname.includes("/briefing")
  ) {
    return "tutor"
  }
  return "team"
}

export function AppShell() {
  const { teamId = "team-pbo-01" } = useParams()
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()
  const [team, setTeam] = useState<Team | undefined>(undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const activeUser = getStoredDemoUser()
  const activeAvatarSrc = USER_AVATAR_MAP[activeUser.id]
  const activeAgentRole = resolveActiveAgentRole(pathname)
  const activeAgentMeta = AGENT_ROLE_META[activeAgentRole]

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }, [])

  useEffect(() => {
    void bersamaApi.getTeamById(teamId).then(setTeam)
  }, [teamId])

  useEffect(() => {
    if (!mobileMenuOpen) return
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeMobileMenu()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen, closeMobileMenu])

  const workspaceLinks: readonly NavItem[] = [
    {
      to: `/teams/${teamId}/home`,
      label: "Beranda",
      icon: House,
    },
    {
      to: `/teams/${teamId}/chat`,
      label: "Ruang Tim",
      badge: "M2",
      icon: MessageSquare,
    },
    {
      to: `/teams/${teamId}/private`,
      label: "Ruang Pribadi",
      badge: "M1",
      icon: Lock,
    },
    {
      to: `/teams/${teamId}/brain`,
      label: "Project Brain",
      icon: Brain,
    },
  ]

  const learningLinks: readonly NavItem[] = [
    {
      to: `/teams/${teamId}/understanding`,
      label: "Peta Pemahaman",
      icon: Activity,
    },
    {
      to: `/teams/${teamId}/check`,
      label: "Explain-Back Check",
      icon: ClipboardCheck,
    },
    {
      to: `/teams/${teamId}/briefing`,
      label: "Tutored Briefing",
      icon: GraduationCap,
    },
  ]

  const renderLinkGroup = (
    title: string,
    items: readonly NavItem[],
    isMobile = false
  ) => (
    <div className="space-y-1">
      <p className="px-2.5 pb-1 text-xs font-medium tracking-wide text-ink-secondary">
        {title}
      </p>
      {items.map(({ to, label, badge, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={isMobile ? closeMobileMenu : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center justify-between rounded-lg px-2.5 text-[13px] font-medium transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isMobile ? "min-h-11 py-2.5" : "min-h-9 py-2",
              isActive
                ? ACTIVE_NAV_CLASSES
                : "text-ink-secondary hover:bg-surface-top hover:text-ink-primary"
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </span>
              {badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive
                      ? "bg-white/20 text-current"
                      : "border border-line-subtle bg-surface-top text-ink-secondary"
                  )}
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

  const renderAgentCompanionWidget = (isMobile = false) => (
    <div className="rounded-xl border border-line-subtle bg-surface-card p-2.5 shadow-card">
      <div className="flex items-center gap-2.5">
        <AgentStickerAvatar
          role={activeAgentRole}
          size={42}
          interactive={!isMobile}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink-primary">
            {activeAgentMeta.label}
          </p>
          <p className="truncate text-xs text-ink-secondary">
            {activeAgentMeta.roomLabel}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Kustomisasi stiker AI agent"
          title="Kustomisasi stiker AI agent"
          onClick={() => {
            if (isMobile) closeMobileMenu()
            setCustomizerOpen(true)
          }}
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-canvas text-ink-primary">
      {/* Desktop Sidebar (lg:w-64 preserved for full-bleed chat layouts) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line-subtle bg-well lg:flex">
        <div className="flex h-14 items-center justify-between border-b border-line-subtle bg-surface/80 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-on-brand shadow-primary">
              B
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink-primary">
              BERSAMA
            </span>
          </Link>
          <Link
            to="/teams"
            className="rounded-md px-2 py-1 text-xs font-medium text-ink-secondary transition-[background-color,color] duration-150 hover:bg-surface-top hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ganti Tim
          </Link>
        </div>

        <div className="border-b border-line-subtle bg-surface/50 px-4 py-3">
          <p className="text-xs font-medium text-ink-tertiary">
            {team?.courseCode ?? "PROYEK"}
          </p>
          <p className="truncate text-sm font-semibold text-ink-primary">
            {team?.name ?? "Memuat tim..."}
          </p>
        </div>

        <nav
          aria-label="Navigasi workspace utama"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        >
          {renderLinkGroup("Kolaborasi & Memori", workspaceLinks)}
          {renderLinkGroup("Pemahaman & Tutor", learningLinks)}
        </nav>

        <div className="space-y-2.5 border-t border-line-subtle bg-surface/50 p-3">
          {renderAgentCompanionWidget(false)}

          <Link
            to="/teams"
            title="Ganti persona atau tim"
            className="flex items-center justify-between gap-2.5 rounded-xl border border-line-subtle bg-surface-card px-2.5 py-2 shadow-card transition-[border-color,background-color] duration-150 hover:border-line-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar size="sm" className="size-7 shrink-0">
                {activeAvatarSrc && (
                  <AvatarImage
                    src={activeAvatarSrc}
                    alt={activeUser.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-surface text-xs font-semibold text-ink-primary">
                  {activeUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink-primary">
                  {activeUser.name}
                </p>
                <p className="truncate text-xs text-ink-secondary">
                  {activeUser.role}
                </p>
              </div>
            </div>
            <BookOpen
              className="size-3.5 shrink-0 text-ink-tertiary"
              aria-hidden="true"
            />
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi workspace"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="fixed inset-0 bg-inverse/40 backdrop-blur-xs"
              onClick={closeMobileMenu}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 flex w-72 flex-col border-r border-line-subtle bg-surface-raised shadow-raised"
            >
              <div className="flex h-14 items-center justify-between border-b border-line-subtle px-4">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-on-brand shadow-primary">
                    B
                  </span>
                  <span className="text-sm font-semibold text-ink-primary">
                    BERSAMA
                  </span>
                </Link>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  className="size-11"
                  aria-label="Tutup menu"
                  onClick={closeMobileMenu}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-line-subtle px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-secondary">
                    {team?.courseCode ?? "PROYEK"}
                  </p>
                  <p className="truncate text-sm font-semibold text-ink-primary">
                    {team?.name ?? "Memuat tim..."}
                  </p>
                </div>
                <Link
                  to="/teams"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-line-default bg-surface-top px-2.5 text-xs font-medium text-ink-primary shadow-control hover:bg-surface"
                >
                  Ganti
                </Link>
              </div>

              <nav
                aria-label="Navigasi workspace mobile"
                className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
              >
                {renderLinkGroup("Kolaborasi & Memori", workspaceLinks, true)}
                {renderLinkGroup("Pemahaman & Tutor", learningLinks, true)}
              </nav>

              <div className="space-y-2.5 border-t border-line-subtle p-3">
                {renderAgentCompanionWidget(true)}

                <Link
                  to="/teams"
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line-subtle bg-surface-card px-2.5 py-2 shadow-card"
                >
                  <Avatar size="sm" className="size-7 shrink-0">
                    {activeAvatarSrc && (
                      <AvatarImage
                        src={activeAvatarSrc}
                        alt={activeUser.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-surface text-xs font-semibold text-ink-primary">
                      {activeUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink-primary">
                      {activeUser.name}
                    </p>
                    <p className="truncate text-xs text-ink-secondary">
                      {activeUser.role}
                    </p>
                  </div>
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-subtle bg-surface/90 px-3 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              ref={triggerRef}
              variant="ghost"
              className="size-11 lg:hidden"
              aria-label="Buka navigasi"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-4" aria-hidden="true" />
            </Button>
            <span className="truncate text-sm font-medium text-ink-secondary lg:hidden">
              {team?.name ?? "BERSAMA"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {team && (
              <AvatarStack animate size={28}>
                {team.members.map((member) => {
                  const avatarSrc = USER_AVATAR_MAP[member.id]
                  return (
                    <Avatar key={member.id} title={member.name}>
                      {avatarSrc && (
                        <AvatarImage
                          src={avatarSrc}
                          alt={member.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-muted text-xs font-medium text-ink-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  )
                })}
              </AvatarStack>
            )}
            <ThemeSwitcher value={theme} onChange={setTheme} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      <AgentCustomizerDialog
        key={activeAgentRole}
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        initialRole={activeAgentRole}
      />
    </div>
  )
}
