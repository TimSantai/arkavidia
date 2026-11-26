import type { ElementType } from "react"
import { NavLink } from "react-router"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { TabCorners } from "./TabCorners"

export interface SidebarNavItemProps {
  readonly to: string
  readonly label: string
  readonly icon: ElementType
  readonly badge?: string
  readonly count?: number
  readonly countSrText?: string
  readonly isMobile?: boolean
  readonly onClick?: () => void
}

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  badge,
  count,
  countSrText,
  isMobile = false,
  onClick,
}: SidebarNavItemProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group relative flex h-10 items-center justify-between pl-3 select-none text-[14px]",
          "transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isMobile ? "mr-3 pr-3 rounded-full" : "pr-4 rounded-l-full",
          isActive
            ? "text-ink-primary font-medium"
            : "text-ink-secondary hover:text-ink-primary"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Animated active tab background with concave corners */}
          {isActive && (
            <motion.div
              layoutId={shouldReduceMotion ? undefined : "sidebar-active-tab"}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 40,
              }}
              className={cn(
                "absolute inset-0 z-0 bg-[var(--sheet)]",
                isMobile ? "rounded-full" : "rounded-l-full"
              )}
            >
              {!isMobile && <TabCorners />}
            </motion.div>
          )}

          {/* Nav Item Content */}
          <span className="relative z-10 flex items-center gap-3 min-w-0">
            <Icon
              className={cn(
                "size-4 shrink-0 transition-transform duration-150",
                isActive
                  ? "text-ink-link"
                  : "text-ink-secondary group-hover:translate-x-0.5 group-hover:text-ink-primary"
              )}
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
          </span>

          {/* Badges */}
          <span className="relative z-10 flex items-center gap-1.5 shrink-0">
            {badge && (
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded-md leading-none select-none",
                  isActive
                    ? "bg-[#f4f6f9] dark:bg-canvas text-ink-tertiary"
                    : "bg-white dark:bg-surface-card text-ink-tertiary border border-line-subtle/50"
                )}
              >
                {badge}
              </span>
            )}

            {count !== undefined && count > 0 && (
              <span className="font-mono text-[11px] min-w-6 h-5 px-1.5 rounded-full bg-[#e1ecff] text-[#1a51c4] inline-flex items-center justify-center font-medium leading-none">
                {count}
                {countSrText && <span className="sr-only">{countSrText}</span>}
              </span>
            )}
          </span>
        </>
      )}
    </NavLink>
  )
}
