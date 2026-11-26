import type { CSSProperties } from "react"
import { motion, useTransform, type MotionValue } from "motion/react"

const AMBER_DOTS: CSSProperties = {
  backgroundImage: "radial-gradient(#f1d69b 1.1px, transparent 1.6px)",
  backgroundSize: "7px 7px",
  maskImage: "linear-gradient(90deg, transparent 10%, #000 75%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent 10%, #000 75%, transparent 100%)",
}

const BLUE_DOTS: CSSProperties = {
  backgroundImage: "radial-gradient(#9fc1ff 1.1px, transparent 1.6px)",
  backgroundSize: "7px 7px",
  maskImage: "linear-gradient(90deg, transparent 0%, #000 35%, transparent 92%)",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent 0%, #000 35%, transparent 92%)",
}

export function LightBeams({
  rotateY,
  active,
  reducedMotion,
}: {
  readonly rotateY: MotionValue<number>
  readonly active: boolean
  readonly reducedMotion: boolean
}) {
  const beamOpacity = useTransform(rotateY, [-12, 0, 12], [0.82, 1, 0.85])

  return (
    <motion.div
      aria-hidden="true"
      style={reducedMotion ? undefined : { opacity: beamOpacity }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Amber diagonal beam from top-left entering the 3D clock */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
        animate={active || reducedMotion ? { opacity: 1, scaleX: 1 } : undefined}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute top-24 -left-48 h-[160px] w-[520px] origin-right -rotate-[18deg] sm:top-28 lg:top-44 lg:-left-64 lg:h-[180px] lg:w-[900px]"
      >
        <div
          className="absolute inset-0 blur-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(224 187 108 / 0.48) 60%, rgb(241 214 155 / 0.85))",
          }}
        />
        <div className="absolute inset-0 opacity-60" style={AMBER_DOTS} />
      </motion.div>

      {/* Cool cobalt diagonal beam exiting from the 3D clock toward bottom-right */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
        animate={active || reducedMotion ? { opacity: 1, scaleX: 1 } : undefined}
        transition={{ duration: 1.2, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute top-[250px] left-[42%] h-[160px] w-[520px] origin-left -rotate-[18deg] sm:top-[300px] lg:top-[330px] lg:left-[26%] lg:h-[180px] lg:w-[900px]"
      >
        <div
          className="absolute inset-0 blur-[2px]"
          style={{
            background:
              "linear-gradient(90deg, rgb(110 160 255 / 0.78), rgb(71 132 255 / 0.38) 42%, transparent)",
          }}
        />
        <div className="absolute inset-0 opacity-55" style={BLUE_DOTS} />
      </motion.div>
    </motion.div>
  )
}
