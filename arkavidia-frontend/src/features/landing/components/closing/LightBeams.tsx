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
      {/* Amber diagonal beam from top-left entering the 3D Hero BoopFace */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
        animate={active || reducedMotion ? { opacity: 1, scaleX: 1 } : undefined}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute top-32 -left-56 h-[160px] w-[520px] origin-right -rotate-[18deg] sm:top-36 lg:top-52 lg:-left-72 lg:h-[180px] lg:w-[820px]"
      >
        <div
          className="absolute inset-0 blur-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(224 187 108 / 0.45) 58%, rgb(241 214 155 / 0.78) 84%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 opacity-60" style={AMBER_DOTS} />
      </motion.div>

      {/* Cool cobalt diagonal beam exiting from the 3D Hero BoopFace toward bottom-right */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
        animate={active || reducedMotion ? { opacity: 1, scaleX: 1 } : undefined}
        transition={{ duration: 1.2, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute top-[250px] left-[36%] h-[160px] w-[520px] origin-left -rotate-[18deg] sm:top-[290px] lg:top-[300px] lg:left-[22%] lg:h-[180px] lg:w-[880px]"
      >
        <div
          className="absolute inset-0 blur-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(110 160 255 / 0.72) 16%, rgb(71 132 255 / 0.36) 52%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 opacity-55" style={BLUE_DOTS} />
      </motion.div>
    </motion.div>
  )
}
