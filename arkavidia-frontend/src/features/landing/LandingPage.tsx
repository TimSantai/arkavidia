import { Link } from "react-router"
import { ArrowRight, Brain, ShieldCheck, Sparkles, Users } from "lucide-react"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/components/theme/useTheme"

const CYCLES = [
  {
    step: "01",
    title: "Tangkap",
    summary: "Ekstraksi kandidat keputusan dari Ruang Tim dengan pola propose-confirm dan bitemporal versioning.",
  },
  {
    step: "02",
    title: "Petakan",
    summary: "Memetakan Knowledge Components (KC), coverage tim, dan metrik Knowledge Bus Factor.",
  },
  {
    step: "03",
    title: "Uji Paham",
    summary: "Explain-back adaptif berbasis IRT 2PL (<= 5 menit/minggu) dengan Conformal Abstention.",
  },
  {
    step: "04",
    title: "Tutup Celah",
    summary: "Silo Alert + sesi pairing 10 menit 'Jelaskan ke aku' serta Tutored Briefing Socratic.",
  },
] as const

export function LandingPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-canvas text-ink-primary">
      <header className="sticky top-0 z-40 border-b border-line-subtle bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-semibold text-on-brand">
              B
            </span>
            <span className="font-heading text-base font-semibold tracking-tight">BERSAMA</span>
            <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink-tertiary">
              v2.0
            </span>
          </Link>

          <nav className="flex items-center gap-2.5">
            <ThemeSwitcher value={theme} onChange={setTheme} />
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/teams/team-pbo-01/chat">Buka Demo Workspace</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="mx-auto max-w-3xl space-y-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface px-3.5 py-1 text-xs font-medium text-ink-secondary shadow-surface">
            <Sparkles className="size-3.5 text-ink-link" />
            Hackvidia 11.0 • AI for Learning and Self-Growth
          </div>

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-ink-primary sm:text-5xl">
            Satu tim, semua paham.
          </h1>

          <p className="text-base leading-relaxed text-ink-secondary sm:text-lg">
            ChatGPT membantu tim tahu <em>apa yang diputuskan</em>.{" "}
            <strong className="font-semibold text-ink-primary">BERSAMA</strong> memastikan setiap
            anggota bisa menjelaskan <em>kenapa</em>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/teams/team-pbo-01/chat">
                Masuk Ruang Tim Demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/teams/team-pbo-01/understanding">Lihat Peta Pemahaman</Link>
            </Button>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CYCLES.map((cycle) => (
            <Card key={cycle.step} className="border border-line-subtle bg-surface shadow-surface">
              <CardHeader>
                <span className="font-mono text-xs font-medium text-ink-tertiary">
                  FASE {cycle.step}
                </span>
                <CardTitle className="text-base font-semibold">{cycle.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-ink-secondary">{cycle.summary}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader>
              <ShieldCheck className="mb-1 size-5 text-ink-link" />
              <CardTitle>Memori 5-Tier & IFC</CardTitle>
              <CardDescription className="text-ink-tertiary">
                Isolasi ketat M1 Privat vs M2 Tim melalui RLS + Cedar Policy sebelum konteks masuk LLM.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader>
              <Brain className="mb-1 size-5 text-ink-link" />
              <CardTitle>Adaptive IRT & Abstention</CardTitle>
              <CardDescription className="text-ink-tertiary">
                Grader berbasis Conformal Risk Control yang tahu kapan harus abstain dan meneruskan ke rekan tim.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader>
              <Users className="mb-1 size-5 text-ink-link" />
              <CardTitle>Knowledge Bus Factor</CardTitle>
              <CardDescription className="text-ink-tertiary">
                Deteksi silo pengetahuan secara formatif — skor pemahaman tidak pernah dipakai untuk nilai kuliah.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  )
}
