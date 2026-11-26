import { type ElementType, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps {
  readonly children: ReactNode
  readonly width?: "default" | "wide" | "full"
  readonly className?: string
  readonly as?: ElementType
}

const WIDTH_MAP: Record<"default" | "wide" | "full", string> = {
  default: "max-w-[1200px]",
  wide: "max-w-[1440px]",
  full: "w-full max-w-none",
}

export function PageContainer({
  children,
  width = "default",
  className,
  as: Component = "div",
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        WIDTH_MAP[width],
        className
      )}
    >
      {children}
    </Component>
  )
}
