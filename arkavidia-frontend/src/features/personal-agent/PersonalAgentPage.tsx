import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { bersamaApi } from "@/services/api"
import type { ChatMessage } from "@/types/bersama"

export function PersonalAgentPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])

  useEffect(() => {
    void bersamaApi.getPrivateMessages(teamId).then(setMessages)
  }, [teamId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-ink-tertiary">
            TRACK A · F2 + F4 · M1 PRIVATE MEMORY
          </span>
          <h1 className="font-heading text-2xl font-semibold text-ink-primary">
            Ruang Pribadi & Personal Agent
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-3 py-1 font-mono text-xs text-ink-secondary">
          <Lock className="size-3.5 text-ink-tertiary" />
          M1 PRIVATE · Tidak dibagikan tanpa Context Passport
        </span>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card key={msg.id} className="border border-line-subtle bg-surface shadow-surface">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{msg.authorName}</CardTitle>
                <span className="rounded-full border border-line-subtle px-2 py-0.5 font-mono text-[11px] text-ink-tertiary">
                  M1 TAINTED
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-ink-secondary">{msg.body}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
