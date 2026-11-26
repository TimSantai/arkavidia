import { useNavigate } from "react-router"
import { Check, ChevronDown, Lock, LogOut, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setStoredDemoUser } from "@/features/auth/components/demoSession"
import { USER_AVATAR_MAP, USER_ROLE_LABEL } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { User } from "@/types/bersama"

export interface UserAccountMenuProps {
  readonly user: User
  readonly teamId: string
  readonly onSwitchUser?: (user: User) => void
}

export function UserAccountMenu({ user, teamId, onSwitchUser }: UserAccountMenuProps) {
  const navigate = useNavigate()
  const avatarSrc = USER_AVATAR_MAP[user.id]
  const roleLabel = USER_ROLE_LABEL[user.id] || user.role

  const handleSelectPersona = (targetUser: User) => {
    setStoredDemoUser(targetUser.id)
    if (onSwitchUser) {
      onSwitchUser(targetUser)
    } else {
      window.location.reload()
    }
  }

  const handleLogout = () => {
    void navigate("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Menu akun ${user.name}`}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-line-subtle bg-surface-card py-1 pr-2.5 pl-1 text-xs select-none shadow-xs transition-[border-color,background-color] duration-150 hover:border-line-default hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          <Avatar className="size-6 shrink-0 rounded-full">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-muted text-xs font-semibold text-ink-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden font-medium text-ink-primary sm:inline max-w-[120px] truncate">
            {user.name.split(" ")[0]}
          </span>
          <ChevronDown className="size-3 text-ink-tertiary" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border border-line-subtle bg-surface-raised p-2 text-xs shadow-raised ring-0"
      >
        {/* Active Account Identity Card */}
        <div className="flex items-center gap-2.5 p-2 bg-surface rounded-xl border border-line-subtle">
          <Avatar className="size-9 shrink-0 rounded-full">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-muted text-xs font-semibold text-ink-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink-primary">{user.name}</p>
            <p className="truncate text-xs text-ink-secondary">{user.email}</p>
            <span className="inline-block mt-0.5 rounded-full bg-wash-brand border border-brand-subtle px-2 py-0.5 text-xs font-medium text-ink-link">
              {roleLabel}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-line-subtle/60" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => void navigate(`/teams/${teamId}/private`)}
            className="cursor-pointer gap-2 rounded-lg text-ink-secondary hover:text-ink-primary"
          >
            <Lock className="size-3.5 text-ink-link" />
            <span>Ruang Pribadi (M1)</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => void navigate("/teams")}
            className="cursor-pointer gap-2 rounded-lg text-ink-secondary hover:text-ink-primary"
          >
            <Users className="size-3.5 text-ink-secondary" />
            <span>Ganti Tim Proyek</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-line-subtle/60" />

        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-ink-tertiary">
          Ganti Akun Demo
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {SEED_USERS.map((persona) => {
            const isCurrent = persona.id === user.id
            const personaAvatar = USER_AVATAR_MAP[persona.id]
            const personaRole = USER_ROLE_LABEL[persona.id] || persona.role
            return (
              <DropdownMenuItem
                key={persona.id}
                onClick={() => handleSelectPersona(persona)}
                className={cn(
                  "cursor-pointer items-center justify-between gap-2 rounded-lg text-xs font-medium",
                  isCurrent
                    ? "bg-wash-brand text-ink-link font-semibold"
                    : "text-ink-secondary hover:text-ink-primary"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="size-5 shrink-0">
                    {personaAvatar && (
                      <AvatarImage src={personaAvatar} alt={persona.name} className="object-cover" />
                    )}
                    <AvatarFallback className="text-xs">{persona.initials}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {persona.name.split(" ")[0]} ({personaRole})
                  </span>
                </div>
                {isCurrent && <Check className="size-3.5 text-ink-link shrink-0" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-line-subtle/60" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-2 rounded-lg text-text-error hover:bg-error-subtle/50 font-medium"
        >
          <LogOut className="size-3.5" />
          <span>Keluar (Logout)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
