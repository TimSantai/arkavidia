import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"

export interface PressedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly to?: string
  readonly size?: "sm" | "md" | "lg"
  readonly children: ReactNode
  readonly className?: string
}

export function PressedButton({
  to,
  size = "md",
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: PressedButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-xs"
      : size === "lg"
        ? "h-11 px-5 text-base"
        : "h-10 px-4 text-sm"

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-full font-medium cursor-pointer select-none",
    "border border-line-default bg-surface-card text-ink-primary hover:bg-surface shadow-control",
    "transition-[background-color,border-color,color] duration-150 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    sizeClasses,
    className
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={baseClasses}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={baseClasses} {...rest}>
      {children}
    </button>
  )
}
