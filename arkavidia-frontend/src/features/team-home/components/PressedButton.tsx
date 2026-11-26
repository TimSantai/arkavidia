import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Link } from "react-router"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PressedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly to?: string
  readonly variant?: "default" | "accent"
  readonly size?: "sm" | "md" | "lg"
  readonly children: ReactNode
  readonly className?: string
  readonly showAccentIcon?: boolean
}

export function PressedButton({
  to,
  variant = "default",
  size = "md",
  children,
  className,
  showAccentIcon = true,
  disabled,
  type = "button",
  ...rest
}: PressedButtonProps) {
  const isAccent = variant === "accent"

  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-xs gap-1.5"
      : size === "lg"
        ? "h-11 px-5 text-base gap-2"
        : "h-10 px-4 text-sm gap-2"

  const variantClasses = isAccent
    ? "bg-surface-raised border border-brand-subtle text-ink-primary shadow-[0_3px_0_0_var(--bg-brand)] active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--bg-brand)] hover:bg-surface-top"
    : "bg-surface-raised border border-line-subtle text-ink-primary shadow-[0_3px_0_0_var(--border-subtle)] active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--border-subtle)] hover:bg-surface-top"

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-full font-medium cursor-pointer select-none",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-100 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
    sizeClasses,
    variantClasses,
    className
  )

  const content = (
    <>
      {isAccent && showAccentIcon && (
        <Sparkles className="size-4 text-ink-link shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={baseClasses} {...rest}>
      {content}
    </button>
  )
}
