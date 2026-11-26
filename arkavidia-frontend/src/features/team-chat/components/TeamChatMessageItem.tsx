import { Quote } from "lucide-react"
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationQuote,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import type { AgentSemanticState } from "@/components/bersama/agentConfig"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { ChatMessage, MemoryItem } from "@/types/bersama"
import { IfcBlockedCard } from "./IfcBlockedCard"
import { ProposedDecisionCard } from "./ProposedDecisionCard"
import { USER_AVATAR_MAP, USER_ROLE_LABEL } from "./teamChatAvatars"

interface TeamChatMessageItemProps {
  readonly message: ChatMessage
  readonly activeUserId: string
  readonly teamId: string
  readonly proposedItem?: MemoryItem
  readonly isHighlighted: boolean
  readonly onJumpToMessage: (messageId: string) => void
  readonly onConfirmMemory: (memoryId: string) => Promise<void> | void
}

function formatMessageTime(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

function resolveTeamAgentState(
  message: ChatMessage,
  proposedItem?: MemoryItem
): AgentSemanticState {
  if (message.policyBlocked) return "blocked"
  if (proposedItem?.status === "proposed") return "warning"
  if (proposedItem?.status === "confirmed") return "success"
  return "idle"
}

export function TeamChatMessageItem({
  message,
  activeUserId,
  teamId,
  proposedItem,
  isHighlighted,
  onJumpToMessage,
  onConfirmMemory,
}: TeamChatMessageItemProps) {
  const isAgent = message.isAgent
  const isCurrentUser = !isAgent && message.authorId === activeUserId
  const author = SEED_USERS.find((u) => u.id === message.authorId)
  const avatarSrc = USER_AVATAR_MAP[message.authorId]
  const roleLabel = USER_ROLE_LABEL[message.authorId]
  const agentState = resolveTeamAgentState(message, proposedItem)
  const initials =
    author?.initials ??
    message.authorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
    <div
      id={`chat-msg-${message.id}`}
      className={cn(
        "rounded-2xl p-2 transition-[background-color,box-shadow] duration-300",
        isHighlighted && "bg-wash-brand ring-2 ring-brand"
      )}
    >
      <Message
        from={isCurrentUser ? "user" : "assistant"}
        className="max-w-full"
      >
        <div
          className={cn(
            "flex items-start gap-3",
            isCurrentUser && "flex-row-reverse"
          )}
        >
          {/* Avatar: Die-cut Agent Sticker vs Real Student Portrait */}
          {isAgent ? (
            <AgentStickerAvatar
              role="team"
              state={agentState}
              size={36}
              interactive
            />
          ) : (
            <Avatar className="size-9 shrink-0">
              {avatarSrc && (
                <AvatarImage
                  src={avatarSrc}
                  alt={message.authorName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="border border-line-subtle bg-surface text-xs font-semibold text-ink-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Message Body Column */}
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-2",
              isCurrentUser ? "max-w-xl items-end" : "max-w-3xl"
            )}
          >
            {/* Sender Metadata Row */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 px-0.5",
                isCurrentUser && "flex-row-reverse"
              )}
            >
              <span className="text-xs font-semibold text-ink-primary">
                {message.authorName}
              </span>

              {isAgent ? (
                <span className="rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 text-xs font-semibold text-ink-link">
                  Team Agent · M2
                </span>
              ) : (
                roleLabel && (
                  <span className="rounded-full border border-line-subtle bg-surface-top px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
                    {roleLabel}
                  </span>
                )
              )}

              <span className="text-xs tabular-nums text-ink-tertiary">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>

            {/* Bubble Content */}
            <MessageContent
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                isCurrentUser
                  ? "ml-auto w-fit max-w-full rounded-tr-sm bg-brand text-on-brand shadow-primary group-[.is-user]:bg-brand group-[.is-user]:text-on-brand"
                  : cn(
                      "rounded-tl-sm border bg-surface-card text-ink-primary shadow-card",
                      isAgent ? "border-brand-subtle" : "border-line-subtle",
                      (message.citations?.length ?? 0) > 0
                        ? "w-full"
                        : "w-fit max-w-full"
                    )
              )}
            >
              <p className="whitespace-pre-wrap">{message.body}</p>

              {/* Inline Citations Chips (Hover preview + Click to highlight source message) */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-2.5">
                  <span className="text-xs font-medium text-ink-tertiary">
                    Sitasi M2:
                  </span>
                  {message.citations.map((cit) => (
                    <InlineCitation key={cit.id}>
                      <InlineCitationCard>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => onJumpToMessage(cit.sourceMessageId)}
                            className="inline-flex items-center gap-1 rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 text-xs font-medium text-ink-link transition-[background-color,border-color] duration-150 hover:border-line-active hover:bg-brand/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            <Quote className="size-3" aria-hidden="true" />
                            <span>{cit.label}</span>
                          </button>
                        </HoverCardTrigger>
                        <InlineCitationCardBody className="w-72 rounded-xl border border-line-subtle bg-surface-raised p-3 ring-0 shadow-raised">
                          <InlineCitationSource
                            title={cit.label}
                            description="Klik untuk menyorot pesan sumber."
                          />
                          <InlineCitationQuote className="mt-2 text-xs">
                            &ldquo;{cit.excerpt}&rdquo;
                          </InlineCitationQuote>
                        </InlineCitationCardBody>
                      </InlineCitationCard>
                    </InlineCitation>
                  ))}
                </div>
              )}
            </MessageContent>

            {/* De-nested Artifact Cards directly below bubble */}
            {proposedItem && (
              <ProposedDecisionCard
                item={proposedItem}
                teamId={teamId}
                onConfirm={onConfirmMemory}
              />
            )}

            {message.policyBlocked && <IfcBlockedCard teamId={teamId} />}
          </div>
        </div>
      </Message>
    </div>
  )
}
