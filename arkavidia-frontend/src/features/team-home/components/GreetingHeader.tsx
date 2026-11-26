import { Link } from "react-router"
import { Bot, Plus } from "lucide-react"
import { getGreetingTime } from "../teamHomeData"

export interface GreetingHeaderProps {
  readonly userName: string
  readonly teamId: string
  readonly taskCount?: number
}

export function GreetingHeader({
  userName,
  teamId,
  taskCount = 3,
}: GreetingHeaderProps) {
  const greeting = getGreetingTime()
  const firstName = userName.split(" ")[0] || userName

  // Dynamic Indonesian date, e.g. "Kamis, 26 Nov"
  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date())

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
      {/* Kiri: Sapaan halus + tanggal & ringkasan tugas */}
      <div>
        <p className="font-sans font-semibold text-xl text-ink-primary tracking-tight">
          Selamat {greeting}, {firstName}
        </p>
        <p className="text-xs sm:text-[13px] text-ink-tertiary font-sans mt-0.5">
          {todayStr} ·{" "}
          <span className="text-ink-link font-medium">
            {taskCount} tugas minggu ini
          </span>
        </p>
      </div>

      {/* Kanan: Tombol outline Tanya Agent + tombol bulat aksi */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Link
          to={`/teams/${teamId}/private`}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-line-default bg-surface-card text-sm font-medium text-ink-primary transition-[background-color,border-color,color] duration-150 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring select-none shadow-control"
        >
          <Bot className="size-4 text-ink-link shrink-0" aria-hidden="true" />
          <span>Tanya Agent</span>
        </Link>

        <button
          type="button"
          aria-label="Aksi cepat"
          className="size-10 rounded-full bg-brand text-on-brand flex items-center justify-center transition-colors duration-150 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring select-none shadow-primary"
        >
          <Plus className="size-4.5" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
