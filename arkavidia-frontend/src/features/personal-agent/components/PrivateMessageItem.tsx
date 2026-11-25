import type { ReactNode } from "react"
import { Bot, Lock, ShieldCheck } from "lucide-react"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { USER_AVATAR_MAP, USER_ROLE_LABEL } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import { SEED_USERS } from "@/mocks/seedData"
import type { ChatMessage } from "@/types/bersama"
import { formatPrivateMessageTime } from "./personalAgentData"

interface PrivateMessageItemProps {
  readonly message: ChatMessage
  readonly activeUserId: string
  readonly isLoadingPassport: boolean
  readonly onOpenPassport: (message: ChatMessage) => void
}

function renderInlineFormatting(text: string): readonly ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      )
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="rounded border border-line-subtle bg-canvas px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-primary"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    return token
  })
}

export function PrivateMessageItem({
  message,
  activeUserId,
  isLoadingPassport,
  onOpenPassport,
}: PrivateMessageItemProps) {
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
    <div className="rounded-2xl p-2">
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
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface text-ink-primary shadow-surface">
              <Bot className="size-4 text-ink-link" />
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

              {!isAgent && roleLabel && (
                <span className="rounded-full border border-line-subtle bg-canvas px-2 py-0.5 text-[10px] font-medium text-ink-tertiary">
                  {roleLabel}
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary">
                <Lock className="size-2.5 text-ink-tertiary" />
                {message.taintedPrivate ? "M1 TAINTED" : "M1 PRIVATE"}
              </span>

              <span className="font-mono text-[10px] tabular-nums text-ink-tertiary">
                {formatPrivateMessageTime(message.createdAt)}
              </span>
            </div>

            {/* Bubble Content */}
            <MessageContent
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                isCurrentUser
                  ? "ml-auto w-fit max-w-full rounded-tr-sm bg-brand text-on-brand group-[.is-user]:bg-brand group-[.is-user]:text-on-brand"
                  : "w-fit max-w-full rounded-tl-sm border border-line-subtle bg-surface text-ink-primary shadow-surface"
              )}
            >
              <p className="whitespace-pre-wrap">
                {renderInlineFormatting(message.body)}
              </p>
            </MessageContent>

            {/* Footer Action: Bagikan via Context Passport */}
            <div
              className={cn(
                "flex items-center gap-2 pt-0.5",
                isCurrentUser && "justify-end"
              )}
            >
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={isLoadingPassport}
                onClick={() => onOpenPassport(message)}
                className="gap-1.5 rounded-full border-line-subtle bg-surface px-2.5 text-[11px] font-medium text-ink-secondary shadow-surface hover:border-line-active hover:bg-surface-raised hover:text-ink-primary"
              >
                <ShieldCheck className="size-3 text-ink-link" />
                <span>
                  {isLoadingPassport
                    ? "Memindai PII..."
                    : "Bagikan via Context Passport"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Message>
    </div>
  )
}
