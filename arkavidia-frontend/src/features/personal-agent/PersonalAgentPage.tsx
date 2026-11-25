import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { Bot, Lock, Maximize2, Minimize2, ShieldCheck } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [passportPreview, setPassportPreview] = useState<PassportPreview | null>(
    null
  )
  const [isPassportOpen, setIsPassportOpen] = useState(false)
  const [loadingPassportMsgId, setLoadingPassportMsgId] = useState<
    string | null
  >(null)

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
    void bersamaApi.getPrivateMessages(teamId).then(setMessages)
  }, [teamId])

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
      {/* Top Context Bar — docked safely into AppShell's left/center h-14 header on desktop */}
      <div
        className={cn(
          "flex shrink-0 flex-nowrap items-center justify-between gap-2 border-b border-line-subtle bg-surface px-4 py-2.5 sm:px-6",
          !isFullscreen &&
            "lg:fixed lg:top-0 lg:right-64 lg:left-64 lg:z-30 lg:h-14 lg:border-b-0 lg:bg-transparent lg:py-0"
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Lock className="size-4 shrink-0 text-ink-tertiary" />
          <h1 className="truncate font-heading text-base font-semibold text-ink-primary sm:text-lg">
            Ruang Pribadi
          </h1>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
            M1 PRIVATE · TERENKRIPSI
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setIsFullscreen((prev) => !prev)}
          aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          title={isFullscreen ? "Keluar layar penuh (Esc)" : "Layar penuh"}
          className="shrink-0 border-line-subtle bg-canvas text-ink-secondary hover:text-ink-primary"
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </Button>
      </div>

      {/* Top-Center Floating Context Pill */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4",
          isFullscreen ? "top-14" : "top-14 lg:top-3"
        )}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-raised/95 px-3.5 py-1.5 text-xs font-medium text-ink-secondary shadow-surface backdrop-blur-md">
          <ShieldCheck className="size-3.5 shrink-0 text-ink-link" />
          <span className="truncate">
            Konteks: M1 Pribadi · M2 Tim · Skor M3 Sendiri
          </span>
        </div>
      </div>

      {/* Scrollable AI Elements Conversation Stream */}
      <Conversation className="min-h-0 flex-1 overflow-hidden bg-canvas [&>div]:h-full [&>div]:overflow-y-auto">
        <ConversationContent className="mx-auto w-full max-w-5xl gap-4 px-4 pt-14 pb-44 sm:px-8 sm:pb-40">
          {messages.map((msg) => (
            <PrivateMessageItem
              key={msg.id}
              message={msg}
              activeUserId={activeUser.id}
              isLoadingPassport={loadingPassportMsgId === msg.id}
              onOpenPassport={(targetMsg) => void handleOpenPassport(targetMsg)}
            />
          ))}

          {isAgentThinking && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface text-ink-primary shadow-surface">
                <Bot className="size-4 text-ink-link" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line-subtle bg-surface px-3.5 py-2 text-xs shadow-surface">
                <Loader size={14} className="text-ink-link" />
                <Shimmer duration={1.4} className="font-mono text-xs">
                  Personal Agent menyusun jawaban di ruang M1 terenkripsi...
                </Shimmer>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="right-6 bottom-40 left-auto translate-x-0 border-line-subtle bg-surface-raised text-ink-primary shadow-raised sm:bottom-36" />
      </Conversation>

      {/* Floating Bottom Quick Prompt Chips + PromptInput Composer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-4 pt-8 pb-4 sm:px-8 sm:pb-5">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {PERSONAL_AGENT_SUGGESTIONS.map((chip) => (
              <Suggestion
                key={chip.id}
                suggestion={chip.prompt}
                onClick={(prompt) => void handleSendText(prompt)}
                className="h-7 max-w-full truncate rounded-full border border-line-subtle bg-surface/95 px-3 text-xs font-medium text-ink-secondary shadow-surface backdrop-blur-sm hover:border-line-default hover:text-ink-primary"
              >
                <span className="truncate">{chip.label}</span>
              </Suggestion>
            ))}
          </div>

          <PromptInput
            onSubmit={({ text }) => void handleSendText(text || inputText)}
            className="[&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:border-line-subtle [&_[data-slot=input-group]]:bg-surface-raised [&_[data-slot=input-group]]:shadow-raised"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis catatan atau tanya Personal Agent (hanya terlihat olehmu)..."
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
                <span className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary">
                  <Lock className="size-2.5 text-ink-tertiary" />
                  M1 PRIVATE
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

      {/* Context Passport PII Masking Drawer */}
      <ContextPassportDrawer
        open={isPassportOpen}
        teamId={teamId}
        activeUserName={activeUser.name}
        preview={passportPreview}
        onOpenChange={setIsPassportOpen}
      />
    </div>
  )
}
