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
    <div className="min-h-full bg-canvas text-ink-primary overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Responsive Layout: Column on mobile (with profile on top), 2-col on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Mobile Profile Panel (shown at top on < 1024px) */}
          <div className="block lg:hidden w-full">
            <ProfilePanel
              user={activeUser}
              teamId={teamId}
              stats={USER_STATS_DATA}
              understandings={myUnderstanding}
              health={TEAM_HEALTH_DATA}
            />
          </div>

          {/* Main Column */}
          <main className="w-full space-y-6 sm:space-y-8 min-w-0">
            {/* 1. Greeting Header */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <GreetingHeader
                userName={activeUser.name}
                teamId={teamId}
                courseSubtitle="Minggu ke-6 · Kelompok 4 PBO"
              />
            </motion.div>

            {/* 2. Knowledge Component Filter Chips */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            >
              <KcFilterChips
                kcs={TEAM_HOME_KCS}
                selectedKcId={selectedKcId}
                onSelectKc={setSelectedKcId}
              />
            </motion.div>

            {/* 3. Section: Tugas minggu ini */}
            <section
              aria-labelledby="section-tasks-heading"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2
                    id="section-tasks-heading"
                    className="font-heading font-semibold text-xl sm:text-2xl text-ink-primary tracking-tight"
                  >
                    Tugas minggu ini
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-well text-ink-secondary tabular-nums">
                    {filteredTasks.length}
                  </span>
                </div>
                <Link
                  to={`/teams/${teamId}/understanding`}
                  className="text-sm font-medium text-ink-link hover:underline transition-colors"
                >
                  Lihat semua
                </Link>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: shouldReduceMotion ? 0 : 0.05 + index * 0.05,
                        ease: "easeOut",
                      }}
                      className="h-full"
                    >
                      <WeeklyTaskCard
                        task={task}
                        kcs={TEAM_HOME_KCS}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-surface-raised border border-line-subtle shadow-card p-8 text-center space-y-2">
                  <p className="font-semibold text-ink-primary">
                    Tidak ada tugas untuk filter ini
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    Semua tugas terkait KC ini sudah diselesaikan atau dijadwalkan.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedKcId(null)}
                    className="mt-2 text-xs font-medium text-ink-link hover:underline"
                  >
                    Tampilkan semua KC
                  </button>
                </div>
              )}
            </section>

            {/* 4. Section: Keputusan yang menyangkut tugasmu */}
            <section
              aria-labelledby="section-decisions-heading"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2
                    id="section-decisions-heading"
                    className="font-heading font-semibold text-xl sm:text-2xl text-ink-primary tracking-tight"
                  >
                    Keputusan yang menyangkut tugasmu
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-well text-ink-secondary tabular-nums">
                    {filteredDecisions.length}
                  </span>
                </div>
                <Link
                  to={`/teams/${teamId}/brain`}
                  className="text-sm font-medium text-ink-link hover:underline transition-colors"
                >
                  Lihat semua
                </Link>
              </div>

              {filteredDecisions.length > 0 ? (
                <div className="space-y-3">
                  {filteredDecisions.map((decision, index) => (
                    <motion.div
                      key={decision.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: shouldReduceMotion ? 0 : 0.1 + index * 0.05,
                        ease: "easeOut",
                      }}
                    >
                      <DecisionProgressRow
                        decision={decision}
                        kcs={TEAM_HOME_KCS}
                        teamId={teamId}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-surface-raised border border-line-subtle shadow-card p-8 text-center space-y-2">
                  <p className="font-semibold text-ink-primary">
                    Tidak ada keputusan untuk KC ini
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    Belum ada memory record keputusan tim yang ditandai dengan KC ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedKcId(null)}
                    className="mt-2 text-xs font-medium text-ink-link hover:underline"
                  >
                    Tampilkan semua KC
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Desktop Profile Panel (Sticky on >= 1024px) */}
          <div className="hidden lg:block w-[340px] shrink-0 sticky top-6">
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
