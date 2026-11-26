import { AlertTriangle, CheckCircle2, Handshake, User as UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { KcCoverageSummary, MasteryRecord, User } from "@/types/bersama"
import avatarRani from "@/features/landing/assets/avatar-rani.jpg"
import avatarDimas from "@/features/landing/assets/avatar-dimas.jpg"
import avatarBudi from "@/features/landing/assets/avatar-budi.jpg"
import avatarSari from "@/features/landing/assets/avatar-sari.jpg"

const USER_AVATARS: Record<string, string> = {
  "user-rani": avatarRani,
  "user-dimas": avatarDimas,
  "user-budi": avatarBudi,
  "user-sari": avatarSari,
}

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
        "rounded-xl border border-line-subtle bg-surface shadow-surface transition-[border-color,box-shadow] duration-150 ease-out",
        className,
      )}
    >
      {/* Header bar of matrix */}
      <div className="flex flex-col gap-2 border-b border-line-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink-primary">
            Matriks Cakupan Pemahaman Interaktif
          </h2>
          <p className="text-xs text-ink-secondary">
            Klik salah satu baris Knowledge Component untuk melihat rincian pemahaman & opsi sesi
            belajar tim.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-tertiary">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" />
            <span>Bisa Membantu (≥0.70)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted" />
            <span>Terbuka Sesi Bareng</span>
          </div>
        </div>
      </div>

      {/* Responsive table container with smooth horizontal scroll for mobile (375px) */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-subtle bg-canvas/40 text-[11px] font-mono tracking-wider text-ink-tertiary">
              <th className="py-3 pl-4 pr-3 uppercase">Knowledge Component (KC)</th>
              <th className="px-3 py-3 text-center uppercase">Prioritas</th>
              {members.map((member) => {
                const isMe = member.id === currentUserId
                return (
                  <th key={member.id} className="px-3 py-3 text-center uppercase">
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <Avatar className="size-7 border border-line-subtle">
                          <AvatarImage
                            src={USER_AVATARS[member.id]}
                            alt={member.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-[10px] font-semibold">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        {isMe && (
                          <span
                            title="Akun Anda"
                            className="absolute -bottom-1 -right-1 flex size-3 items-center justify-center rounded-full bg-brand text-[8px] text-on-brand"
                          >
                            <UserIcon className="size-2" />
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "max-w-[90px] truncate text-center text-xs",
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
              <th className="py-3 pl-3 pr-4 text-center uppercase">Cakupan Tim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {coverageList.map((entry) => {
              const isSelected = selectedKcId === entry.kc.id
              const isSilo = entry.isSilo

              return (
                <tr
                  key={entry.kc.id}
                  onClick={() => onSelectKc(entry.kc.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onSelectKc(entry.kc.id)
                    }
                  }}
                  className={cn(
                    "cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isSelected
                      ? "bg-accent-violet/5 hover:bg-accent-violet/10 dark:bg-accent-violet/10"
                      : "hover:bg-muted/30",
                    isSilo && !isSelected && "bg-warning-subtle/10",
                  )}
                >
                  {/* KC Identity */}
                  <td className="py-3.5 pl-4 pr-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-accent-violet">
                          {entry.kc.code}
                        </span>
                        <span className="font-heading text-sm font-medium text-ink-primary">
                          {entry.kc.name}
                        </span>
                      </div>
                      <p className="line-clamp-1 max-w-[240px] text-xs text-ink-tertiary">
                        {entry.kc.description}
                      </p>
                    </div>
                  </td>

                  {/* Criticality */}
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
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
                      <td key={member.id} className="px-2 py-3.5 text-center">
                        {isCurrentUser ? (
                          /* Current User: EXACT P(L) Score with personal badge */
                          <div className="inline-flex flex-col items-center gap-1 rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1.5 dark:bg-brand/10">
                            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-brand">
                              <span className="tabular-nums">P(L) = {pMastery.toFixed(2)}</span>
                            </div>
                            <div className="w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-1.5 rounded-full transition-[width] duration-300 ease-out",
                                  isUnderstood ? "bg-brand" : "bg-accent-violet",
                                )}
                                style={{ width: `${Math.round(pMastery * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-ink-tertiary">
                              {isUnderstood ? "Paham Mandiri" : "Dalam Penguatan"}
                            </span>
                          </div>
                        ) : (
                          /* Other Members: STRICT PRIVACY RULE (Framing Positif, NO Raw Scores!) */
                          <div className="inline-flex items-center justify-center">
                            {isUnderstood ? (
                              <span
                                title={`${member.name} memahami konsep ini dan bisa membantu menjelaskan.`}
                                className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-subtle px-2.5 py-1 text-xs font-medium text-text-success shadow-xs transition-transform hover:scale-105"
                              >
                                <CheckCircle2 className="size-3.5 shrink-0" />
                                <span>Bisa Membantu</span>
                              </span>
                            ) : (
                              <span
                                title={`${member.name} terbuka untuk sesi belajar bersama.`}
                                className="inline-flex items-center gap-1 rounded-full border border-line-subtle bg-muted px-2.5 py-1 text-xs text-ink-tertiary transition-transform hover:scale-105"
                              >
                                <Handshake className="size-3.5 shrink-0 text-ink-disabled" />
                                <span>Sesi Bareng</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}

                  {/* Team Coverage Summary */}
                  <td className="py-3.5 pl-3 pr-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      {isSilo ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-warning/40 bg-warning-subtle font-mono text-xs font-semibold text-text-warning shadow-xs"
                        >
                          <AlertTriangle className="size-3 shrink-0" />
                          SILO ({entry.understoodCount}/{entry.totalMembers})
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 border-success/40 bg-success-subtle font-mono text-xs font-medium text-text-success"
                        >
                          <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                          {entry.understoodCount}/{entry.totalMembers} Paham
                        </Badge>
                      )}

                      {/* Positive Framing Subtitle */}
                      <span className="max-w-[120px] truncate text-[11px] text-ink-tertiary">
                        {isSilo && entry.experts.length > 0
                          ? `${entry.experts[0].name.split(" ")[0]} bisa bantu`
                          : `${Math.round((entry.understoodCount / entry.totalMembers) * 100)}% tim`}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Privacy Assurance */}
      <div className="flex flex-col gap-1 border-t border-line-subtle bg-canvas/30 px-4 py-2.5 text-xs text-ink-tertiary sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-ink-secondary">Privasi M3 Terjamin:</span>
          Skor angka hanya milikmu. Data rekan tim diformulasikan ke kesiapan kolaborasi.
        </span>
        <span className="font-mono text-[11px] text-ink-tertiary">
          Ambang Penguasaan: τ = 0.70
        </span>
      </div>
    </div>
  )
}
