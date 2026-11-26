import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import cardIndexDividersImg from "@/assets/illustrations/card-index-dividers.png"
import handshakeImg from "@/assets/illustrations/handshake.png"
import studioMicrophoneImg from "@/assets/illustrations/studio-microphone.png"
import { cn } from "@/lib/utils"
import type { KnowledgeComponent } from "@/types/bersama"
import type { WeeklyTask } from "../teamHomeData"

export interface WeeklyTaskCardProps {
  readonly task: WeeklyTask
  readonly kcs: readonly KnowledgeComponent[]
}

const KIND_THEMES: Record<
  WeeklyTask["kind"],
  {
    readonly fillClass: string
    readonly label: string
    readonly illustration: string
    readonly accentTextClass: string
  }
> = {
  "explain-back": {
    fillClass: "bg-[#fef8ec] dark:bg-warning-subtle",
    label: "Explain-back",
    illustration: studioMicrophoneImg,
    accentTextClass: "text-[#755700] dark:text-text-warning",
  },
  pairing: {
    fillClass: "bg-[#fff4f2] dark:bg-error-subtle",
    label: "Sesi Pairing",
    illustration: handshakeImg,
    accentTextClass: "text-[#a22a27] dark:text-text-error",
  },
  "confirm-decision": {
    fillClass: "bg-[#f1f6ff] dark:bg-info-subtle",
    label: "Tinjau Keputusan",
    illustration: cardIndexDividersImg,
    accentTextClass: "text-[#1a51c4] dark:text-text-info",
  },
}

export function WeeklyTaskCard({ task, kcs }: WeeklyTaskCardProps) {
  const kc = kcs.find((k) => k.id === task.kcId)
  const kcCode = kc ? kc.code : "KC"
  const theme = KIND_THEMES[task.kind]

  return (
    <article
      className={cn(
        "rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden min-h-[220px]",
        "transition-[transform,opacity] duration-150 ease-out",
        theme.fillClass
      )}
    >
      {/* 3D Illustration positioned top-right */}
      <img
        src={theme.illustration}
        alt=""
        aria-hidden="true"
        className="absolute top-4 right-4 size-[72px] sm:size-20 object-contain drop-shadow-[0_8px_16px_rgb(29_30_33/0.12)] pointer-events-none select-none"
      />

      {/* Top row: kind label + KC chip */}
      <div className="flex items-center gap-2 pr-20">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            theme.accentTextClass
          )}
        >
          {theme.label}
        </span>
        <span className="bg-white/80 dark:bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-ink-secondary">
          {kcCode}
        </span>
      </div>

      {/* Center: Big progress metric + Task Title */}
      <div className="my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans font-semibold text-3xl sm:text-4xl text-ink-primary tracking-tight leading-none tabular-nums">
            {task.statBig}
          </span>
          <span className="text-xs text-ink-tertiary font-sans font-medium">
            {task.statLabel}
          </span>
        </div>

        <h3 className="font-sans font-semibold text-base sm:text-[17px] text-ink-primary mt-2 line-clamp-2 leading-snug">
          {task.title}
        </h3>
      </div>

      {/* Bottom: contextual deadline meta + text arrow link */}
      <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">
        <span className="text-xs text-ink-tertiary font-sans font-medium">
          {task.meta}
        </span>

        <Link
          to={task.to}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-ink-primary hover:text-ink-link transition-colors duration-150 select-none group"
        >
          <span>{task.cta}</span>
          <ArrowRight
            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  )
}
