import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { MessageSquare, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { ChatMessage } from "@/types/bersama"

export function TeamChatPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])

  useEffect(() => {
    void bersamaApi.getTeamMessages(teamId).then(setMessages)
  }, [teamId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-ink-tertiary">TRACK A · F1 · M2 TEAM MEMORY</span>
          <h1 className="font-heading text-2xl font-semibold text-ink-primary">Ruang Tim</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1 font-mono text-xs text-ink-secondary">
          <MessageSquare className="size-3.5 text-ink-link" />
          Team Agent hanya membaca M2
        </span>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card key={msg.id} className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {msg.authorName}
                  {msg.isAgent && (
                    <span className="ml-2 rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[11px] text-text-info">
                      TEAM AGENT
                    </span>
                  )}
                </CardTitle>
                <span className="font-mono text-[11px] text-ink-tertiary">
                  {new Date(msg.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
              {msg.policyBlocked && (
                <CardDescription className="flex items-center gap-1.5 text-text-error">
                  <ShieldAlert className="size-3.5" />
                  Diblokir oleh Information-Flow Control (M1 Protected)
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="text-sm text-ink-secondary">{msg.body}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
