import { useState } from "react"
import { Link } from "react-router"
import { Menu, X } from "lucide-react"
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"
import { useTheme } from "@/components/theme/useTheme"
import { Button } from "@/components/ui/button"
import { NAV_LINKS } from "../landingData"

export function LandingHeader() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-semibold text-on-brand">
            B
          </span>
          <span className="font-heading text-base font-semibold tracking-tight text-ink-primary">
            BERSAMA
          </span>
          <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink-tertiary">
            v2.0
          </span>
        </Link>

        <nav aria-label="Navigasi landing page" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeSwitcher value={theme} onChange={setTheme} />

          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/login">Masuk</Link>
          </Button>

          <Button
            size="sm"
            className="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
            asChild
          >
            <Link to="/teams/team-pbo-01/chat">
              <span className="hidden sm:inline">Coba Demo Workspace</span>
              <span className="sm:hidden">Demo</span>
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line-subtle bg-canvas text-ink-primary transition-colors duration-150 hover:bg-muted md:hidden"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="landing-mobile-nav"
          className="border-b border-line-subtle bg-surface-raised px-4 py-3 shadow-raised md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-ink-secondary transition-colors duration-150 hover:bg-muted hover:text-ink-primary"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-line-subtle pt-3">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/login" onClick={closeMenu}>
                  Masuk
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/teams" onClick={closeMenu}>
                  Daftar Tim
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
