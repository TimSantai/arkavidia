import { motion, type MotionValue } from "motion/react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CLOSING_CONTENT, DEMO_TEAM_MEMBERS } from "../../landingData"

const MEMBER_MAP = new Map(DEMO_TEAM_MEMBERS.map((m) => [m.id, m]))

interface TeammateOrbitCard {
  readonly memberId: string
  readonly status: string
  readonly dotColor: string
  readonly positionClass: string
  readonly depthZ: number
  readonly floatOffset: number
  readonly floatDelay: number
}

const HELPED_TEAMMATES: readonly TeammateOrbitCard[] = [
  {
    memberId: "user-rani",
    status: "Keputusan tercatat",
    dotColor: "#4784ff",
    positionClass: "top-2 left-0 sm:top-4 sm:-left-2",
    depthZ: 44,
    floatOffset: -6,
    floatDelay: 0,
  },
  {
    memberId: "user-dimas",
    status: "M1 tetap aman",
    dotColor: "#9669f8",
    positionClass: "top-4 right-0 sm:top-8 sm:-right-2",
    depthZ: 26,
    floatOffset: 6,
    floatDelay: 0.9,
  },
  {
    memberId: "user-budi",
    status: "Pairing 10 mnt",
    dotColor: "#3dafe0",
    positionClass: "bottom-4 left-0 sm:bottom-8 sm:-left-2",
    depthZ: 28,
    floatOffset: 5,
    floatDelay: 1.6,
  },
  {
    memberId: "user-sari",
    status: "Paham DEC-14",
    dotColor: "#44be69",
    positionClass: "bottom-2 right-0 sm:bottom-4 sm:-right-2",
    depthZ: 48,
    floatOffset: -5,
    floatDelay: 2.3,
  },
]

export function HeroAgentStage3D({
  rotateX,
  rotateY,
  active,
  reducedMotion,
  ctaHovered,
}: {
  readonly rotateX: MotionValue<number>
  readonly rotateY: MotionValue<number>
  readonly active: boolean
  readonly reducedMotion: boolean
  readonly ctaHovered: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={active || reducedMotion ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ perspective: 1200 }}
        className="relative h-[340px] w-[320px] select-none sm:h-[420px] sm:w-[440px] lg:h-[450px] lg:w-[480px]"
      >
        <motion.div
          animate={
            reducedMotion || !active ? { y: 0 } : { y: [0, -8, 0] }
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
          className="relative flex size-full items-center justify-center"
        >
          {/* Layer -40px: Grounded deep cobalt shadow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#000d33]/75 blur-[42px]"
            style={{ transform: "translateZ(-40px) translateY(28px)" }}
          />

          {/* Layer -16px: Luminous warm-cobalt ambient aura behind Hero BoopFace */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[56px] sm:size-72"
            style={{
              transform: "translateZ(-16px)",
              background:
                "radial-gradient(circle at 32% 35%, rgb(252 233 194 / 0.52), rgb(110 160 255 / 0.65) 56%, transparent 78%)",
            }}
          />

          {/* Layer 6px: Soft connecting rays from BoopFace toward the 4 teammates */}
          <svg
            viewBox="0 0 480 450"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full"
            style={{ transform: "translateZ(6px)" }}
          >
            <path
              d="M 240 225 Q 160 155 92 78"
              fill="none"
              stroke="rgb(159 193 255 / 0.28)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <path
              d="M 240 225 Q 325 160 390 86"
              fill="none"
              stroke="rgb(196 179 255 / 0.28)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <path
              d="M 240 225 Q 155 295 92 368"
              fill="none"
              stroke="rgb(115 205 248 / 0.28)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <path
              d="M 240 225 Q 330 295 390 374"
              fill="none"
              stroke="rgb(121 217 144 / 0.28)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
          </svg>

          {/* Layer 32px: Iconic solo 3D interactive Hero BoopFace */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{ transform: "translateZ(32px)" }}
          >
            <div className="sm:hidden">
              <AgentStickerAvatar
                role="team"
                state={ctaHovered ? "nudge" : "idle"}
                size={156}
                interactive
                label="Team Agent BERSAMA"
              />
            </div>
            <div className="hidden sm:flex">
              <AgentStickerAvatar
                role="team"
                state={ctaHovered ? "nudge" : "idle"}
                size={212}
                interactive
                label="Team Agent BERSAMA"
              />
            </div>
          </div>

          {/* Surrounding 4 human teammate cards in layered 3D parallax */}
          {HELPED_TEAMMATES.map((item) => {
            const member = MEMBER_MAP.get(item.memberId)
            if (!member) return null

            return (
              <div
                key={item.memberId}
                aria-hidden="true"
                className={`pointer-events-none absolute z-20 ${item.positionClass}`}
                style={{ transform: `translateZ(${item.depthZ}px)` }}
              >
                <motion.div
                  animate={
                    reducedMotion || !active
                      ? { y: 0 }
                      : { y: [0, item.floatOffset, 0] }
                  }
                  transition={
                    reducedMotion || !active
                      ? { duration: 0.2 }
                      : {
                          duration: 5.2,
                          delay: item.floatDelay,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                  className="flex items-center gap-2.5 rounded-2xl border border-white/18 bg-[#001652]/78 px-2.5 py-2 shadow-[0_14px_30px_-10px_rgb(0_12_48/0.65)] backdrop-blur-md sm:px-3"
                >
                  <Avatar size="sm" className="size-8 shrink-0 border border-white/20">
                    <AvatarImage src={member.avatarSrc} alt={member.name} />
                    <AvatarFallback className="bg-[#0c3c9f] text-xs font-semibold text-white">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-left">
                    <p className="font-sans text-xs leading-tight font-semibold text-white">
                      {member.shortName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 font-sans text-xs leading-tight whitespace-nowrap text-[#c6daff]">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.dotColor }}
                      />
                      <span>{item.status}</span>
                    </p>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </motion.div>
      </motion.div>

      <p className="mt-4 font-sans text-xs font-medium tracking-wide text-[#c6daff]/90">
        {CLOSING_CONTENT.clockCaption}
      </p>
    </div>
  )
}
