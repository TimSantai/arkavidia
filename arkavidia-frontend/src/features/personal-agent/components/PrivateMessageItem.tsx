import type { ReactNode } from "react"
import { Lock, ShieldCheck } from "lucide-react"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { AgentStickerAvatar } from "@/components/bersama/AgentStickerAvatar"
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
  readonly isSpeaking?: boolean
  readonly isLoadingPassport: boolean
  readonly onOpenPassport: (message: ChatMessage) => void
}

function renderInlineFormatting(
  text: string,
  isCurrentUser: boolean
): readonly ReactNode[] {
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
          className={cn(
            "rounded px-1.5 py-0.5 font-sans text-xs font-semibold",
            isCurrentUser
              ? "bg-surface-card/90 text-ink-primary"
              : "border border-violet-subtle bg-wash-violet text-ink-violet"
          )}
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
  isSpeaking = false,
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
          {/* Avatar: Cozy Violet BoopFace Sticker vs Human Portrait */}
          {isAgent ? (
            <AgentStickerAvatar
              role="private"
              state={isSpeaking ? "speaking" : "idle"}
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

              {!isAgent && roleLabel && (
                <span className="rounded-full border border-line-subtle bg-surface-top px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
                  {roleLabel}
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-full border border-violet-subtle bg-wash-violet px-2.5 py-0.5 text-xs font-medium text-ink-violet">
                <Lock className="size-3" aria-hidden="true" />
                {message.taintedPrivate ? "M1 Privat" : "M1"}
              </span>

              <span className="text-xs tabular-nums text-ink-tertiary">
                {formatPrivateMessageTime(message.createdAt)}
              </span>
            </div>

            {/* Bubble Content */}
            <MessageContent
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                isCurrentUser
                  ? "ml-auto w-fit max-w-full rounded-tr-sm bg-accent-violet text-on-accent shadow-card group-[.is-user]:bg-accent-violet group-[.is-user]:text-on-accent"
                  : "w-fit max-w-full rounded-tl-sm border border-violet-subtle bg-surface-card text-ink-primary shadow-card"
              )}
            >
              <p className="whitespace-pre-wrap">
                {renderInlineFormatting(message.body, isCurrentUser)}
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
                size="sm"
                disabled={isLoadingPassport}
                onClick={() => onOpenPassport(message)}
                className="gap-1.5 rounded-full border-violet-subtle bg-surface-card px-3 text-xs font-medium text-ink-violet shadow-control hover:border-line-active hover:bg-wash-violet hover:text-ink-violet"
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
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
