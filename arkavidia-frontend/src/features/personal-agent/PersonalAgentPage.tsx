import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router"
import {
  HelpCircle,
  Lock,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
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
import type { AgentSemanticState } from "@/components/bersama/agentConfig"
import { AgentCustomizerDialog } from "@/components/bersama/AgentCustomizerDialog"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
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
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { bersamaApi } from "@/services/api"
import type { ChatMessage, PassportPreview } from "@/types/bersama"
import { ContextPassportDrawer } from "./components/ContextPassportDrawer"
import {
  buildPersonalAgentReply,
  PERSONAL_AGENT_SUGGESTIONS,
} from "./components/personalAgentData"
import { PrivateMessageItem } from "./components/PrivateMessageItem"

export function PersonalAgentPage() {
  const { teamId = "team-pbo-01" } = useParams()
  const activeUser = useMemo(() => getStoredDemoUser(), [])
  const activeAvatarSrc = USER_AVATAR_MAP[activeUser.id]

  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const speakingTimerRef = useRef<number | null>(null)

  const [passportPreview, setPassportPreview] = useState<PassportPreview | null>(
    null
  )
  const [isPassportOpen, setIsPassportOpen] = useState(false)
  const [loadingPassportMsgId, setLoadingPassportMsgId] = useState<
    string | null
  >(null)

  const agentAvatarState: AgentSemanticState = isAgentThinking
    ? "thinking"
    : isAgentSpeaking
      ? "speaking"
      : "idle"

  useEffect(() => {
    window.scrollTo(0, 0)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    return () => {
      if (speakingTimerRef.current) {
        window.clearTimeout(speakingTimerRef.current)
      }
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
    void bersamaApi.getPrivateMessages(teamId).then(setMessages)
  }, [teamId])

  const latestAgentMsgId = useMemo(() => {
    for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
      if (messages[idx]?.isAgent) {
        return messages[idx].id
      }
    }
    return null
  }, [messages])

  const handleOpenPassport = useCallback(async (message: ChatMessage) => {
    setLoadingPassportMsgId(message.id)
    try {
      const preview = await bersamaApi.previewPassport(message.id, message.body)
      setPassportPreview(preview)
      setIsPassportOpen(true)
    } finally {
      setLoadingPassportMsgId(null)
    }
  }, [])

  const handleSendText = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim()
      if (!trimmed || isAgentThinking) return

      setInputText("")
      if (speakingTimerRef.current) {
        window.clearTimeout(speakingTimerRef.current)
      }
      setIsAgentSpeaking(false)

      const optimisticUserMsg: ChatMessage = {
        id: `msg-priv-user-${Date.now()}`,
        teamId,
        room: "private",
        authorId: activeUser.id,
        authorName: activeUser.name,
        isAgent: false,
        body: trimmed,
        createdAt: new Date().toISOString(),
        scope: "private",
        taintedPrivate: true,
      }

      setMessages((prev) => [...prev, optimisticUserMsg])
      setIsAgentThinking(true)

      try {
        const [persisted] = await Promise.all([
          bersamaApi.askPersonalAgent(teamId, trimmed),
          new Promise((resolve) => window.setTimeout(resolve, 480)),
        ])

        const persistedUserMsg = [...persisted]
          .reverse()
          .find((m) => !m.isAgent && m.body === trimmed)

        const smartReplyBody = buildPersonalAgentReply(activeUser, trimmed)
        const smartAgentMsg: ChatMessage = {
          id: `msg-priv-ai-${Date.now() + 1}`,
          teamId,
          room: "private",
          authorId: "agent-personal",
          authorName: `Personal Agent (${activeUser.name.split(" ")[0]})`,
          isAgent: true,
          agentKind: "personal",
          body: smartReplyBody,
          createdAt: new Date().toISOString(),
          scope: "private",
          taintedPrivate: true,
        }

        setMessages((prev) =>
          prev
            .map((msg) =>
              msg.id === optimisticUserMsg.id && persistedUserMsg
                ? {
                    ...msg,
                    id: persistedUserMsg.id,
                  }
                : msg
            )
            .concat(smartAgentMsg)
        )

        setIsAgentSpeaking(true)
        speakingTimerRef.current = window.setTimeout(() => {
          setIsAgentSpeaking(false)
        }, 2200)
      } finally {
        setIsAgentThinking(false)
      }
    },
    [teamId, isAgentThinking, activeUser]
  )

  return (
    <div
      className={cn(
        "fixed flex flex-col bg-canvas",
        isFullscreen
          ? "inset-0 z-40"
          : "inset-x-0 top-14 bottom-0 z-20 lg:left-64"
      )}
    >
      {/* Top Context Bar: docked safely into AppShell's left/center h-14 header on desktop */}
      <div
        className={cn(
          "flex shrink-0 flex-nowrap items-center justify-between gap-2 border-b border-line-subtle bg-surface px-4 py-2.5 sm:px-6",
          !isFullscreen &&
            "lg:fixed lg:top-0 lg:right-64 lg:left-64 lg:z-30 lg:h-14 lg:border-b-0 lg:bg-transparent lg:py-0"
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Lock
            className="size-4 shrink-0 text-ink-violet"
            aria-hidden="true"
          />
          <h1 className="truncate font-display text-xl font-semibold tracking-tight text-ink-primary">
            Ruang{" "}
            <span className="font-display-oblique text-ink-violet">
              Pribadi
            </span>
          </h1>

          <span className="hidden shrink-0 items-center rounded-full border border-violet-subtle bg-wash-violet px-2.5 py-0.5 text-xs font-semibold text-ink-violet shadow-badge sm:inline-flex">
            M1 Private
          </span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Info enkripsi M1 dan kepatuhan UU PDP"
                className="rounded-full border-violet-subtle bg-wash-violet text-ink-violet hover:bg-accent-violet/15"
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <PopoverHeader>
                <PopoverTitle>Ruang Pribadi · M1 Terenkripsi</PopoverTitle>
                <PopoverDescription>
                  Konteks mencakup M1 Pribadi, M2 Tim, dan skor M3 milikmu.
                  Catatan ini terisolasi dan tidak terbaca anggota lain maupun
                  Team Agent tanpa Context Passport (UU PDP).
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-subtle bg-wash-violet py-0.5 pr-1 pl-1 shadow-badge">
            <AgentStickerAvatar
              role="private"
              state={agentAvatarState}
              size={30}
              interactive
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setCustomizerOpen(true)}
              aria-label="Kustomisasi stiker Personal Agent"
              className="h-7 gap-1 rounded-full px-2 text-xs font-medium text-ink-violet hover:bg-surface-top hover:text-ink-violet"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Atur</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            title={isFullscreen ? "Keluar layar penuh (Esc)" : "Layar penuh"}
            className="size-10 shrink-0 border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary sm:size-8"
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable AI Elements Conversation Stream */}
      <Conversation className="min-h-0 flex-1 overflow-hidden bg-canvas [&>div]:h-full [&>div]:overflow-y-auto">
        <ConversationContent className="mx-auto w-full max-w-5xl gap-4 px-4 pt-5 pb-44 sm:px-8 sm:pb-40">
          {messages.map((msg) => (
            <PrivateMessageItem
              key={msg.id}
              message={msg}
              activeUserId={activeUser.id}
              isSpeaking={isAgentSpeaking && msg.id === latestAgentMsgId}
              isLoadingPassport={loadingPassportMsgId === msg.id}
              onOpenPassport={(targetMsg) => void handleOpenPassport(targetMsg)}
            />
          ))}

          {isAgentThinking && (
            <div className="flex items-center gap-3 px-2 py-1">
              <AgentStickerAvatar
                role="private"
                state="thinking"
                size={36}
                interactive={false}
              />
              <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-subtle bg-wash-violet px-3.5 py-2 text-xs shadow-card">
                <Loader size={14} className="text-ink-violet" />
                <Shimmer duration={1.4} className="text-xs font-medium">
                  Personal Agent menyusun di ruang M1...
                </Shimmer>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="right-6 bottom-40 left-auto translate-x-0 border-line-subtle bg-surface-raised text-ink-primary shadow-raised sm:bottom-36" />
      </Conversation>

      {/* Floating Bottom Quick Preset Chips + PromptInput Composer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-4 pt-8 pb-4 sm:px-8 sm:pb-5">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {PERSONAL_AGENT_SUGGESTIONS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => void handleSendText(chip.prompt)}
                className="inline-flex min-h-8 max-w-full items-center truncate rounded-full border border-violet-subtle bg-surface-card/95 px-3 py-1 text-xs font-medium text-ink-secondary shadow-control backdrop-blur-sm transition-[background-color,border-color,color,transform] duration-150 hover:border-line-active hover:bg-wash-violet hover:text-ink-violet active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="truncate">{chip.label}</span>
              </button>
            ))}
          </div>

          <PromptInput
            onSubmit={({ text }) => void handleSendText(text || inputText)}
            className="[&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:border-violet-subtle [&_[data-slot=input-group]]:bg-surface-raised [&_[data-slot=input-group]]:shadow-raised"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis catatan privat atau tanya Personal Agent..."
                className="min-h-11 px-3.5 py-2.5 text-base text-ink-primary sm:text-sm"
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-line-subtle/60 px-3 py-1.5">
              <PromptInputTools className="gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface py-0.5 pr-2.5 pl-1">
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
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-subtle bg-wash-violet px-2.5 py-0.5 text-xs font-semibold text-ink-violet">
                  <Lock className="size-3" aria-hidden="true" />
                  M1 Private
                </span>
              </PromptInputTools>

              <PromptInputSubmit
                status={isAgentThinking ? "submitted" : undefined}
                disabled={!inputText.trim() || isAgentThinking}
                className="bg-accent-violet text-on-accent shadow-card hover:bg-accent-violet-hover active:bg-accent-violet-active disabled:opacity-40"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      {/* Context Passport PII Masking Drawer */}
      <ContextPassportDrawer
        open={isPassportOpen}
        teamId={teamId}
        activeUserName={activeUser.name}
        preview={passportPreview}
        onOpenChange={setIsPassportOpen}
      />

      {/* Personal Agent Sticker Customizer */}
      <AgentCustomizerDialog
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        initialRole="private"
      />
    </div>
  )
}
