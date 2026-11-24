import { useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { Team } from "@/types/bersama"

export function TeamsPage() {
  const [teams, setTeams] = useState<readonly Team[]>([])

  useEffect(() => {
    void bersamaApi.getTeams().then(setTeams)
  }, [])

  return (
    <div className="min-h-screen bg-canvas px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-ink-tertiary">TRACK A · S1 TEAMS</span>
            <h1 className="font-heading text-2xl font-semibold text-ink-primary">Pilih Tim Proyek</h1>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">Landing Page</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id} className="border border-line-subtle bg-surface shadow-surface">
              <CardHeader>
                <span className="font-mono text-xs text-ink-tertiary">{team.courseCode}</span>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription className="text-ink-secondary">{team.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                  <Users className="size-3.5" />
                  {team.members.length} anggota · Kode: <code className="font-mono">{team.inviteCode}</code>
                </span>
                <Button size="sm" className="gap-1.5" asChild>
                  <Link to={`/teams/${team.id}/chat`}>
                    Masuk
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
