import { motion } from "motion/react"

const HEATMAP_CELLS: readonly {
  readonly color: string
  readonly isSilo?: boolean
}[] = [
  { color: "#c4b3ff" },
  { color: "#7f51db" },
  { color: "#9669f8" },
  { color: "#c4b3ff" },
  { color: "#9669f8" },
  { color: "#3b1873", isSilo: true },
  { color: "#673ab9" },
  { color: "#9669f8" },
  { color: "#7f51db" },
  { color: "#3b1873" },
  { color: "#c4b3ff" },
  { color: "#673ab9" },
]

export function MapIllustration({
  active,
  reducedMotion,
}: {
  readonly active: boolean
  readonly reducedMotion: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className="inline-flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#28292d]/90 p-3.5 select-none"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-sans text-xs font-medium text-[#bec0c5]">
          Coverage 4×3
        </span>
        <span className="rounded-full bg-[#423000] px-2 py-0.5 font-sans text-xs font-semibold text-[#f1d69b]">
          1 Silo
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {HEATMAP_CELLS.map((cell, index) => (
          <motion.div
            key={index}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={
              reducedMotion
                ? { opacity: 1, scale: 1 }
                : active
                  ? cell.isSilo
                    ? {
                        opacity: 1,
                        scale: 1,
                        boxShadow: [
                          "0 0 0 0px rgb(241 214 155 / 0)",
                          "0 0 0 2.5px rgb(241 214 155 / 0.9)",
                          "0 0 0 0px rgb(241 214 155 / 0)",
                        ],
                      }
                    : { opacity: 1, scale: 1 }
                  : { opacity: 0.4, scale: 0.85 }
            }
            transition={
              cell.isSilo && !reducedMotion && active
                ? {
                    opacity: { duration: 0.35, delay: index * 0.04 },
                    scale: { duration: 0.35, delay: index * 0.04 },
                    boxShadow: {
                      duration: 2.2,
                      delay: 0.9,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
                : { duration: 0.35, delay: index * 0.04, ease: "easeOut" }
            }
            className="size-[22px] rounded-md"
            style={{
              backgroundColor: cell.color,
              boxShadow:
                cell.isSilo && reducedMotion
                  ? "0 0 0 2px rgb(241 214 155 / 0.9)"
                  : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
