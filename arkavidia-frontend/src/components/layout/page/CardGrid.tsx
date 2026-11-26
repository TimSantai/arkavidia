import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface CardGridProps {
  readonly children: ReactNode
  readonly minWidth?: string
  readonly gap?: "3" | "4" | "6"
  readonly className?: string
}

const GAP_CLASSES: Record<"3" | "4" | "6", string> = {
  "3": "gap-3",
  "4": "gap-4",
  "6": "gap-6",
}

export function CardGrid({
  children,
  minWidth = "260px",
  gap = "4",
  className,
}: CardGridProps) {
  return (
    <div
      style={
        {
          "--card-min-width": minWidth,
        } as React.CSSProperties
      }
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2",
        GAP_CLASSES[gap],
        className
      )}
    >
      {children}
    </div>
  )
}
