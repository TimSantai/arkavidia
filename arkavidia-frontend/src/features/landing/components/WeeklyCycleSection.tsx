import { WEEKLY_CYCLES, type WeeklyCyclePhase } from "../landingData"
import { CaptureIllustration } from "./weekly-cycle/CaptureIllustration"
import { CheckIllustration } from "./weekly-cycle/CheckIllustration"
import { CloseGapIllustration } from "./weekly-cycle/CloseGapIllustration"
import { CycleCard } from "./weekly-cycle/CycleCard"
import { MapIllustration } from "./weekly-cycle/MapIllustration"

function renderPhaseIllustration(
  id: WeeklyCyclePhase["id"],
  opts: { readonly active: boolean; readonly reducedMotion: boolean }
) {
  switch (id) {
    case "capture":
      return <CaptureIllustration {...opts} />
    case "map":
      return <MapIllustration {...opts} />
    case "check":
      return <CheckIllustration {...opts} />
    case "close":
      return <CloseGapIllustration {...opts} />
  }
}

export function WeeklyCycleSection() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-heading"
      className="scroll-mt-24 bg-[#f4f6f9] py-24 sm:py-32 dark:bg-[#1d1e21]"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="cara-kerja-heading"
            className="font-display text-[2.5rem] leading-[0.98] font-semibold tracking-[-0.045em] text-[#1d1e21] text-balance sm:text-6xl lg:text-7xl dark:text-ink-primary"
          >
            Empat langkah.
            <br />
            Lima menit seminggu.
          </h2>
          <p className="mt-4 max-w-[520px] font-sans text-base leading-relaxed text-ink-secondary text-pretty sm:text-lg">
            Tangkap, petakan, uji paham, tutup celah. Siklus yang berulang tiap
            minggu.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
          {WEEKLY_CYCLES.map((phase, index) => (
            <CycleCard
              key={phase.id}
              phase={phase}
              index={index}
              renderIllustration={(opts) =>
                renderPhaseIllustration(phase.id, opts)
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
