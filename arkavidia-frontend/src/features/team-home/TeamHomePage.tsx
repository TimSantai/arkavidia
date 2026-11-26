import { useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { motion, useReducedMotion } from "motion/react"
import { getStoredDemoUser } from "@/features/auth/components/demoSession"
import { DecisionProgressRow } from "./components/DecisionProgressRow"
import { GreetingHeader } from "./components/GreetingHeader"
import { KcFilterChips } from "./components/KcFilterChips"
import { ProfilePanel } from "./components/ProfilePanel"
import { WeeklyTaskCard } from "./components/WeeklyTaskCard"
import {
  getMyUnderstanding,
  getDecisionProgressList,
  getWeeklyTasks,
  TEAM_HEALTH_DATA,
  TEAM_HOME_KCS,
  USER_STATS_DATA,
} from "./teamHomeData"

export function TeamHomePage() {
  const { teamId = "team-pbo-01" } = useParams<{ teamId: string }>()
  const activeUser = getStoredDemoUser()
  const shouldReduceMotion = useReducedMotion()

  const [selectedKcId, setSelectedKcId] = useState<string | null>(null)

  const allTasks = useMemo(() => getWeeklyTasks(teamId), [teamId])
  const allDecisions = useMemo(() => getDecisionProgressList(), [])
  const myUnderstanding = useMemo(() => getMyUnderstanding(), [])

  // Filter tasks & decisions based on active KC chip
  const filteredTasks = useMemo(() => {
    if (!selectedKcId) return allTasks
    return allTasks.filter((task) => task.kcId === selectedKcId)
  }, [allTasks, selectedKcId])

  const filteredDecisions = useMemo(() => {
    if (!selectedKcId) return allDecisions
    return allDecisions.filter((decision) => decision.kcId === selectedKcId)
  }, [allDecisions, selectedKcId])

  return (
    <div className="min-h-full bg-white dark:bg-canvas text-ink-primary overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1280px] mx-auto space-y-6 sm:space-y-7">
        {/* 1. Top Bar: Sapaan halus + Aksi */}
        <GreetingHeader
          userName={activeUser.name}
          teamId={teamId}
          taskCount={allTasks.length}
        />

        {/* 2. Judul "Beranda" + Chip Filter KC */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
          <h1 className="font-heading font-medium text-[2.5rem] leading-none tracking-[-0.02em] text-ink-primary shrink-0">
            Beranda
          </h1>
          <KcFilterChips
            kcs={TEAM_HOME_KCS}
            selectedKcId={selectedKcId}
            onSelectKc={setSelectedKcId}
          />
        </div>

        {/* 3. Grid Utama: Kolom 1-2 (Tugas & Keputusan) + Kolom 3 (Panel Sorotan) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-6 items-start">
          {/* Kolom 1-2: Tugas & Keputusan */}
          <main className="col-span-1 lg:col-span-2 space-y-7 min-w-0">
            {/* Bagian: Tugas minggu ini */}
            <section
              aria-labelledby="section-tasks-heading"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2
                    id="section-tasks-heading"
                    className="font-heading font-medium text-xl sm:text-2xl text-ink-primary tracking-tight"
                  >
                    Tugas minggu ini
                  </h2>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#f6f7f9] dark:bg-surface text-ink-secondary tabular-nums">
                    {filteredTasks.length}
                  </span>
                </div>
                <Link
                  to={`/teams/${teamId}/understanding`}
                  className="text-xs sm:text-sm font-semibold text-ink-link hover:underline transition-colors select-none"
                >
                  Lihat semua
                </Link>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: shouldReduceMotion ? 0 : index * 0.04,
                        ease: "easeOut",
                      }}
                      className="h-full"
                    >
                      <WeeklyTaskCard task={task} kcs={TEAM_HOME_KCS} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-[#f6f7f9] dark:bg-surface p-8 text-center space-y-2">
                  <p className="font-semibold text-ink-primary">
                    Tidak ada tugas untuk KC ini
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    Semua tugas terkait KC ini sudah selesai atau dijadwalkan.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedKcId(null)}
                    className="mt-2 text-xs font-semibold text-ink-link hover:underline"
                  >
                    Tampilkan semua KC
                  </button>
                </div>
              )}
            </section>

            {/* Bagian: Keputusan yang menyangkut tugasmu */}
            <section
              aria-labelledby="section-decisions-heading"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2
                    id="section-decisions-heading"
                    className="font-heading font-medium text-xl sm:text-2xl text-ink-primary tracking-tight"
                  >
                    Keputusan yang menyangkut tugasmu
                  </h2>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#f6f7f9] dark:bg-surface text-ink-secondary tabular-nums">
                    {filteredDecisions.length}
                  </span>
                </div>
                <Link
                  to={`/teams/${teamId}/brain`}
                  className="text-xs sm:text-sm font-semibold text-ink-link hover:underline transition-colors select-none"
                >
                  Lihat semua
                </Link>
              </div>

              {filteredDecisions.length > 0 ? (
                /* Satu kartu Plain berisi daftar baris dengan pemisah border-t */
                <div className="rounded-3xl bg-white dark:bg-surface border border-[#eef0f3] dark:border-line-subtle p-4 sm:p-5">
                  <div className="divide-y divide-[#f1f2f4] dark:divide-line-subtle/50">
                    {filteredDecisions.map((decision) => (
                      <DecisionProgressRow
                        key={decision.id}
                        decision={decision}
                        kcs={TEAM_HOME_KCS}
                        teamId={teamId}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-[#f6f7f9] dark:bg-surface p-8 text-center space-y-2">
                  <p className="font-semibold text-ink-primary">
                    Tidak ada keputusan untuk KC ini
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    Belum ada catatan memori keputusan tim pada KC ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedKcId(null)}
                    className="mt-2 text-xs font-semibold text-ink-link hover:underline"
                  >
                    Tampilkan semua KC
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Kolom 3: Panel Sorotan */}
          <div className="col-span-1 lg:sticky lg:top-6">
            <ProfilePanel
              user={activeUser}
              teamId={teamId}
              stats={USER_STATS_DATA}
              understandings={myUnderstanding}
              health={TEAM_HEALTH_DATA}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default TeamHomePage
