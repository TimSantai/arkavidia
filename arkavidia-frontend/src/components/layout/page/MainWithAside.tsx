import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface MainWithAsideProps {
  readonly main: ReactNode
  readonly aside: ReactNode
  readonly asideWidth?: "320px" | "360px" | "400px"
  readonly sticky?: boolean
  readonly stickyOffset?: string
  readonly className?: string
}

const ASIDE_WIDTH_CLASSES: Record<"320px" | "360px" | "400px", string> = {
  "320px": "lg:grid-cols-[minmax(0,1fr)_320px]",
  "360px": "lg:grid-cols-[minmax(0,1fr)_360px]",
  "400px": "lg:grid-cols-[minmax(0,1fr)_400px]",
}

export function MainWithAside({
  main,
  aside,
  asideWidth = "360px",
  sticky = true,
  stickyOffset = "top-6",
  className,
}: MainWithAsideProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 items-start",
        ASIDE_WIDTH_CLASSES[asideWidth],
        className
      )}
    >
      <div className="min-w-0 w-full">{main}</div>
      <aside
        className={cn(
          "min-w-0 w-full",
          sticky && `lg:sticky lg:${stickyOffset} lg:self-start`
        )}
      >
        {aside}
      </aside>
    </div>
  )
}
