import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly badge?: ReactNode
  readonly actions?: ReactNode
  readonly children?: ReactNode
  readonly className?: string
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-8 space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading font-medium text-[1.75rem] sm:text-[2rem] leading-tight tracking-tight text-ink-primary">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="font-sans text-sm text-ink-secondary leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-1">{children}</div>}
    </header>
  )
}
