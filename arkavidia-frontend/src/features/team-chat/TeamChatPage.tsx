import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router"
import {
  ArrowDown,
  GitPullRequestDraft,
  HelpCircle,
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
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Status, StatusIndicator, StatusLabel } from "@/components/kibo-ui/status"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
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
        "relative flex flex-col h-[calc(100vh-3.5rem)] w-full min-w-0 bg-white dark:bg-surface overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 h-screen"
      )}
    >
      {/* Top Context Bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line-subtle bg-surface-card px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <h1 className="truncate font-heading text-lg sm:text-xl font-medium tracking-tight text-ink-primary">
            Ruang <span className="font-display-oblique text-ink-link">Tim</span>
          </h1>

          <Status
            status="online"
            className="h-7 shrink-0 border border-brand-subtle bg-wash-brand px-2.5 text-xs font-semibold shadow-xs"
          >
            <StatusIndicator />
            <StatusLabel className="text-ink-link">
              M2 <span className="hidden sm:inline">· RLS</span>
            </StatusLabel>
          </Status>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Info ruang memori M2"
                className="rounded-full border-line-subtle bg-surface text-ink-secondary hover:text-ink-primary"
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <PopoverHeader>
                <PopoverTitle>Ruang Tim · Memori M2</PopoverTitle>
                <PopoverDescription>
                  Team Agent hanya mengakses memori tim (M2) yang dikonfirmasi.
                  Catatan pribadi (M1) diblokir otomatis oleh RLS dan Cedar
                  Policy sebelum menyentuh LLM.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsFullscreen((prev) => !prev)}
          aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          title={isFullscreen ? "Keluar layar penuh (Esc)" : "Layar penuh"}
          className="size-9 shrink-0 rounded-full border-line-subtle bg-surface text-ink-secondary hover:text-ink-primary"
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Floating Pending-Proposal Pill */}
      {pendingProposals.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-4">
          <button
            type="button"
            onClick={handleJumpToPendingProposal}
            className="pointer-events-auto inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-subtle bg-white/95 dark:bg-surface/95 py-1.5 pr-2 pl-3 text-xs shadow-md backdrop-blur-md transition-[border-color,transform] duration-150 ease-out hover:border-line-active active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <GitPullRequestDraft
              className="size-3.5 shrink-0 text-text-warning"
              aria-hidden="true"
            />
            <span className="font-semibold text-ink-primary">
              {pendingProposals.length} Usulan
            </span>
            <span className="rounded-full border border-brand-subtle bg-wash-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-link">
              {pendingProposals[0].code}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-on-brand">
              Tinjau
              <ArrowDown className="size-3" aria-hidden="true" />
            </span>
          </button>
        </div>
      )}

      {/* Scrollable AI Elements Conversation Stream */}
      <Conversation className="min-h-0 flex-1 overflow-hidden bg-white dark:bg-surface [&>div]:h-full [&>div]:overflow-y-auto">
        <ConversationContent
          className={cn(
            "w-full max-w-[1440px] gap-4 px-4 sm:px-6 lg:px-8 pb-8",
            pendingProposals.length > 0 ? "pt-14" : "pt-5"
          )}
        >
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
              <AgentStickerAvatar
                role="team"
                state="thinking"
                size={36}
                interactive={false}
              />
              <div className="inline-flex items-center gap-2 rounded-2xl border border-brand-subtle bg-wash-brand px-3.5 py-2 text-xs shadow-xs">
                <Loader size={14} className="text-ink-link" />
                <Shimmer duration={1.4} className="text-xs font-medium">
                  Team Agent menyaring memori M2...
                </Shimmer>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="right-6 bottom-36 left-auto translate-x-0 border border-line-subtle bg-surface-card text-ink-primary shadow-md sm:bottom-32" />
      </Conversation>

      {/* Docked Bottom Input Area */}
      <div className="shrink-0 border-t border-line-subtle/50 bg-surface-card/95 dark:bg-surface/95 backdrop-blur-md px-4 pt-2.5 pb-4 sm:px-6 lg:px-8 sm:pb-5">
        <div className="w-full max-w-[1440px] space-y-2.5">
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 pb-0.5">
            {TEAM_CHAT_SUGGESTIONS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => void handleSendText(chip.prompt)}
                className={cn(
                  "inline-flex shrink-0 min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  chip.isRedTeam
                    ? "border-line-error/40 bg-error-subtle text-text-error hover:bg-error-subtle/80"
                    : "border-line-subtle bg-surface text-ink-secondary hover:border-line-active hover:bg-wash-brand hover:text-ink-link"
                )}
              >
                {chip.isRedTeam && (
                  <ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <PromptInput
            onSubmit={({ text }) => void handleSendText(text || inputText)}
            className="[&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:border-line-subtle [&_[data-slot=input-group]]:bg-surface"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan atau mention @TeamAgent..."
                className="min-h-11 px-3.5 py-2.5 text-base text-ink-primary sm:text-sm"
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-line-subtle/60 px-3 py-1.5">
              <PromptInputTools className="gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-card py-0.5 pr-2.5 pl-1">
                  <Avatar size="sm" className="size-5">
                    {activeAvatarSrc && (
                      <AvatarImage
                        src={activeAvatarSrc}
                        alt={activeUser.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-xs font-semibold">
                      {activeUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-ink-secondary">
                    {activeUser.name.split(" ")[0]}
                  </span>
                </div>
                <span className="rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 text-xs font-semibold text-ink-link">
                  M2 Tim
                </span>
              </PromptInputTools>

              <PromptInputSubmit
                status={isAgentThinking ? "submitted" : undefined}
                disabled={!inputText.trim() || isAgentThinking}
                className="rounded-full bg-brand text-on-brand shadow-xs hover:bg-brand-hover disabled:opacity-40"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
