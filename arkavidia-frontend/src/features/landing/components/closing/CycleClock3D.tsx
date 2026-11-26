import { useRef, useState } from "react"
import {
  motion,
  useAnimationFrame,
  type MotionValue,
} from "motion/react"
import { CLOSING_CONTENT } from "../../landingData"

const SWEEP_PERIOD_MS = 12000
const STATIC_AMBER_DEG = (3.4 / 7) * 360 // Thursday (Kam)
const STATIC_BLUE_DAY = 3

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const start = polarToCartesian(cx, cy, r, startDeg)
  const end = polarToCartesian(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

export function CycleClock3D({
  rotateX,
  rotateY,
  active,
  reducedMotion,
}: {
  readonly rotateX: MotionValue<number>
  readonly rotateY: MotionValue<number>
  readonly active: boolean
  readonly reducedMotion: boolean
}) {
  const [amberDeg, setAmberDeg] = useState(
    reducedMotion ? STATIC_AMBER_DEG : 0
  )
  const [dayStep, setDayStep] = useState(STATIC_BLUE_DAY)
  const elapsedRef = useRef(0)
  const revolutionsRef = useRef(0)

  useAnimationFrame((_time, delta) => {
    if (reducedMotion || !active) return
    elapsedRef.current += delta
    const revs = Math.floor(elapsedRef.current / SWEEP_PERIOD_MS)
    if (revs !== revolutionsRef.current) {
      revolutionsRef.current = revs
      setDayStep((prev) => (prev + 1) % 7)
    }
    const progress = (elapsedRef.current % SWEEP_PERIOD_MS) / SWEEP_PERIOD_MS
    setAmberDeg(progress * 360)
  })

  const effectiveAmberDeg = reducedMotion ? STATIC_AMBER_DEG : amberDeg
  const effectiveBlueDeg = ((reducedMotion ? STATIC_BLUE_DAY : dayStep) / 7) * 360
  const activeDayIndex = Math.floor(((effectiveAmberDeg % 360) / 360) * 7)

  return (
    <div className="flex flex-col items-center">
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={active || reducedMotion ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ perspective: 1200 }}
        className="relative size-[300px] select-none sm:size-[380px] lg:size-[440px]"
      >
        <motion.div
          animate={
            reducedMotion || !active
              ? { y: 0 }
              : { y: [0, -8, 0] }
          }
          transition={
            reducedMotion || !active
              ? { duration: 0.2 }
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
          style={{
            rotateX: reducedMotion ? 0 : rotateX,
            rotateY: reducedMotion ? 0 : rotateY,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          className="relative size-full"
        >
          {/* Layer -40px: Grounded drop shadow */}
          <div
            className="absolute inset-6 rounded-full bg-black/85 blur-[40px]"
            style={{ transform: "translateZ(-40px) translateY(24px)" }}
          />

          {/* Layer 0px: Metallic bezel ring + right crown */}
          <div
            className="absolute inset-0 rounded-full p-[18px] shadow-[inset_0_2px_6px_rgb(255_255_255/0.16),inset_0_-6px_16px_rgb(0_0_0/0.8)]"
            style={{
              transform: "translateZ(0px)",
              background:
                "conic-gradient(from 40deg, #5a5c60, #1d1e21, #45474b, #1d1e21, #5a5c60)",
            }}
          >
            <div className="size-full rounded-full bg-[#0c0d0f]" />
          </div>
          <div
            className="absolute top-1/2 -right-2.5 h-8 w-3 -translate-y-1/2 rounded-sm border border-white/10"
            style={{
              transform: "translateZ(0px)",
              background: "linear-gradient(180deg, #5a5c60, #1d1e21 55%, #45474b)",
            }}
          />

          {/* Layer 8px: Deep navy radial dial + subtle blue halftone dots */}
          <div
            className="absolute inset-[18px] overflow-hidden rounded-full border border-white/10"
            style={{
              transform: "translateZ(8px)",
              background:
                "radial-gradient(circle at 40% 35%, #10204a, #0c0d0f 70%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(#4784ff 0.9px, transparent 1.5px)",
                backgroundSize: "9px 9px",
              }}
            />
          </div>

          {/* Layer 14px: 4 SVG phase arcs */}
          <svg
            viewBox="0 0 360 360"
            className="absolute inset-[18px] size-[calc(100%-36px)]"
            style={{ transform: "translateZ(14px)" }}
          >
            {CLOSING_CONTENT.phases.map((phase) => {
              const firstDay = phase.days[0]
              const lastDay = phase.days[phase.days.length - 1]
              const startDeg = (firstDay / 7) * 360 + 5
              const endDeg = ((lastDay + 1) / 7) * 360 - 5
              const isLit = reducedMotion
                ? phase.id !== "close"
                : (phase.days as readonly number[]).includes(activeDayIndex)

              return (
                <path
                  key={phase.id}
                  d={describeArc(180, 180, 146, startDeg, endDeg)}
                  fill="none"
                  stroke={phase.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  style={{
                    opacity: isLit ? 1 : 0.25,
                    filter: isLit
                      ? `drop-shadow(0 0 8px ${phase.color})`
                      : "none",
                    transition: "opacity 400ms ease, filter 400ms ease",
                  }}
                />
              )
            })}
          </svg>

          {/* Layer 16px: 7 day ticks & labels */}
          <div
            className="absolute inset-[18px] rounded-full"
            style={{ transform: "translateZ(16px)" }}
          >
            {CLOSING_CONTENT.days.map((day, idx) => {
              const angle = (idx / 7) * 360
              const isCurrent = idx === activeDayIndex
              const labelPos = polarToCartesian(50, 50, 36.5, angle)
              const tickPos = polarToCartesian(50, 50, 44.5, angle)
              return (
                <div key={day}>
                  <span
                    className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${tickPos.x}%`,
                      top: `${tickPos.y}%`,
                      backgroundColor: isCurrent ? "#f1d69b" : "#5a5c60",
                    }}
                  />
                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 font-sans text-xs font-medium tracking-wide"
                    style={{
                      left: `${labelPos.x}%`,
                      top: `${labelPos.y}%`,
                      color: isCurrent ? "#e9ebef" : "#9fa2a7",
                    }}
                  >
                    {day}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Layer 20px: Embossed Allo monogram "B" */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateZ(20px)" }}
          >
            <span
              className="font-display text-[104px] leading-none font-semibold text-[#1d1e21] sm:text-[124px]"
              style={{
                textShadow: "0 1px 0 #323337, 0 -1px 0 #000000",
              }}
            >
              B
            </span>
          </div>

          {/* Layer 26px: Short blue day hand */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateZ(26px)" }}
          >
            <motion.div
              animate={{ rotate: effectiveBlueDeg }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
              className="relative size-full"
            >
              <span
                className="absolute bottom-1/2 left-1/2 h-[22%] w-[4px] -translate-x-1/2 rounded-full bg-[#4784ff]"
                style={{ filter: "drop-shadow(0 0 8px #4784ff)" }}
              />
            </motion.div>
          </div>

          {/* Layer 28px: Main sweeping amber hand */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateZ(28px)" }}
          >
            <div
              className="relative size-full"
              style={{ transform: `rotate(${effectiveAmberDeg}deg)` }}
            >
              <span
                className="absolute bottom-1/2 left-1/2 h-[36%] w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-t from-[#c59b37] to-[#f1d69b]"
                style={{ filter: "drop-shadow(0 0 8px #e0bb6c)" }}
              />
            </div>
          </div>

          {/* Layer 32px: Center pivot cap */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateZ(32px)" }}
          >
            <span className="size-3 rounded-full bg-[#e9ebef] shadow-[0_0_10px_rgb(233_235_239/0.5)]" />
          </div>

          {/* Layer 36px: Specular crystal glass sheen */}
          <div
            className="pointer-events-none absolute inset-[18px] rounded-full"
            style={{
              transform: "translateZ(36px)",
              background:
                "linear-gradient(135deg, rgb(255 255 255 / 0.14), transparent 45%)",
            }}
          />
        </motion.div>
      </motion.div>

      <p className="mt-5 font-sans text-xs font-medium tracking-wide text-[#9fa2a7]">
        {CLOSING_CONTENT.clockCaption}
      </p>
    </div>
  )
}
