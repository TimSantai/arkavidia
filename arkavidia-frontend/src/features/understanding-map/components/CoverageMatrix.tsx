import { AlertTriangle, CheckCircle2, Handshake, User as UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { USER_AVATAR_MAP } from "@/features/team-chat/components/teamChatAvatars"
import { cn } from "@/lib/utils"
import type { KcCoverageSummary, MasteryRecord, User } from "@/types/bersama"

interface CoverageMatrixProps {
  readonly coverageList: readonly KcCoverageSummary[]
  readonly members: readonly User[]
  readonly masteryMatrix: readonly MasteryRecord[]
  readonly currentUserId: string
  readonly selectedKcId: string | null
  readonly onSelectKc: (kcId: string) => void
  readonly className?: string
}

export function CoverageMatrix({
  coverageList,
  members,
  masteryMatrix,
  currentUserId,
  selectedKcId,
  onSelectKc,
  className,
}: CoverageMatrixProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line-subtle bg-surface-card shadow-card transition-[border-color,box-shadow] duration-150",
        className,
      )}
    >
      {/* Header bar of matrix */}
      <div className="flex flex-col gap-2 border-b border-line-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-primary">
            Matriks Pemahaman Tim
          </h2>
          <p className="text-xs text-ink-secondary">
            Pilih konsep untuk melihat rincian penguasaan dan pasangan belajar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-secondary">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-success" />
            <span>Bisa Membantu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-muted" />
            <span>Sesi Bareng</span>
          </div>
        </div>
      </div>

      {/* Responsive table container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-subtle bg-surface text-xs font-semibold text-ink-secondary">
              <th className="py-3 pl-4 pr-3">Knowledge Component</th>
              <th className="px-3 py-3 text-center">Prioritas</th>
              {members.map((member) => {
                const isMe = member.id === currentUserId
                return (
                  <th key={member.id} className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <Avatar className="size-7 border border-line-subtle">
                          <AvatarImage
                            src={USER_AVATAR_MAP[member.id]}
                            alt={member.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs font-semibold">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        {isMe && (
                          <span
                            title="Akun Anda"
                            className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-on-brand"
                          >
                            <UserIcon className="size-2.5" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "max-w-[96px] truncate text-center text-xs font-medium",
                          isMe ? "font-semibold text-ink-primary" : "text-ink-secondary",
                        )}
                      >
                        {member.name.split(" ")[0]}
                        {isMe && " (Kamu)"}
                      </span>
                    </div>
                  </th>
                )
              })}
              <th className="py-3 pl-3 pr-4 text-center">Cakupan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {coverageList.map((entry) => {
              const isSelected = selectedKcId === entry.kc.id
              const isSilo = entry.isSilo

              return (
                <tr
                  key={entry.kc.id}
                  className={cn(
                    "transition-[background-color] duration-150",
                    isSelected
                      ? "bg-wash-brand"
                      : isSilo
                        ? "bg-warning-subtle/20 hover:bg-surface"
                        : "hover:bg-surface",
                  )}
                >
                  {/* KC Identity (semantic button trigger) */}
                  <td className="py-3 pl-4 pr-3">
                    <button
                      type="button"
                      onClick={() => onSelectKc(entry.kc.id)}
                      aria-pressed={isSelected}
                      className="group flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg p-1.5 -m-1.5 text-left transition-[background-color] duration-150 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-wash-brand px-1.5 py-0.5 text-xs font-semibold text-ink-link">
                          {entry.kc.code}
                        </span>
                        <span className="font-sans text-sm font-semibold text-ink-primary group-hover:text-ink-link">
                          {entry.kc.name}
                        </span>
                      </div>
                      <p className="line-clamp-1 max-w-[240px] text-xs text-ink-tertiary">
                        {entry.kc.description}
                      </p>
                    </button>
                  </td>

                  {/* Criticality */}
                  <td className="px-3 py-3 text-center">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        entry.kc.criticality === "high"
                          ? "bg-warning-subtle text-text-warning"
                          : "bg-muted text-ink-secondary",
                      )}
                    >
                      {entry.kc.criticality}
                    </span>
                  </td>

                  {/* Member Cells */}
                  {members.map((member) => {
                    const isCurrentUser = member.id === currentUserId
                    const record = masteryMatrix.find(
                      (m) => m.userId === member.id && m.kcId === entry.kc.id,
                    )
                    const pMastery = record ? record.pMastery : 0
                    const isUnderstood = pMastery >= 0.7

                    return (
                      <td key={member.id} className="px-2 py-3 text-center">
                        {isCurrentUser ? (
                          <div className="inline-flex flex-col items-center gap-1 rounded-lg border border-brand-subtle bg-wash-brand px-2.5 py-1.5">
                            <span className="text-xs font-semibold tabular-nums text-ink-link">
                              P(L) = {pMastery.toFixed(2)}
                            </span>
                            <div className="w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-1.5 rounded-full transition-[width] duration-300 ease-out",
                                  isUnderstood ? "bg-success" : "bg-brand",
                                )}
                                style={{ width: `${Math.round(pMastery * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-ink-secondary">
                              {isUnderstood ? "Paham" : "Penguatan"}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center">
                            {isUnderstood ? (
                              <span
                                title={`${member.name} memahami konsep ini dan bisa membantu menjelaskan.`}
                                className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-text-success shadow-badge"
                              >
                                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                                <span>Bisa Membantu</span>
                              </span>
                            ) : (
                              <span
                                title={`${member.name} terbuka untuk sesi belajar bersama.`}
                                className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-surface px-2.5 py-1 text-xs text-ink-secondary"
                              >
                                <Handshake className="size-3.5 shrink-0 text-ink-tertiary" aria-hidden="true" />
                                <span>Sesi Bareng</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}

                  {/* Team Coverage Summary (semantic button trigger) */}
                  <td className="py-3 pl-3 pr-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectKc(entry.kc.id)}
                      aria-pressed={isSelected}
                      className="inline-flex cursor-pointer flex-col items-center gap-1 rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      {isSilo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-warning shadow-badge">
                          <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                          Silo ({entry.understoodCount}/{entry.totalMembers})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-success shadow-badge">
                          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
                          {entry.understoodCount}/{entry.totalMembers} Paham
                        </span>
                      )}

                      <span className="max-w-[120px] truncate text-xs text-ink-tertiary">
                        {isSilo && entry.experts.length > 0
                          ? `${entry.experts[0].name.split(" ")[0]} bisa bantu`
                          : `${Math.round((entry.understoodCount / entry.totalMembers) * 100)}% tim`}
                      </span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col gap-1 border-t border-line-subtle bg-surface px-4 py-2.5 text-xs text-ink-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>Data rekan menampilkan kesiapan kolaborasi, bukan skor numerik.</span>
        <span className="font-medium tabular-nums">Ambang: 0.70</span>
      </div>
    </div>
  )
}
