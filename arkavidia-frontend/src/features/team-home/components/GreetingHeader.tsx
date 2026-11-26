import { PressedButton } from "./PressedButton"
import { getGreetingTime } from "../teamHomeData"

export interface GreetingHeaderProps {
  readonly userName: string
  readonly teamId: string
  readonly courseSubtitle?: string
}

export function GreetingHeader({
  userName,
  teamId,
  courseSubtitle = "Minggu ke-6 · Kelompok 4 PBO",
}: GreetingHeaderProps) {
  const greeting = getGreetingTime()
  const firstName = userName.split(" ")[0] || userName

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="font-heading font-semibold text-3xl sm:text-[2.5rem] tracking-[-0.03em] text-ink-primary leading-tight">
          Selamat {greeting}, {firstName}
        </h1>
        <p className="text-sm sm:text-base text-ink-tertiary font-sans">
          {courseSubtitle}
        </p>
      </div>

      <div className="shrink-0">
        <PressedButton
          to={`/teams/${teamId}/private`}
          variant="accent"
          size="md"
        >
          Tanya Agent
        </PressedButton>
      </div>
    </header>
  )
}
