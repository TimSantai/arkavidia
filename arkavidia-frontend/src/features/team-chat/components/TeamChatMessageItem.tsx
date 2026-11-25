import { Bot, Quote } from "lucide-react"
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationQuote,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
        isHighlighted && "bg-brand/8 ring-2 ring-brand"
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
          {/* Avatar */}
          {isAgent ? (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-brand text-on-brand shadow-surface">
              <Bot className="size-4" />
            </div>
          ) : (
            <Avatar className="size-8 shrink-0">
              {avatarSrc && (
                <AvatarImage src={avatarSrc} alt={message.authorName} />
              )}
              <AvatarFallback className="border border-line-subtle bg-surface text-xs font-semibold text-ink-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Message Body Column */}
          <div
            className={cn(
              "flex min-w-0 max-w-2xl flex-1 flex-col gap-1",
              isCurrentUser && "items-end"
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
                <span className="rounded-full bg-info-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-text-info">
                  TEAM AGENT · M2 ONLY
                </span>
              ) : (
                roleLabel && (
                  <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 text-[10px] font-medium text-ink-tertiary">
                    {roleLabel}
                  </span>
                )
              )}

              <span className="font-mono text-[10px] tabular-nums text-ink-tertiary">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>

            {/* Bubble Content */}
            <MessageContent
              className={cn(
                "w-full rounded-2xl px-4 py-3 text-sm leading-relaxed",
                isCurrentUser
                  ? "rounded-tr-sm bg-brand text-on-brand group-[.is-user]:bg-brand group-[.is-user]:text-on-brand"
                  : "rounded-tl-sm border border-line-subtle bg-surface text-ink-primary shadow-surface"
              )}
            >
              <p className="whitespace-pre-wrap">{message.body}</p>

              {/* Inline Citations Chips (Hover preview + Click to highlight source message) */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-2">
                  <span className="font-mono text-[10px] text-ink-tertiary">
                    Sitasi M2:
                  </span>
                  {message.citations.map((cit) => (
                    <InlineCitation key={cit.id}>
                      <InlineCitationCard>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => onJumpToMessage(cit.sourceMessageId)}
                            className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-canvas px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-link transition-colors hover:border-line-active hover:bg-brand/5"
                          >
                            <Quote className="size-2.5" />
                            <span>{cit.label}</span>
                          </button>
                        </HoverCardTrigger>
                        <InlineCitationCardBody className="w-72 rounded-xl border border-line-subtle bg-surface-raised p-3 shadow-raised">
                          <InlineCitationSource
                            title={cit.label}
                            description="Klik chip untuk menyorot pesan asli di percakapan."
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

              {/* Inline Propose-Confirm Decision Card */}
              {proposedItem && (
                <ProposedDecisionCard
                  item={proposedItem}
                  teamId={teamId}
                  onConfirm={onConfirmMemory}
                />
              )}

              {/* Inline Live IFC Guardrail Block Card */}
              {message.policyBlocked && <IfcBlockedCard teamId={teamId} />}
            </MessageContent>
          </div>
        </div>
      </Message>
    </div>
  )
}
