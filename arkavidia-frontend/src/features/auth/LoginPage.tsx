import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mic,
  ShieldCheck,
  Users,
} from "lucide-react"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
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
      nextErrors.email =
        "Format email tidak valid (contoh: nama@mahasiswa.itb.ac.id)."
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
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-sans text-sm font-semibold text-on-brand shadow-primary">
              B
            </span>
            <span className="font-sans text-base font-semibold tracking-tight text-ink-primary">
              BERSAMA
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <ThemeSwitcher value={theme} onChange={setTheme} />
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to="/">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Beranda</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Email Login + UU PDP Explicit Consent */}
          <Card className="rounded-2xl py-0 lg:col-span-7">
            <CardContent className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
                    Masuk ke{" "}
                    <span className="font-display-oblique text-ink-link">
                      Ruang Belajar
                    </span>{" "}
                    Tim
                  </h1>
                  <p className="text-sm text-ink-secondary">
                    Terhubung dengan Project Brain tim dan Ruang Pribadi M1.
                  </p>
                </div>
                <AgentStickerAvatar
                  role="private"
                  size={44}
                  className="hidden sm:inline-flex"
                />
              </div>

              <form
                onSubmit={handleLoginSubmit}
                noValidate
                className="mt-6 space-y-4"
              >
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
                      "h-10 bg-surface text-base text-ink-primary sm:text-sm",
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
                          setErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }))
                        }
                      }}
                      placeholder="Minimal 6 karakter"
                      aria-invalid={Boolean(errors.password)}
                      className={cn(
                        "h-10 bg-surface pr-10 text-base text-ink-primary sm:text-sm",
                        errors.password
                          ? "border-line-error"
                          : "border-line-default"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? "Sembunyikan kata sandi"
                          : "Lihat kata sandi"
                      }
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-ink-secondary transition-colors duration-150 hover:text-ink-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
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
                    "space-y-3 rounded-xl border p-4",
                    errors.consent
                      ? "border-line-error bg-error-subtle/40"
                      : "border-violet-subtle bg-wash-violet"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
                      <ShieldCheck
                        className="size-4 text-text-success"
                        aria-hidden="true"
                      />
                      Persetujuan Privasi · UU PDP
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Detail persetujuan UU PDP No. 27/2022"
                          className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface-card px-2 py-0.5 font-sans text-xs font-medium text-ink-secondary shadow-control transition-colors duration-150 hover:text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <span>UU PDP</span>
                          <HelpCircle className="size-3.5" aria-hidden="true" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80">
                        <PopoverHeader>
                          <PopoverTitle>
                            Perlindungan Data · UU PDP No. 27/2022
                          </PopoverTitle>
                          <PopoverDescription>
                            Catatan pribadi M1 terkunci per akun. Skor pemahaman
                            P(L) hanya untuk refleksi formatif, tidak pernah
                            dipakai untuk nilai kuliah atau dikirim secara
                            individual ke dosen.
                          </PopoverDescription>
                        </PopoverHeader>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-subtle bg-surface-card p-3">
                    <input
                      type="checkbox"
                      checked={mandatoryConsent}
                      onChange={(e) => {
                        setMandatoryConsent(e.target.checked)
                        if (errors.consent) {
                          setErrors((prev) => ({
                            ...prev,
                            consent: undefined,
                          }))
                        }
                      }}
                      className="mt-0.5 size-4 shrink-0 rounded border-line-default accent-[var(--bg-brand)]"
                    />
                    <span className="space-y-0.5 text-xs leading-relaxed text-ink-secondary">
                      <span className="block font-medium text-ink-primary">
                        Wajib: Ekstraksi Project Brain (M2) &amp; Explain-Back
                      </span>
                      <span>
                        Skor pemahaman bersifat formatif dan tidak menjadi nilai
                        kuliah.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line-subtle bg-surface-card p-3">
                    <input
                      type="checkbox"
                      checked={voiceConsent}
                      onChange={(e) => setVoiceConsent(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 rounded border-line-default accent-[var(--bg-brand)]"
                    />
                    <span className="space-y-0.5 text-xs leading-relaxed text-ink-secondary">
                      <span className="inline-flex items-center gap-1.5 font-medium text-ink-primary">
                        <Mic
                          className="size-3.5 text-ink-link"
                          aria-hidden="true"
                        />
                        Opsional: Transkripsi Voice Note Explain-Back
                      </span>
                      <span className="block">
                        Bisa diubah kapan saja atau cukup gunakan input teks.
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
                  className="w-full gap-2"
                >
                  <span>Masuk ke Daftar Tim</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right: Quick Demo Persona Switcher */}
          <Card className="rounded-2xl py-0 lg:col-span-5">
            <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 text-xs font-medium text-ink-link">
                      <Users className="size-3.5" aria-hidden="true" />
                      <span>Persona Demo · IF2210 PBO</span>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-ink-primary">
                      Masuk Instan sebagai Anggota
                    </h2>
                  </div>
                  <AgentStickerAvatar role="team" size={40} />
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
                            ? "border-brand-subtle bg-wash-brand shadow-card"
                            : "border-line-subtle bg-surface hover:border-line-default hover:bg-surface-top"
                        )}
                      >
                        <Avatar>
                          {avatarSrc && (
                            <AvatarImage
                              src={avatarSrc}
                              alt={persona.name}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="border border-line-subtle bg-surface-card text-xs font-semibold text-ink-primary">
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
                                "rounded-full px-2.5 py-0.5 font-sans text-xs font-medium",
                                persona.role === "lead"
                                  ? "bg-info-subtle text-text-info"
                                  : isNewMember
                                    ? "bg-warning-subtle text-text-warning"
                                    : "border border-line-subtle bg-surface-card text-ink-secondary"
                              )}
                            >
                              {persona.role === "lead"
                                ? "Lead"
                                : isNewMember
                                  ? "Baru Mg-3"
                                  : "Member"}
                            </span>
                          </div>

                          <p className="truncate font-sans text-xs text-ink-secondary">
                            {persona.email}
                          </p>

                          {persona.moduleFocus && (
                            <p className="text-xs text-ink-tertiary">
                              {persona.moduleFocus}
                            </p>
                          )}
                        </div>

                        <ArrowRight
                          className="mt-1 size-4 shrink-0 text-ink-tertiary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-primary"
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-line-subtle bg-surface px-3.5 py-2.5 text-xs text-ink-secondary">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-primary">
                  <Lock
                    className="size-3.5 text-ink-link"
                    aria-hidden="true"
                  />
                  Zero-Leak IFC Policy
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-text-success">
                  <Check className="size-3.5" aria-hidden="true" />
                  Aktif
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
