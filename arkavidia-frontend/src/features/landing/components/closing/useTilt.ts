import { useEffect, type RefObject } from "react"
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react"

export function useTilt(
  ref: RefObject<HTMLElement | null>,
  opts?: { readonly max?: number; readonly active?: boolean }
): {
  readonly rotateX: MotionValue<number>
  readonly rotateY: MotionValue<number>
} {
  const max = opts?.max ?? 12
  const active = opts?.active ?? true
  const prefersReducedMotion = useReducedMotion() ?? false

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const rotateX = useSpring(rawX, { stiffness: 120, damping: 18 })
  const rotateY = useSpring(rawY, { stiffness: 120, damping: 18 })

  useEffect(() => {
    const el = ref.current
    if (!el || !active || prefersReducedMotion) {
      rawX.set(0)
      rawY.set(0)
      return
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const normY = ((event.clientY - rect.top) / rect.height) * 2 - 1
      const clampedX = Math.max(-1, Math.min(1, normX))
      const clampedY = Math.max(-1, Math.min(1, normY))
      rawY.set(clampedX * max)
      rawX.set(-clampedY * max)
    }

    const handlePointerLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }

    el.addEventListener("pointermove", handlePointerMove, { passive: true })
    el.addEventListener("pointerleave", handlePointerLeave)
    return () => {
      el.removeEventListener("pointermove", handlePointerMove)
      el.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [ref, active, max, prefersReducedMotion, rawX, rawY])

  return { rotateX, rotateY }
}
