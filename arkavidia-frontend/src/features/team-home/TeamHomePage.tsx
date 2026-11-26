import { useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { motion, useReducedMotion } from "motion/react"
import {
  MainWithAside,
  PageContainer,
  PageHeader,
  PageSection,
} from "@/components/layout/page"
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
    <PageContainer width="wide" className="space-y-6 sm:space-y-8">
      {/* 1. Top Bar: Sapaan halus + Aksi Cepat */}
      <GreetingHeader
        userName={activeUser.name}
        teamId={teamId}
        taskCount={allTasks.length}
      />

      {/* 2. Standar PageHeader Beranda + Filter Chip KC */}
      <PageHeader
        title="Beranda"
        description="Ringkasan tugas minggu ini, progres keputusan arsitektur tim, dan pemahaman konsepmu."
        actions={
          <KcFilterChips
            kcs={TEAM_HOME_KCS}
            selectedKcId={selectedKcId}
            onSelectKc={setSelectedKcId}
          />
        }
      />

      {/* 3. Grid Utama Responsif via MainWithAside Primitive */}
      <MainWithAside
        asideWidth="320px"
        sticky={true}
        stickyOffset="top-6"
        main={
          <div className="space-y-8 min-w-0">
            {/* Bagian: Tugas minggu ini */}
            <PageSection
              id="section-tasks"
              title="Tugas minggu ini"
              badge={
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface text-ink-secondary tabular-nums font-semibold">
                  {filteredTasks.length}
                </span>
              }
              action={
                <Link
                  to={`/teams/${teamId}/understanding`}
                  className="text-xs sm:text-sm font-semibold text-ink-link hover:underline transition-colors select-none"
                >
                  Lihat semua
                </Link>
              }
            >
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
                <div className="rounded-3xl bg-surface p-8 text-center space-y-2">
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
            </PageSection>

            {/* Bagian: Keputusan yang menyangkut tugasmu */}
            <PageSection
              id="section-decisions"
              title="Keputusan yang menyangkut tugasmu"
              badge={
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface text-ink-secondary tabular-nums font-semibold">
                  {filteredDecisions.length}
                </span>
              }
              action={
                <Link
                  to={`/teams/${teamId}/brain`}
                  className="text-xs sm:text-sm font-semibold text-ink-link hover:underline transition-colors select-none"
                >
                  Lihat semua
                </Link>
              }
            >
              {filteredDecisions.length > 0 ? (
                <div className="rounded-3xl bg-surface-card border border-line-subtle p-4 sm:p-5">
                  <div className="divide-y divide-line-subtle/50">
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
                <div className="rounded-3xl bg-surface p-8 text-center space-y-2">
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
            </PageSection>
          </div>
        }
        aside={
          <ProfilePanel
            user={activeUser}
            teamId={teamId}
            stats={USER_STATS_DATA}
            understandings={myUnderstanding}
            health={TEAM_HEALTH_DATA}
          />
        }
      />
    </PageContainer>
  )
}
export default TeamHomePage
