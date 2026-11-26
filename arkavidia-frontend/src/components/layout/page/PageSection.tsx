import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface PageSectionProps {
  readonly title?: ReactNode
  readonly action?: ReactNode
  readonly badge?: ReactNode
  readonly children: ReactNode
  readonly className?: string
  readonly id?: string
}

export function PageSection({
  title,
  action,
  badge,
  children,
  className,
  id,
}: PageSectionProps) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      {(title || action || badge) && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {typeof title === "string" ? (
              <h2 className="font-heading font-medium text-lg sm:text-xl text-ink-primary tracking-tight truncate">
                {title}
              </h2>
            ) : (
              title
            )}
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
