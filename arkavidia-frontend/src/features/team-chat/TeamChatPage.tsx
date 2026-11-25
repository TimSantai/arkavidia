import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import {
  Bot,
  CheckCircle2,
  GitPullRequestDraft,
  Maximize2,
  Minimize2,
  ShieldAlert,
} from "lucide-react"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Loader } from "@/components/ai-elements/loader"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Suggestion } from "@/components/ai-elements/suggestion"
import { Status, StatusIndicator, StatusLabel } from "@/components/kibo-ui/status"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getStoredDemoUser } from "@/features/auth/components/demoSession"
import { cn } from "@/lib/utils"
import { bersamaApi } from "@/services/api"
import type { ChatMessage, MemoryItem } from "@/types/bersama"
import { TeamChatMessageItem } from "./components/TeamChatMessageItem"
import {
  TEAM_CHAT_SUGGESTIONS,
  USER_AVATAR_MAP,
} from "./components/teamChatAvatars"

export function TeamChatPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const activeUser = useMemo(() => getStoredDemoUser(), [])
  const activeAvatarSrc = USER_AVATAR_MAP[activeUser.id]

  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [brainItems, setBrainItems] = useState<readonly MemoryItem[]>([])
  const [inputText, setInputText] = useState("")
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null)
  const highlightTimerRef = useRef<number | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  useEffect(() => {
    void Promise.all([
      bersamaApi.getTeamMessages(teamId),
      bersamaApi.getProjectBrain(teamId),
    ]).then(([loadedMessages, loadedBrain]) => {
      setMessages(loadedMessages)
      setBrainItems(loadedBrain)
    })
  }, [teamId])

  useEffect(
    () => () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current)
      }
    },
    []
  )

  const brainById = useMemo(
    () => new Map(brainItems.map((item) => [item.id, item])),
    [brainItems]
  )

  const pendingProposals = useMemo(
    () => brainItems.filter((item) => item.status === "proposed"),
    [brainItems]
  )

  const handleJumpToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`chat-msg-${messageId}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    setHighlightedMsgId(messageId)
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current)
    }
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedMsgId((prev) => (prev === messageId ? null : prev))
    }, 2400)
  }, [])

  const handleJumpToPendingProposal = useCallback(() => {
    const targetProposal = pendingProposals[0]
    if (!targetProposal) return
    const msgWithProposal = messages.find(
      (m) => m.proposedMemoryId === targetProposal.id
    )
    if (msgWithProposal) {
      handleJumpToMessage(msgWithProposal.id)
    }
  }, [pendingProposals, messages, handleJumpToMessage])

  const handleConfirmMemory = useCallback(async (memoryId: string) => {
    const updated = await bersamaApi.confirmMemoryItem(memoryId)
    setBrainItems((prev) =>
      prev.map((item) =>
        item.id === memoryId
          ? (updated ?? { ...item, status: "confirmed" })
          : item
      )
    )
  }, [])

  const handleSendText = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim()
      if (!trimmed || isAgentThinking) return

      setInputText("")
      const isIfcLeakAttempt =
        /ruang pribadi|memori pribadi|catatan pribadi/i.test(trimmed)
      const isSummaryRequest =
        !isIfcLeakAttempt &&
        (/ringkas|keputusan|arsitektur/i.test(trimmed) ||
          /@teamagent/i.test(trimmed))
      const isProposalMessage =
        !isIfcLeakAttempt && /^usul:|\bkita pakai\b|\busul\b/i.test(trimmed)

      if (isIfcLeakAttempt) {
        setIsAgentThinking(true)
        await new Promise((resolve) => window.setTimeout(resolve, 480))
        const updatedMessages = await bersamaApi.sendTeamMessage(teamId, trimmed)
        setMessages(updatedMessages)
        setIsAgentThinking(false)
        return
      }

      const updatedMessages = await bersamaApi.sendTeamMessage(teamId, trimmed)
      const latestUserMsg = updatedMessages.at(-1)
      setMessages(updatedMessages)

      if (isProposalMessage && latestUserMsg) {
        setIsAgentThinking(true)
        await new Promise((resolve) => window.setTimeout(resolve, 550))

        const newCode = `DEC-0${brainItems.length + 1}`
        const newProposalId = `mem-prop-${Date.now()}`
        const newMemoryItem: MemoryItem = {
          id: newProposalId,
          code: newCode,
          teamId,
          type: "decision",
          content: {
            title: trimmed.replace(/^usul:\s*/i, ""),
            summary: `Diusulkan oleh ${activeUser.name} di Ruang Tim.`,
            rationale:
              "Menjaga stabilitas endpoint API dari lonjakan request berulang dengan penyimpanan in-memory.",
            rejectedAlternatives: [
              "In-process memory counter (tidak sinkron multi-instance)",
              "Rate limit di sisi klien saja",
            ],
            assigneeId: activeUser.id,
          },
          ownerId: activeUser.id,
          scope: "team",
          sensitivity: "normal",
          status: "proposed",
          aiAssisted: true,
          provenance: `Diekstrak Team Agent dari pesan ${activeUser.name.split(" ")[0]}`,
          kcIds: ["kc-api"],
          sourceMessageIds: [latestUserMsg.id],
          validFrom: new Date().toISOString(),
          validTo: null,
          recordedAt: new Date().toISOString(),
        }

        const agentProposalMsg: ChatMessage = {
          id: `msg-team-prop-${Date.now()}`,
          teamId,
          room: "team",
          authorId: "agent-team",
          authorName: "Team Agent",
          isAgent: true,
          agentKind: "team",
          body: `Kandidat keputusan baru (${newCode}) diekstrak dari usulan ${activeUser.name.split(" ")[0]}. Silakan tinjau dan konfirmasi ke Project Brain M2.`,
          createdAt: new Date().toISOString(),
          scope: "team",
          proposedMemoryId: newProposalId,
          citations: [
            {
              id: `cit-${Date.now()}`,
              label: `Pesan ${activeUser.name.split(" ")[0]} · Baru saja`,
              sourceMessageId: latestUserMsg.id,
              memoryItemId: newProposalId,
              excerpt: trimmed.slice(0, 90),
            },
          ],
        }

        setBrainItems((prev) => [newMemoryItem, ...prev])
        setMessages((prev) => [...prev, agentProposalMsg])
        setIsAgentThinking(false)
        return
      }

      if (isSummaryRequest) {
        setIsAgentThinking(true)
        await new Promise((resolve) => window.setTimeout(resolve, 550))

        const confirmedCount = brainItems.filter(
          (i) => i.status === "confirmed"
        ).length
        const summaryReply: ChatMessage = {
          id: `msg-team-sum-${Date.now()}`,
          teamId,
          room: "team",
          authorId: "agent-team",
          authorName: "Team Agent",
          isAgent: true,
          agentKind: "team",
          body: `Berdasarkan ${confirmedCount} keputusan terkonfirmasi di M2 Project Brain:\n1. DEC-01: Arsitektur MVC dipilih agar pengujian unit terpisah dari UI.\n2. DEC-02: Autentikasi memakai JWT stateless untuk klien web & mobile.\n3. DEC-03: Constraint unik PostgreSQL (poli_id, tanggal, nomor_urut) mencegah duplikasi nomor antrean.`,
          createdAt: new Date().toISOString(),
          scope: "team",
          citations: [
            {
              id: `cit-sum-1-${Date.now()}`,
              label: "Pesan Rani · DEC-01 MVC",
              sourceMessageId: "msg-team-01",
              memoryItemId: "mem-dec-01",
              excerpt: "sebaiknya kita pakai pola MVC agar modul terpisah rapi dan mudah dites.",
            },
            {
              id: `cit-sum-2-${Date.now()}`,
              label: "Pesan Dimas · DEC-02 JWT",
              sourceMessageId: "msg-team-03",
              memoryItemId: "mem-dec-02",
              excerpt: "pakai JWT bukan session server karena nanti antrean mobile juga akses API yang sama",
            },
            {
              id: `cit-sum-3-${Date.now()}`,
              label: "Pesan Budi · DEC-03 DB",
              sourceMessageId: "msg-team-05",
              memoryItemId: "mem-dec-03",
              excerpt: "unique constraint (poli_id, tanggal, nomor_urut) di Postgres",
            },
          ],
        }

        setMessages((prev) => [...prev, summaryReply])
        setIsAgentThinking(false)
      }
    },
    [teamId, isAgentThinking, brainItems, activeUser]
  )

  return (
    <div
      className={cn(
        "fixed flex flex-col bg-surface",
        isFullscreen ? "inset-0 z-40" : "inset-x-0 top-14 bottom-0 z-20 lg:left-64"
      )}
    >
      {/* Top Context Bar — docked into AppShell's empty left/center h-14 header on desktop */}
      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line-subtle bg-surface px-4 py-2.5 sm:px-6",
          !isFullscreen &&
            "lg:fixed lg:top-0 lg:right-52 lg:left-64 lg:z-30 lg:h-14 lg:border-b-0 lg:bg-transparent lg:py-0"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-base font-semibold text-ink-primary sm:text-lg">
            Ruang Tim
          </h1>
          <span className="rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
            M2 TEAM MEMORY
          </span>
          <Status
            status="online"
            className="border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px]"
          >
            <StatusIndicator />
            <StatusLabel className="text-ink-secondary">
              Online · RLS Aktif
            </StatusLabel>
          </Status>
        </div>

        <div className="flex items-center gap-2">
          {pendingProposals.length > 0 ? (
            <button
              type="button"
              onClick={handleJumpToPendingProposal}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-default bg-warning-subtle px-3 py-1 font-mono text-xs font-medium text-text-warning transition-colors hover:border-line-active"
            >
              <GitPullRequestDraft className="size-3.5" />
              <span>{pendingProposals.length} Usulan Menunggu</span>
            </button>
          ) : (
            <Link
              to={`/teams/${teamId}/brain`}
              className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-3 py-1 font-mono text-xs font-medium text-text-success"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Semua Terkonfirmasi</span>
            </Link>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            title={isFullscreen ? "Keluar layar penuh (Esc)" : "Layar penuh"}
            className="border-line-subtle bg-canvas text-ink-secondary hover:text-ink-primary"
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable AI Elements Conversation Stream */}
      <Conversation className="min-h-0 flex-1 overflow-hidden bg-canvas/35 [&>div]:h-full [&>div]:overflow-y-auto">
        <ConversationContent className="mx-auto w-full max-w-5xl gap-3 px-4 py-5 sm:px-8">
          {messages.map((msg) => (
            <TeamChatMessageItem
              key={msg.id}
              message={msg}
              activeUserId={activeUser.id}
              teamId={teamId}
              proposedItem={
                msg.proposedMemoryId
                  ? brainById.get(msg.proposedMemoryId)
                  : undefined
              }
              isHighlighted={highlightedMsgId === msg.id}
              onJumpToMessage={handleJumpToMessage}
              onConfirmMemory={handleConfirmMemory}
            />
          ))}

          {isAgentThinking && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-brand text-on-brand">
                <Bot className="size-4" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line-subtle bg-surface px-3.5 py-2 text-xs shadow-surface">
                <Loader size={14} className="text-ink-link" />
                <Shimmer duration={1.4} className="font-mono text-xs">
                  Team Agent mengevaluasi Cedar Policy &amp; memori M2...
                </Shimmer>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="right-6 bottom-4 left-auto translate-x-0 border-line-subtle bg-surface-raised text-ink-primary shadow-raised" />
      </Conversation>

      {/* Bottom Sticky Quick Prompt Chips + PromptInput Composer */}
      <div className="shrink-0 border-t border-line-subtle bg-surface px-4 py-3 sm:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {TEAM_CHAT_SUGGESTIONS.map((chip) => (
              <Suggestion
                key={chip.id}
                suggestion={chip.prompt}
                onClick={(prompt) => void handleSendText(prompt)}
                className={cn(
                  "h-7 rounded-full border px-3 text-xs font-medium",
                  chip.isRedTeam
                    ? "border-line-error/40 bg-error-subtle/60 text-text-error hover:bg-error-subtle"
                    : "border-line-subtle bg-canvas text-ink-secondary hover:border-line-default hover:text-ink-primary"
                )}
              >
                {chip.isRedTeam && <ShieldAlert className="mr-1 size-3 shrink-0" />}
                <span>{chip.label}</span>
              </Suggestion>
            ))}
          </div>

          <PromptInput
            onSubmit={({ text }) => void handleSendText(text || inputText)}
            className="[&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-line-default [&_[data-slot=input-group]]:bg-canvas/45"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan ke tim atau mention @TeamAgent..."
                className="min-h-11 px-3.5 py-2.5 text-sm text-ink-primary"
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-line-subtle/60 px-3 py-1.5">
              <PromptInputTools className="gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface py-0.5 pr-2.5 pl-1">
                  <Avatar size="sm" className="size-4">
                    {activeAvatarSrc && (
                      <AvatarImage src={activeAvatarSrc} alt={activeUser.name} />
                    )}
                    <AvatarFallback className="text-[9px] font-semibold">
                      {activeUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] font-medium text-ink-secondary">
                    {activeUser.name.split(" ")[0]}
                  </span>
                </div>
                <span className="rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-text-info">
                  M2 TEAM
                </span>
              </PromptInputTools>

              <PromptInputSubmit
                status={isAgentThinking ? "submitted" : undefined}
                disabled={!inputText.trim() || isAgentThinking}
                className="bg-brand text-on-brand hover:bg-brand-hover disabled:opacity-40"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
