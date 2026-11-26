import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { useInView, useReducedMotion } from "motion/react"

export interface ScenePlaybackState {
  readonly ref: RefObject<HTMLElement | null>
  readonly playKey: number
  readonly replay: () => void
  readonly isStatic: boolean
}

const SCENE_DURATION_MS = 2300

export function useScenePlayback({
  index,
}: {
  readonly index: number
}): ScenePlaybackState {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReducedMotion = useReducedMotion() ?? false

  const [playKey, setPlayKey] = useState(0)
  const playingUntilRef = useRef(0)

  useEffect(() => {
    if (!inView || prefersReducedMotion) return
    const timer = window.setTimeout(() => {
      playingUntilRef.current = Date.now() + SCENE_DURATION_MS
      setPlayKey((prev) => prev + 1)
    }, index * 400)

    return () => window.clearTimeout(timer)
  }, [inView, index, prefersReducedMotion])

  const replay = useCallback(() => {
    if (prefersReducedMotion) return
    const now = Date.now()
    if (now < playingUntilRef.current) return
    playingUntilRef.current = now + SCENE_DURATION_MS
    setPlayKey((prev) => prev + 1)
  }, [prefersReducedMotion])

  return {
    ref,
    playKey,
    replay,
    isStatic: prefersReducedMotion,
  }
}
