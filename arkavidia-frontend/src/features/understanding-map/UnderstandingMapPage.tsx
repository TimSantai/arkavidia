import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { BarChart3, HelpCircle, PieChart, ShieldCheck } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/layout/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, PillIndicator } from "@/components/kibo-ui/pill"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getStoredDemoUser } from "@/features/auth/components/demoSession"
import { bersamaApi } from "@/services/api"
import { SEED_USERS } from "@/mocks/seedData"
import type { Team, TeamUnderstandingMetrics } from "@/types/bersama"
import { BusFactorGauge } from "./components/BusFactorGauge"
import { CoverageMatrix } from "./components/CoverageMatrix"
import { KcDetailCard } from "./components/KcDetailCard"
import { SiloPairingPanel } from "./components/SiloPairingPanel"

export function UnderstandingMapPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [metrics, setMetrics] = useState<TeamUnderstandingMetrics | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [selectedKcId, setSelectedKcId] = useState<string | null>("kc-jwt")
  const activeUser = getStoredDemoUser()

  useEffect(() => {
    void bersamaApi.getTeamUnderstanding(teamId).then((data) => {
      setMetrics(data)
      const silo = data.coverageByKc.find((c) => c.isSilo)
      if (silo) {
        setSelectedKcId(silo.kc.id)
      } else if (data.coverageByKc.length > 0) {
        setSelectedKcId(data.coverageByKc[0].kc.id)
      }
    })
    void bersamaApi.getTeamById(teamId).then((t) => {
      if (t) setTeam(t)
    })
  }, [teamId])

  if (!metrics) {
    return (
      <PageContainer width="wide" className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="h-48 rounded-2xl border border-line-subtle bg-surface-card p-5"
            >
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="mt-4 h-8 w-24 rounded bg-muted/80" />
              <div className="mt-4 h-3 w-full rounded bg-muted/60" />
            </div>
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-line-subtle bg-surface-card p-5" />
      </PageContainer>
    )
  }

  const members = team?.members ?? SEED_USERS
  const selectedSummary =
    metrics.coverageByKc.find((c) => c.kc.id === selectedKcId) ?? metrics.coverageByKc[0]
  const siloKc = metrics.coverageByKc.find((c) => c.isSilo)
  const siloExpert = siloKc?.experts[0]

  return (
    <PageContainer width="wide" className="space-y-6 sm:space-y-8">
      {/* 1. Standardized Unified Header */}
      <PageHeader
        title={
          <>
            Peta <span className="font-display-oblique text-ink-link">Pemahaman</span> Tim
          </>
        }
        description="Kesehatan konsep tim, deteksi silo pengetahuan, dan peluang sesi belajar bareng."
        badge={
          <div className="flex items-center gap-2">
            <Pill
              variant="secondary"
              className="border border-brand-subtle bg-wash-brand text-xs font-medium text-ink-link"
            >
              <PillIndicator variant="success" />
              <span>Murni formatif · Bukan nilai kuliah</span>
            </Pill>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Detail privasi M3 dan etika formatif"
                  className="inline-flex size-7 items-center justify-center rounded-full border border-line-subtle bg-surface-card text-ink-secondary transition-[background-color,color] duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <PopoverHeader>
                  <PopoverTitle>Privasi M3 & Etika Formatif</PopoverTitle>
                  <PopoverDescription>
                    Skor probabilitas P(L) hanya ditampilkan eksak untuk akunmu ({activeUser.name}).
                    Rekan tim ditampilkan dengan framing kesiapan positif tanpa peringkat atau nilai huruf.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </div>
        }
      />

      {/* Compact Privacy Strip */}
      <div className="flex items-center gap-3 rounded-2xl border border-brand-subtle bg-wash-brand px-4 py-3 text-xs text-ink-primary">
        <ShieldCheck className="size-4 shrink-0 text-ink-link" aria-hidden="true" />
        <p className="text-ink-secondary">
          Skor angka <strong className="text-ink-primary">P(L)</strong> bersifat privat untuk{" "}
          <strong className="text-ink-primary">{activeUser.name}</strong>. Rekan lain tampil sebagai{" "}
          <span className="font-medium text-text-success">Bisa Membantu</span> atau{" "}
          <span className="font-medium text-ink-primary">Sesi Bareng</span>.
        </p>
      </div>

      {/* 2. Top KPI Row (3 Plain Surface Cards) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Metric 1: Knowledge Bus Factor Gauge */}
        <BusFactorGauge
          busFactor={metrics.busFactor}
          totalMembers={members.length}
          siloKcTitle={siloKc?.kc.name ?? "Autentikasi JWT"}
          siloExpertName={siloExpert?.name.split(" ")[0] ?? "Dimas"}
        />

        {/* Metric 2: Coverage Keseluruhan Tim */}
        <Card className="relative overflow-hidden rounded-3xl border border-line-subtle bg-surface-card transition-[border-color] duration-150 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-ink-secondary">
                  Coverage tim
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Cara hitung Coverage Tim"
                      className="inline-flex size-5 items-center justify-center rounded-full text-ink-tertiary transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <HelpCircle className="size-3.5" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72">
                    <PopoverHeader>
                      <PopoverTitle>Bayesian Knowledge Tracing</PopoverTitle>
                      <PopoverDescription>
                        Dihitung dari BKT dengan forgetting rate terhadap ambang penguasaan mandiri τ = 0.70.
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 text-xs font-semibold text-ink-link">
                <BarChart3 className="size-3.5" aria-hidden="true" />
                Ambang 0.70
              </span>
            </div>
            <CardTitle className="flex items-baseline gap-2 pt-1">
              <span className="kpi-hero text-4xl font-semibold text-ink-primary">
                {metrics.overallCoveragePercent}%
              </span>
              <span className="text-sm font-normal text-ink-secondary tabular-nums">
                kapasitas
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-ink-secondary">
                <span>Distribusi (8/16 slot)</span>
                <span className="font-medium tabular-nums">50% tim</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-brand transition-[width] duration-300 ease-out"
                  style={{ width: "25%" }}
                  title="KC-01 MVC (3/4 anggota paham)"
                />
                <div
                  className="bg-brand transition-[width] duration-300 ease-out"
                  style={{ width: "12.5%" }}
                  title="KC-02 JWT (1/4 anggota paham)"
                />
                <div
                  className="bg-brand transition-[width] duration-300 ease-out"
                  style={{ width: "12.5%" }}
                  title="KC-03 DB (2/4 anggota paham)"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand" /> MVC
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand" /> JWT
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand" /> DB & REST
                </span>
              </div>
            </div>

            <p className="rounded-xl bg-surface p-2.5 text-xs leading-relaxed text-ink-secondary">
              Sesi Explain-Back pada <strong className="text-ink-primary">KC-02</strong> menaikkan
              coverage ke 62%.
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Konsentrasi Pengetahuan (Indeks Gini) */}
        <Card className="relative overflow-hidden rounded-3xl border border-line-subtle bg-surface-card transition-[border-color] duration-150 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-ink-secondary">
                  Indeks Gini
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Penjelasan Indeks Gini"
                      className="inline-flex size-5 items-center justify-center rounded-full text-ink-tertiary transition-[background-color,color] duration-150 hover:bg-muted/60 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <HelpCircle className="size-3.5" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72">
                    <PopoverHeader>
                      <PopoverTitle>Konsentrasi Pengetahuan</PopoverTitle>
                      <PopoverDescription>
                        Koefisien Gini dihitung dari distribusi P(L) seluruh anggota per KC. 0.00 berarti merata sempurna, 1.00 terpusat pada satu orang.
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-semibold text-text-success">
                <PieChart className="size-3.5" aria-hidden="true" />
                Seimbang
              </span>
            </div>
            <CardTitle className="flex items-baseline gap-2 pt-1">
              <span className="kpi-hero text-4xl font-semibold text-ink-primary">
                {metrics.giniCoefficient}
              </span>
              <span className="text-sm font-normal text-ink-secondary tabular-nums">
                dari 1.00
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-ink-secondary">
                <span>Skala Konsentrasi</span>
                <span className="font-semibold tabular-nums text-ink-primary">
                  G = {metrics.giniCoefficient}
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-success via-warning to-error transition-[width] duration-300 ease-out"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full bg-ink-primary shadow-xs"
                  style={{ left: `${Math.min(100, metrics.giniCoefficient * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs tabular-nums text-ink-tertiary">
                <span>0.00</span>
                <span>0.50</span>
                <span>1.00</span>
              </div>
            </div>

            <p className="rounded-lg bg-surface p-2.5 text-xs leading-relaxed text-ink-secondary">
              Sebaran pemahaman cukup merata, namun modul <strong className="text-ink-primary">JWT</strong> masih terkonsentrasi.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Interactive Coverage Matrix */}
      <CoverageMatrix
        coverageList={metrics.coverageByKc}
        members={members}
        masteryMatrix={metrics.masteryMatrix}
        currentUserId={activeUser.id}
        selectedKcId={selectedKcId}
        onSelectKc={setSelectedKcId}
      />

      {/* 4. Selected KC Detail Card */}
      {selectedSummary && <KcDetailCard summary={selectedSummary} teamId={teamId} />}

      {/* 5. Silo Alert & Pairing Flow */}
      <SiloPairingPanel
        suggestions={metrics.pairingSuggestions}
        teamId={teamId}
        busFactor={metrics.busFactor}
        siloKcTitle={siloKc?.kc.name}
        siloExpertName={siloExpert?.name.split(" ")[0]}
      />
    </PageContainer>
  )
}
