import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mic,
  ShieldCheck,
  Users,
} from "lucide-react"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { User } from "@/types/bersama"
import {
  getStoredConsent,
  getStoredDemoUser,
  setStoredConsent,
  setStoredDemoUser,
} from "./components/demoSession"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const initialUser = getStoredDemoUser()
  const initialConsent = getStoredConsent()

  const [email, setEmail] = useState(initialUser.email)
  const [password, setPassword] = useState("bersama-demo-2026")
  const [showPassword, setShowPassword] = useState(false)
  const [mandatoryConsent, setMandatoryConsent] = useState(
    initialConsent.mandatoryAccepted
  )
  const [voiceConsent, setVoiceConsent] = useState(
    initialConsent.voiceProcessingAccepted
  )
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    consent?: string
  }>({})

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const nextErrors: {
      email?: string
      password?: string
      consent?: string
    } = {}

    if (!trimmedEmail) {
      nextErrors.email = "Email kampus wajib diisi."
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Format email tidak valid (contoh: nama@mahasiswa.itb.ac.id)."
    }

    if (!password || password.length < 6) {
      nextErrors.password = "Kata sandi minimal 6 karakter."
    }

    if (!mandatoryConsent) {
      nextErrors.consent =
        "Centang persetujuan pemrosesan pesan UU PDP untuk melanjutkan."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const matchedUser =
      SEED_USERS.find(
        (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase()
      ) ?? initialUser

    setStoredDemoUser(matchedUser.id)
    setStoredConsent({
      mandatoryAccepted: true,
      voiceProcessingAccepted: voiceConsent,
    })
    void navigate("/teams")
  }

  const handleQuickDemoSelect = (persona: User) => {
    setStoredDemoUser(persona.id)
    setStoredConsent({
      mandatoryAccepted: true,
      voiceProcessingAccepted: voiceConsent || true,
    })
    void navigate("/teams")
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-primary">
      <header className="border-b border-line-subtle bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-semibold text-on-brand">
              B
            </span>
            <span className="font-heading text-base font-semibold tracking-tight text-ink-primary">
              BERSAMA
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <ThemeSwitcher value={theme} onChange={setTheme} />
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to="/">
                <ArrowLeft className="size-3.5" />
                <span>Beranda</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Email Login + UU PDP Explicit Consent */}
          <section className="rounded-2xl border border-line-subtle bg-surface p-5 shadow-surface sm:p-7 lg:col-span-7">
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] font-medium text-ink-tertiary">
                AUTENTIKASI &amp; PERSETUJUAN UU PDP
              </p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-primary">
                Masuk ke Ruang Belajar Tim
              </h1>
              <p className="text-sm text-ink-secondary">
                Gunakan akun kampus untuk terhubung dengan Project Brain dan Personal Agent milikmu.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} noValidate className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="text-xs font-medium text-ink-primary"
                >
                  Email Kampus
                </label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  placeholder="nama@mahasiswa.itb.ac.id"
                  aria-invalid={Boolean(errors.email)}
                  className={cn(
                    "h-10 bg-canvas/50 text-ink-primary",
                    errors.email ? "border-line-error" : "border-line-default"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-text-error">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-ink-primary"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    placeholder="Minimal 6 karakter"
                    aria-invalid={Boolean(errors.password)}
                    className={cn(
                      "h-10 bg-canvas/50 pr-10 text-ink-primary",
                      errors.password ? "border-line-error" : "border-line-default"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
                    }
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-ink-tertiary hover:text-ink-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-text-error">{errors.password}</p>
                )}
              </div>

              {/* UU PDP Explicit Consent Block */}
              <div
                className={cn(
                  "space-y-3 rounded-xl border bg-canvas/60 p-4",
                  errors.consent ? "border-line-error" : "border-line-subtle"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
                    <ShieldCheck className="size-4 text-text-success" />
                    Persetujuan Eksplisit (UU PDP No. 27/2022)
                  </span>
                  <span className="rounded-full border border-line-subtle bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-tertiary">
                    PRIVASI
                  </span>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-subtle bg-surface p-3">
                  <input
                    type="checkbox"
                    checked={mandatoryConsent}
                    onChange={(e) => {
                      setMandatoryConsent(e.target.checked)
                      if (errors.consent) {
                        setErrors((prev) => ({ ...prev, consent: undefined }))
                      }
                    }}
                    className="mt-0.5 size-4 shrink-0 rounded border-line-default accent-[var(--bg-brand)]"
                  />
                  <span className="space-y-1 text-xs leading-relaxed text-ink-secondary">
                    <span className="block font-medium text-ink-primary">
                      Persetujuan Wajib: Pemrosesan Project Brain &amp; Explain-Back
                    </span>
                    <span>
                      Saya menyetujui ekstraksi pesan Ruang Tim ke Project Brain (M2) dan kuis refleksi adaptif.{" "}
                      <strong className="font-semibold text-ink-primary">
                        Skor pemahaman tidak pernah dipakai untuk nilai mata kuliah
                      </strong>{" "}
                      dan tidak dikirim ke dosen secara individual.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-subtle bg-surface p-3">
                  <input
                    type="checkbox"
                    checked={voiceConsent}
                    onChange={(e) => setVoiceConsent(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 rounded border-line-default accent-[var(--bg-brand)]"
                  />
                  <span className="space-y-1 text-xs leading-relaxed text-ink-secondary">
                    <span className="inline-flex items-center gap-1.5 font-medium text-ink-primary">
                      <Mic className="size-3.5 text-ink-link" />
                      Opsional: Pemrosesan Rekaman Suara (Voice Note)
                    </span>
                    <span className="block">
                      Izinkan transkripsi suara saat menjawab Explain-Back Check. Dapat diubah kapan saja atau menggunakan input teks saja.
                    </span>
                  </span>
                </label>

                {errors.consent && (
                  <p className="text-xs text-text-error">{errors.consent}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!mandatoryConsent}
                className="w-full gap-2 bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
              >
                <span>Masuk ke Daftar Tim</span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </section>

          {/* Right: Quick Demo Persona Switcher */}
          <aside className="flex flex-col justify-between gap-4 rounded-2xl border border-line-subtle bg-surface p-5 shadow-surface sm:p-6 lg:col-span-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-info-subtle px-2.5 py-0.5 text-[11px] font-medium text-text-info">
                  <Users className="size-3" aria-hidden="true" />
                  <span>Quick Demo Persona Switcher</span>
                </div>
                <h2 className="font-heading text-lg font-semibold text-ink-primary">
                  Masuk Instan sebagai Anggota Demo
                </h2>
                <p className="text-xs leading-relaxed text-ink-secondary">
                  Pilih salah satu peran pada tim IF2210 PBO untuk menguji perbedaan M1 Pribadi, Bus Factor, dan Tutored Briefing anggota baru.
                </p>
              </div>

              <div className="space-y-2.5">
                {SEED_USERS.map((persona) => {
                  const isCurrent = initialUser.id === persona.id
                  const isNewMember = persona.id === "user-sari"
                  const avatarSrc = USER_AVATAR_MAP[persona.id]
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleQuickDemoSelect(persona)}
                      className={cn(
                        "group flex min-h-11 w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99]",
                        isCurrent
                          ? "border-line-active bg-canvas/80 shadow-surface"
                          : "border-line-subtle bg-canvas/40 hover:border-line-default hover:bg-canvas/70"
                      )}
                    >
                      <Avatar>
                        {avatarSrc && (
                          <AvatarImage src={avatarSrc} alt={persona.name} className="object-cover" />
                        )}
                        <AvatarFallback className="border border-line-subtle bg-surface text-xs font-semibold text-ink-primary">
                          {persona.initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="text-sm font-semibold text-ink-primary">
                            {persona.name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium",
                              persona.role === "lead"
                                ? "bg-info-subtle text-text-info"
                                : isNewMember
                                  ? "bg-warning-subtle text-text-warning"
                                  : "border border-line-subtle bg-surface text-ink-tertiary"
                            )}
                          >
                            {persona.role === "lead"
                              ? "LEAD"
                              : isNewMember
                                ? "BARU MG-3"
                                : "MEMBER"}
                          </span>
                        </div>

                        <p className="truncate font-mono text-[11px] text-ink-tertiary">
                          {persona.email}
                        </p>

                        {persona.moduleFocus && (
                          <p className="text-xs text-ink-secondary">
                            {persona.moduleFocus}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="mt-1 size-4 shrink-0 text-ink-tertiary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-primary" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-line-subtle bg-canvas/70 p-3.5 text-xs text-ink-secondary">
              <div className="flex items-center gap-2 font-medium text-ink-primary">
                <Lock className="size-3.5 text-ink-link" />
                <span>Jaminan Isolasi Memori M1 &amp; Hak Hapus</span>
              </div>
              <p className="mt-1 leading-relaxed text-ink-tertiary">
                Klik kartu persona di atas otomatis menyetujui consent demo agar juri bisa langsung berpindah perspektif antar anggota.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-success">
                <Check className="size-3.5" />
                <span>Zero-Leak IFC Policy Aktif</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
