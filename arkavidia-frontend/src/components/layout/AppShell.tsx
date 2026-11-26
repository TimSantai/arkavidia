import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation, useParams } from "react-router"
import { Menu, SlidersHorizontal, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import {
  AGENT_ROLE_META,
  type AgentRole,
} from "@/components/bersama/agentConfig"
import { AgentCustomizerDialog } from "@/components/bersama/AgentCustomizerDialog"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { useTheme } from "@/components/theme/useTheme"
import { Button } from "@/components/ui/button"
import { getStoredDemoUser } from "@/features/auth/components/demoSession"
import { bersamaApi } from "@/services/api"
import type { Team, User } from "@/types/bersama"
import { AppSidebar } from "./sidebar/AppSidebar"
import { UserAccountMenu } from "./UserAccountMenu"

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
  const { theme } = useTheme()
  const [team, setTeam] = useState<Team | undefined>(undefined)
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredDemoUser())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
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

  return (
    <div
      style={
        {
          "--sheet": theme === "dark" ? "var(--bg-surface)" : "var(--bg-surface-card)",
        } as React.CSSProperties
      }
      className="flex h-screen h-dvh bg-well dark:bg-canvas text-ink-primary overflow-hidden"
    >
      {/* Desktop Sidebar (w-[248px], pl-4 pr-0, no border between sidebar and sheet) */}
      <AppSidebar
        team={team}
        teamId={teamId}
        currentUser={currentUser}
      />

      {/* Mobile Sidebar Overlay (Drawer from left) */}
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
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 flex w-72 flex-col bg-well dark:bg-canvas shadow-raised h-full"
            >
              <div className="flex h-14 items-center justify-between px-4 border-b border-line-subtle">
                <span className="font-semibold text-sm text-ink-primary">
                  Menu
                </span>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  className="size-10"
                  aria-label="Tutup menu"
                  onClick={closeMobileMenu}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                <AppSidebar
                  team={team}
                  teamId={teamId}
                  currentUser={currentUser}
                  isMobile={true}
                  onNavigate={closeMobileMenu}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area (Content Sheet) */}
      <div className="flex min-w-0 flex-1 flex-col bg-surface-card dark:bg-surface lg:rounded-tl-[28px] lg:rounded-bl-[28px] h-full overflow-hidden z-10">
        <header className="shrink-0 flex h-14 items-center justify-between border-b border-line-subtle px-4 sm:px-6 lg:px-8 bg-surface-card/90 dark:bg-surface/90 backdrop-blur-md lg:rounded-tl-[28px] z-30">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              ref={triggerRef}
              variant="ghost"
              className="size-10 lg:hidden"
              aria-label="Buka navigasi"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-4" aria-hidden="true" />
            </Button>
            <span className="truncate text-sm font-semibold text-ink-primary lg:hidden">
              {team?.name ?? "BERSAMA"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dedicated Agent Companion Pill (Customizer Trigger) */}
            <button
              type="button"
              onClick={() => setCustomizerOpen(true)}
              aria-label={`Kustomisasi stiker & persona ${activeAgentMeta.label}`}
              title={`Kustomisasi stiker & persona ${activeAgentMeta.label}`}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-line-subtle bg-surface-card px-2.5 py-1 text-xs select-none shadow-xs transition-[border-color,background-color] duration-150 hover:border-line-default hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <AgentStickerAvatar
                role={activeAgentRole}
                size={24}
                interactive={false}
              />
              <span className="font-medium text-ink-primary hidden md:inline">
                {activeAgentMeta.label}
              </span>
              <SlidersHorizontal className="size-3 text-ink-tertiary" aria-hidden="true" />
            </button>

            {/* User Account Menu (Auth Dropdown) */}
            <UserAccountMenu
              user={currentUser}
              teamId={teamId}
              onSwitchUser={(nextUser) => {
                setCurrentUser(nextUser)
                window.location.reload()
              }}
            />
          </div>
        </header>

        <main className="flex-1 min-h-0 w-full overflow-y-auto">
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
export default AppShell
