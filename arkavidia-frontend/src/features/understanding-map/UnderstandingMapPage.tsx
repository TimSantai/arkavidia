import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { BarChart3, Info, PieChart, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, PillIndicator } from "@/components/kibo-ui/pill"
import { bersamaApi } from "@/services/api"
import { CURRENT_USER, SEED_USERS } from "@/mocks/seedData"
import type { Team, TeamUnderstandingMetrics } from "@/types/bersama"
import { BusFactorGauge } from "./components/BusFactorGauge"
import { CoverageMatrix } from "./components/CoverageMatrix"
import { KcDetailCard } from "./components/KcDetailCard"
import { SiloPairingPanel } from "./components/SiloPairingPanel"

export function UnderstandingMapPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [metrics, setMetrics] = useState<TeamUnderstandingMetrics | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [selectedKcId, setSelectedKcId] = useState<string | null>("kc-jwt") // Default to silo KC for immediate team awareness

  useEffect(() => {
    void bersamaApi.getTeamUnderstanding(teamId).then((data) => {
      setMetrics(data)
      // If there is a silo KC, auto-select it for actionable attention
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
      <div className="flex h-64 items-center justify-center">
        <p className="font-mono text-xs text-ink-tertiary animate-pulse">
          Memuat visualisasi peta pemahaman tim...
        </p>
      </div>
    )
  }

  const members = team?.members ?? SEED_USERS
  const selectedSummary =
    metrics.coverageByKc.find((c) => c.kc.id === selectedKcId) ?? metrics.coverageByKc[0]
  const siloKc = metrics.coverageByKc.find((c) => c.isSilo)
  const siloExpert = siloKc?.experts[0]

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Formative Ethics Pill */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent-violet">
              TRACK B · FITUR F6 · PETA PEMAHAMAN TIM
            </span>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-ink-primary sm:text-3xl">
            Peta Pemahaman Tim
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-ink-secondary sm:text-sm">
            Pantau kesehatan pemahaman konsep per Knowledge Component (KC), ketahanan tim terhadap
            risiko knowledge loss, dan desentralisasi silo pengetahuan secara jujur dan kolaboratif.
          </p>
        </div>

        {/* Ethics Pill (CONTEXT.md §8.1 & §8.4) */}
        <div className="shrink-0 pt-1">
          <Pill
            variant="secondary"
            className="border border-line-subtle bg-surface shadow-surface text-ink-secondary font-mono text-[11px]"
          >
            <PillIndicator variant="success" pulse />
            <span>Murni formatif · Bukan nilai kuliah</span>
          </Pill>
        </div>
      </div>

      {/* Ethics & Privacy Notice Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-surface p-4 shadow-surface">
        <div className="rounded-lg bg-info-subtle p-2 text-text-info">
          <ShieldCheck className="size-4 shrink-0" />
        </div>
        <div className="space-y-0.5 text-xs text-ink-secondary">
          <p className="font-semibold text-ink-primary">
            Privasi M3 & Etika Formatif Terjamin (CONTEXT.md §8.1 & §8.4)
          </p>
          <p className="leading-relaxed">
            Metrik ini murni formatif untuk kolaborasi tim dan tidak pernah dipakai untuk nilai mata
            kuliah. Skor probabilitas penguasaan individu{" "}
            <span className="font-mono font-semibold text-brand">P(L)</span> hanya ditampilkan
            secara eksak untuk akunmu (<strong>{CURRENT_USER.name}</strong>). Untuk rekan tim lain,
            sistem menampilkan framing kesiapan positif (
            <span className="font-medium text-text-success">Bisa Membantu</span> atau{" "}
            <span className="font-medium text-ink-tertiary">Terbuka Sesi Bareng</span>) tanpa
            perankingan, nilai huruf, atau pelabelan evaluatif.
          </p>
        </div>
      </div>

      {/* 2. Top KPI Row (3 Kartu Metrik) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Metric 1: Knowledge Bus Factor Gauge */}
        <BusFactorGauge
          busFactor={metrics.busFactor}
          totalMembers={members.length}
          siloKcTitle={siloKc?.kc.name ?? "Autentikasi JWT"}
          siloExpertName={siloExpert?.name.split(" ")[0] ?? "Dimas"}
        />

        {/* Metric 2: Coverage Keseluruhan Tim (Expressive Data Exception: Violet + Cyan + Brand) */}
        <Card className="relative overflow-hidden border border-line-subtle bg-surface shadow-surface transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium tracking-wide text-ink-tertiary">
                COVERAGE TIM KESELURUHAN
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-violet/10 px-2.5 py-0.5 text-xs font-semibold text-accent-violet dark:bg-accent-violet/20">
                <BarChart3 className="size-3.5" />
                Ambang τ = 0.70
              </span>
            </div>
            <CardTitle className="flex items-baseline gap-2 pt-1">
              <span className="font-heading text-4xl font-semibold font-mono tabular-nums text-ink-primary">
                {metrics.overallCoveragePercent}%
              </span>
              <span className="font-mono text-sm text-ink-tertiary tabular-nums">
                kapasitas tercapai
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            {/* Expressive Layered Progress Bar using Violet & Cyan & Brand tokens */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
                <span>Distribusi Penguasaan (8/16 slot)</span>
                <span className="tabular-nums">50% Target Tim</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-brand transition-all duration-500"
                  style={{ width: "25%" }}
                  title="KC-01 MVC (3/4 anggota paham)"
                />
                <div
                  className="bg-accent-violet transition-all duration-500"
                  style={{ width: "12.5%" }}
                  title="KC-02 JWT (1/4 anggota paham — Silo)"
                />
                <div
                  className="bg-tertiary transition-all duration-500"
                  style={{ width: "12.5%" }}
                  title="KC-03 DB (2/4 anggota paham)"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-ink-tertiary">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-brand" /> MVC
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-accent-violet" /> JWT (Silo)
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-tertiary" /> DB & REST
                </span>
              </div>
            </div>

            <p className="rounded-lg bg-canvas/40 p-2.5 text-xs leading-relaxed text-ink-secondary">
              Sebanyak <strong className="text-ink-primary">8 dari 16 kapasitas pemahaman</strong>{" "}
              tim telah melampaui ambang batas penguasaan mandiri. Menjadwalkan peer explain-back
              pada KC-02 akan menaikkan coverage menjadi 62%.
            </p>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-ink-tertiary">
              <Info className="size-3.5 shrink-0" />
              <span>Dihitung dari Bayesian Knowledge Tracing (BKT) dengan forgetting rate.</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Konsentrasi Pengetahuan (Indeks Gini) */}
        <Card className="relative overflow-hidden border border-line-subtle bg-surface shadow-surface transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium tracking-wide text-ink-tertiary">
                INDEKS GINI (KONSENTRASI)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-ink-secondary">
                <PieChart className="size-3.5" />
                Distribusi Seimbang
              </span>
            </div>
            <CardTitle className="flex items-baseline gap-2 pt-1">
              <span className="font-heading text-4xl font-semibold font-mono tabular-nums text-ink-primary">
                {metrics.giniCoefficient}
              </span>
              <span className="font-mono text-xs text-ink-tertiary">
                (0.00 = merata · 1.00 = terpusat)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            {/* Gini Spectrum Track */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
                <span>Skala Konsentrasi</span>
                <span className="tabular-nums font-semibold text-ink-secondary">
                  G = {metrics.giniCoefficient}
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-success via-warning to-error transition-all duration-500"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full bg-ink-primary shadow-xs"
                  style={{ left: `${Math.min(100, metrics.giniCoefficient * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-ink-tertiary">
                <span>0.00 (Ideal)</span>
                <span>0.50</span>
                <span>1.00 (Silo Ekstrem)</span>
              </div>
            </div>

            <p className="rounded-lg bg-canvas/40 p-2.5 text-xs leading-relaxed text-ink-secondary">
              Nilai <strong className="font-mono text-ink-primary">{metrics.giniCoefficient}</strong>{" "}
              menunjukkan penguasaan kode antar anggota masih relatif tersebar wajar, namun perlu
              diwaspadai konsentrasi tajam pada modul autentikasi JWT.
            </p>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-ink-tertiary">
              <Info className="size-3.5 shrink-0" />
              <span>Koefisien Gini dihitung atas distribusi nilai P(L) seluruh anggota per KC.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Interactive Coverage Matrix */}
      <CoverageMatrix
        coverageList={metrics.coverageByKc}
        members={members}
        masteryMatrix={metrics.masteryMatrix}
        currentUserId={CURRENT_USER.id}
        selectedKcId={selectedKcId}
        onSelectKc={setSelectedKcId}
      />

      {/* 4. Selected KC Detail Card */}
      {selectedSummary && <KcDetailCard summary={selectedSummary} teamId={teamId} />}

      {/* 5. Silo Alert & Pairing Flow (Fitur F7 — Issue S5b) */}
      <SiloPairingPanel
        suggestions={metrics.pairingSuggestions}
        teamId={teamId}
        busFactor={metrics.busFactor}
        siloKcTitle={siloKc?.kc.name}
        siloExpertName={siloExpert?.name.split(" ")[0]}
      />
    </div>
  )
}
