export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Subtle 64px hairline grid behind hero text block */}
      <div className="hero-grid absolute inset-x-0 top-0 h-[760px]" />

      {/* Two-temperature ambient dawn glows anchored behind the lower workspace zone (never behind text) */}
      <div className="absolute top-[520px] left-1/2 h-[540px] w-full max-w-[1280px] -translate-x-1/2 sm:top-[500px]">
        <div className="absolute top-12 -left-16 size-[280px] rounded-full bg-[var(--glow-cool)] opacity-45 blur-[110px] sm:left-4 sm:size-[460px] dark:opacity-20" />
        <div className="absolute top-16 -right-16 size-[280px] rounded-full bg-[var(--glow-warm)] opacity-50 blur-[110px] sm:right-4 sm:size-[460px] dark:opacity-15" />
      </div>
    </div>
  )
}
