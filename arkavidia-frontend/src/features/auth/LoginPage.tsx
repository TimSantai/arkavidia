import { Link } from "react-router"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CURRENT_USER } from "@/mocks/seedData"

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-md border border-line-subtle bg-surface shadow-raised">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-semibold text-on-brand">
              B
            </span>
            <span className="font-mono text-xs text-ink-tertiary">TRACK A · S1 AUTH</span>
          </div>
          <CardTitle className="text-xl font-semibold">Masuk ke BERSAMA</CardTitle>
          <CardDescription className="text-ink-secondary">
            Gunakan akun kampus untuk bergabung ke ruang kerja proyek timmu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-line-subtle bg-canvas p-3 text-xs text-ink-secondary">
            <div className="flex items-center gap-2 font-medium text-ink-primary">
              <ShieldCheck className="size-4 text-text-success" />
              Mode Demo Aktif ({CURRENT_USER.name})
            </div>
            <p className="mt-1 text-ink-tertiary">
              Persetujuan eksplisit Explain-back & voice note (UU PDP) akan dibangun pada Issue Track A S1.
            </p>
          </div>
          <Button className="w-full" asChild>
            <Link to="/teams">Lanjut sebagai {CURRENT_USER.name}</Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/">Kembali ke Landing Page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
