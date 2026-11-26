import type { ElementType } from "react"
import { Link } from "react-router"
import {
  Activity,
  Brain,
  ClipboardCheck,
  GraduationCap,
  House,
  Lock,
  MessageSquare,
  Search,
} from "lucide-react"
import type { Team, User } from "@/types/bersama"
import { SidebarMembers } from "./SidebarMembers"
import { SidebarNavItem } from "./SidebarNavItem"
import { TeamSwitcher } from "./TeamSwitcher"

export interface AppSidebarProps {
  readonly team?: Team
  readonly teamId: string
  readonly currentUser?: User
  readonly isMobile?: boolean
  readonly onNavigate?: () => void
}

interface NavGroupItem {
  readonly to: string
  readonly label: string
  readonly icon: ElementType
  readonly badge?: string
  readonly count?: number
  readonly countSrText?: string
}

export function AppSidebar({
  team,
  teamId,
  currentUser,
  isMobile = false,
  onNavigate,
}: AppSidebarProps) {
  const workspaceLinks: readonly NavGroupItem[] = [
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

  const learningLinks: readonly NavGroupItem[] = [
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

  return (
    <aside
      className={
        isMobile
          ? "flex flex-col h-full pl-4 pr-3 py-5 bg-well dark:bg-canvas select-none"
          : "w-[248px] shrink-0 pl-4 pr-0 py-5 flex flex-col justify-between hidden lg:flex bg-well dark:bg-canvas select-none z-20 h-full"
      }
      aria-label="Sidebar utama"
    >
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* 1. Baris Logo + Tombol Search & Settings */}
        <div className="flex items-center justify-between pr-4 pb-4">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-on-brand shadow-primary shrink-0">
              B
            </span>
            <span className="font-sans text-[15px] font-semibold tracking-tight text-ink-primary">
              BERSAMA
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Cari di BERSAMA"
              className="flex size-8 items-center justify-center rounded-full text-ink-tertiary transition-colors duration-150 hover:bg-white hover:text-ink-primary dark:hover:bg-surface-top focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 2. Team Switcher */}
        <TeamSwitcher team={team} />

        {/* 3. Grup Navigasi: Kolaborasi & Memori */}
        <nav aria-label="Navigasi aplikasi" className="space-y-1 mt-4">
          <p className="pl-3 pb-1.5 text-xs font-medium text-ink-tertiary">
            Kolaborasi & Memori
          </p>
          <div className="space-y-0.5">
            {workspaceLinks.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                count={item.count}
                countSrText={item.countSrText}
                isMobile={isMobile}
                onClick={onNavigate}
              />
            ))}
          </div>

          {/* 4. Grup Navigasi: Pemahaman & Tutor */}
          <p className="pl-3 pt-4 pb-1.5 text-xs font-medium text-ink-tertiary">
            Pemahaman & Tutor
          </p>
          <div className="space-y-0.5">
            {learningLinks.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                count={item.count}
                countSrText={item.countSrText}
                isMobile={isMobile}
                onClick={onNavigate}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* 5. Anggota Tim & Theme Switcher di bagian bawah */}
      <SidebarMembers team={team} currentUser={currentUser} />
    </aside>
  )
}
