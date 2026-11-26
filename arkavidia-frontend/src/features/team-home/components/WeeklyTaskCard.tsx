import { ClipboardCheck, FileCheck, Users } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { AvatarStack } from "@/components/kibo-ui/avatar-stack"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import type { KnowledgeComponent } from "@/types/bersama"
import { PressedButton } from "./PressedButton"
import type { WeeklyTask } from "../teamHomeData"
import { getUserById } from "../teamHomeData"

export interface WeeklyTaskCardProps {
  readonly task: WeeklyTask
  readonly kcs: readonly KnowledgeComponent[]
}

export function WeeklyTaskCard({ task, kcs }: WeeklyTaskCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const kc = kcs.find((k) => k.id === task.kcId)
  const kcCode = kc ? kc.code : "KC"

  const isExplainBack = task.kind === "explain-back"
  const isPairing = task.kind === "pairing"

  // Pastel header colors:
  // explain-back = kuning (bg-warning-subtle text-text-warning)
  // pairing = coral (bg-error-subtle text-text-error)
  // confirm-decision = biru (bg-info-subtle text-text-info)
  const headerBgClass = isExplainBack
    ? "bg-warning-subtle text-text-warning"
    : isPairing
      ? "bg-error-subtle text-text-error"
      : "bg-info-subtle text-text-info"

  const HeaderIcon = isExplainBack
    ? ClipboardCheck
    : isPairing
      ? Users
      : FileCheck

  return (
    <article className="rounded-3xl bg-surface-raised border border-line-subtle shadow-raised p-2 flex flex-col justify-between group overflow-hidden transition-[box-shadow,border-color] duration-150">
      <div>
        {/* Playful Header Illustration */}
        <div
          className={cn(
            "h-28 rounded-2xl m-1 relative overflow-hidden flex items-center justify-center",
            headerBgClass
          )}
        >
          {/* Top-left deadline chip */}
          <span className="bg-surface-raised/90 backdrop-blur-xs border border-line-subtle/50 px-2.5 py-0.5 rounded-full text-xs font-medium text-ink-primary absolute top-2.5 left-2.5 shadow-xs">
            Tenggat Jum
          </span>

          {/* Big Lucide Icon 64px with hover tilt */}
          <motion.div
            initial={false}
            animate={
              shouldReduceMotion
                ? { rotate: -6, scale: 1 }
                : undefined
            }
            whileHover={
              shouldReduceMotion
                ? undefined
                : { rotate: -2, scale: 1.05 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center -rotate-6 opacity-80"
          >
            <HeaderIcon className="size-16" aria-hidden="true" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-3 pb-1">
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-xs text-ink-secondary border-line-subtle font-mono font-medium"
          >
            {kcCode}
          </Badge>

          <h3 className="text-base font-sans font-semibold text-ink-primary mt-2 line-clamp-2 leading-snug">
            {task.title}
          </h3>

          <p className="text-[13px] text-ink-tertiary mt-1 font-sans">
            {task.meta}
          </p>
        </div>
      </div>

      {/* Footer Row */}
      <div className="p-3 pt-2 flex items-center justify-between gap-2 mt-2 border-t border-line-subtle/40">
        <div>
          {isPairing && task.people && task.people.length > 0 ? (
            <AvatarStack size={28} className="overflow-visible">
              {task.people.map((personId) => {
                const person = getUserById(personId)
                const avatarUrl = USER_AVATAR_MAP[personId]
                return (
                  <Avatar key={personId} className="size-7 ring-2 ring-surface-raised">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={person?.name || "Anggota"} />}
                    <AvatarFallback className="text-xs bg-muted text-ink-primary font-medium">
                      {person?.initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </AvatarStack>
          ) : (
            <span className="text-xs text-ink-tertiary font-sans">Mandiri</span>
          )}
        </div>

        <PressedButton to={task.to} size="sm">
          {task.cta}
        </PressedButton>
      </div>
    </article>
  )
}
