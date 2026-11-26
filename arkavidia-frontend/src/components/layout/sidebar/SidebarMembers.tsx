import { Plus } from "lucide-react"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  USER_AVATAR_MAP,
  USER_ROLE_LABEL,
} from "@/features/team-chat/components/teamChatAvatars"
import type { Team, User } from "@/types/bersama"

export interface SidebarMembersProps {
  readonly team?: Team
  readonly currentUser?: User
}

// Online indicators for team collaboration presence
const ONLINE_MEMBERS = new Set(["user-rani", "user-dimas", "user-budi"])

export function SidebarMembers({ team, currentUser }: SidebarMembersProps) {
  const { theme, setTheme } = useTheme()
  const members = team?.members ?? []

  return (
    <div className="pt-2 pb-1">
      <p className="pl-3 pb-2 text-xs font-medium text-ink-tertiary">
        Anggota
      </p>

      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-5 gap-2 pr-4 pl-3 items-center">
          {members.map((member) => {
            const avatarSrc = USER_AVATAR_MAP[member.id]
            const roleLabel = USER_ROLE_LABEL[member.id] || member.role
            const isOnline = ONLINE_MEMBERS.has(member.id)
            const isMe = member.id === currentUser?.id

            return (
              <Tooltip key={member.id}>
                <TooltipTrigger asChild>
                  <div className="relative size-8 cursor-pointer select-none">
                    <Avatar className="size-8 rounded-full ring-2 ring-well dark:ring-canvas transition-transform duration-150 hover:scale-105">
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

                    {/* Green online presence indicator */}
                    {isOnline && (
                      <span
                        className="absolute bottom-0 right-0 size-2 rounded-full bg-success ring-2 ring-well dark:ring-canvas"
                        aria-label="Online"
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">
                    {member.name} {isMe ? "(Kamu)" : ""}
                  </p>
                  <p className="text-xs text-background/80">{roleLabel}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Add member button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Undang anggota"
                className="flex size-8 items-center justify-center rounded-full border border-dashed border-line-default text-ink-tertiary transition-[border-color,color] duration-150 hover:border-ink-primary hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Undang anggota
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Compact ThemeSwitcher at bottom */}
      <div className="mt-4 pl-3 pr-4 flex items-center justify-between">
        <ThemeSwitcher value={theme} onChange={setTheme} />
      </div>
    </div>
  )
}
