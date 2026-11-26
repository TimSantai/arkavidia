import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowRight,
  CheckCircle2,
  GitPullRequestDraft,
  HelpCircle,
  Lock,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { SEED_KCS } from "@/mocks/seedData"
import { bersamaApi } from "@/services/api"
import type { MemoryItem, PassportPreview } from "@/types/bersama"
import {
  buildHighlightedPiiSegments,
  PII_KIND_LABELS,
} from "./personalAgentData"

interface ContextPassportDrawerProps {
  readonly open: boolean
  readonly teamId: string
  readonly activeUserName: string
  readonly preview: PassportPreview | null
  readonly onOpenChange: (open: boolean) => void
}

interface ContextPassportFormProps {
  readonly teamId: string
  readonly activeUserName: string
  readonly preview: PassportPreview
  readonly onClose: () => void
}

function ContextPassportForm({
  teamId,
  activeUserName,
  preview,
  onClose,
}: ContextPassportFormProps) {
  const [redactedSummary, setRedactedSummary] = useState(
    preview.redactedSummary
  )
  const [suggestedTitle, setSuggestedTitle] = useState(preview.suggestedTitle)
  const [suggestedRationale, setSuggestedRationale] = useState(
    preview.suggestedRationale
  )
  const [targetKcId, setTargetKcId] = useState(
    preview.targetKcId || SEED_KCS[0]?.id || "kc-mvc"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sharedItem, setSharedItem] = useState<MemoryItem | null>(null)

  const highlightedSegments = buildHighlightedPiiSegments(
    preview.originalText,
    preview.detectedPii
  )
  const piiCount = preview.detectedPii.length
  const provenancePreview = `Dibagikan oleh ${activeUserName} dari Ruang Pribadi (Context Passport)`

  const handleShareSubmit = async () => {
    if (isSubmitting) return
    const trimmedTitle = suggestedTitle.trim()
    const trimmedSummary = redactedSummary.trim()
    if (!trimmedTitle || !trimmedSummary) {
      setSubmitError("Judul usulan dan ringkasan tersamarkan tidak boleh kosong.")
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const editedPreview: PassportPreview = {
        ...preview,
        redactedSummary: trimmedSummary,
        suggestedTitle: trimmedTitle,
        suggestedRationale: suggestedRationale.trim(),
        targetKcId,
      }
      const created = await bersamaApi.sharePassport(teamId, editedPreview)
      setSharedItem(created)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim usulan Context Passport."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
          <div className="flex items-center gap-2">
            <DialogTitle className="font-display text-xl font-semibold text-ink-primary">
              Context Passport
            </DialogTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  aria-label="Penjelasan gerbang IFC dan UU PDP"
                  className="rounded-full border-violet-subtle bg-wash-violet text-ink-violet hover:bg-accent-violet/15"
                >
                  <HelpCircle className="size-3.5" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <PopoverHeader>
                  <PopoverTitle>Gerbang IFC &amp; Kepatuhan UU PDP</PopoverTitle>
                  <PopoverDescription>
                    Hanya ringkasan yang sudah disamarkan dan Anda setujui yang
                    dikirim dari ruang pribadi (M1) menjadi usulan Project Brain
                    tim (M2). Sumber asli tetap privat.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
              piiCount > 0
                ? "bg-warning-subtle text-text-warning"
                : "bg-success-subtle text-text-success"
            )}
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {piiCount > 0
              ? `${piiCount} PII Disamarkan`
              : "0 PII · Bersih"}
          </span>
        </div>

        <DialogDescription className="text-sm text-ink-secondary">
          Tinjau dan samarkan data sensitif sebelum dikirim ke usulan tim M2.
        </DialogDescription>

        {/* Visual Pipeline */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line-subtle bg-surface px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-subtle bg-wash-violet px-2.5 py-0.5 font-semibold text-ink-violet">
            <Lock className="size-3" aria-hidden="true" />
            M1 Pribadi
          </span>
          <ArrowRight className="size-3.5 text-ink-tertiary" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-subtle px-2.5 py-0.5 font-semibold text-text-warning">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Masking PII
          </span>
          <ArrowRight className="size-3.5 text-ink-tertiary" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 font-semibold text-ink-link">
            <GitPullRequestDraft className="size-3" aria-hidden="true" />
            Usulan M2
          </span>
        </div>
      </DialogHeader>

      {sharedItem ? (
        <div className="space-y-4 rounded-xl border border-line-subtle bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span>Usulan Terkirim ke Project Brain</span>
            </div>
            <span className="rounded-full border border-brand-subtle bg-wash-brand px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink-link">
              {sharedItem.code} · Proposed
            </span>
          </div>

          <div className="space-y-2 rounded-xl border border-line-subtle bg-surface-card p-3.5 shadow-card">
            <h4 className="font-sans text-sm font-semibold text-ink-primary">
              {sharedItem.content.title}
            </h4>
            <p className="text-xs leading-relaxed text-ink-secondary">
              {sharedItem.content.summary}
            </p>
            <p className="text-xs text-ink-tertiary">
              {sharedItem.provenance}
            </p>
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-xl border border-line-subtle bg-surface-card px-4 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button
              asChild
              className="gap-1.5 bg-brand text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
            >
              <Link to={`/teams/${teamId}/brain`}>
                <span>Lihat di Project Brain</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Left Column: Original M1 Text + Editable Masked Summary + PII Pills */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink-primary">
                    Sumber Asli M1 (Hanya Baca)
                  </span>
                  <span className="text-xs font-medium text-ink-violet">
                    Tetap Privat
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-violet-subtle bg-wash-violet/60 p-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-secondary">
                  {highlightedSegments.map((seg) =>
                    seg.pii ? (
                      <span
                        key={seg.key}
                        title={`${PII_KIND_LABELS[seg.pii.kind]} terdeteksi`}
                        className="rounded bg-error-subtle px-1 font-medium text-text-error line-through"
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={seg.key}>{seg.text}</span>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="passport-masked-summary"
                  className="block text-xs font-semibold text-ink-primary"
                >
                  Ringkasan Tersamarkan (Dikirim ke M2)
                </label>
                <Textarea
                  id="passport-masked-summary"
                  value={redactedSummary}
                  onChange={(e) => setRedactedSummary(e.target.value)}
                  rows={4}
                  className="border-line-default bg-surface-card text-base leading-relaxed text-ink-primary sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-ink-secondary">
                  Entitas PII Tersamarkan
                </span>
                {piiCount > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {preview.detectedPii.map((pii, index) => (
                      <span
                        key={`${pii.kind}-${index}`}
                        className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-medium text-text-warning"
                      >
                        <span>{PII_KIND_LABELS[pii.kind]}:</span>
                        <span>{pii.redacted}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-secondary">
                    Tidak ada nomor HP, email, atau NIK yang terdeteksi.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Proposal Metadata */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="passport-title"
                  className="block text-xs font-semibold text-ink-primary"
                >
                  Judul Usulan
                </label>
                <Input
                  id="passport-title"
                  value={suggestedTitle}
                  onChange={(e) => setSuggestedTitle(e.target.value)}
                  placeholder="Contoh: Pola MVC untuk Modul Antrean"
                  className="border-line-default bg-surface-card text-base text-ink-primary sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="passport-rationale"
                  className="block text-xs font-semibold text-ink-primary"
                >
                  Alasan Singkat
                </label>
                <Textarea
                  id="passport-rationale"
                  value={suggestedRationale}
                  onChange={(e) => setSuggestedRationale(e.target.value)}
                  rows={3}
                  placeholder="Mengapa usulan ini penting untuk diketahui tim..."
                  className="border-line-default bg-surface-card text-base leading-relaxed text-ink-primary sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="passport-kc"
                  className="block text-xs font-semibold text-ink-primary"
                >
                  Knowledge Component Terkait
                </label>
                <Select value={targetKcId} onValueChange={setTargetKcId}>
                  <SelectTrigger
                    id="passport-kc"
                    className="w-full border-line-default bg-surface-card text-xs text-ink-primary"
                  >
                    <SelectValue placeholder="Pilih Knowledge Component" />
                  </SelectTrigger>
                  <SelectContent className="border-line-subtle bg-surface-raised shadow-raised">
                    {SEED_KCS.map((kc) => (
                      <SelectItem
                        key={kc.id}
                        value={kc.id}
                        className="text-xs text-ink-primary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="font-semibold tabular-nums text-ink-secondary">
                            {kc.code}
                          </span>
                          <span>{kc.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 rounded-xl border border-line-subtle bg-surface p-3">
                <span className="block text-xs font-semibold text-ink-secondary">
                  Provenance M2
                </span>
                <p className="text-xs text-ink-secondary">
                  {provenancePreview}
                </p>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-line-error bg-error-subtle px-3 py-2 text-xs text-text-error">
              {submitError}
            </div>
          )}

          <DialogFooter className="border-line-subtle bg-surface">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleShareSubmit()}
              className="gap-1.5 bg-brand text-on-brand shadow-primary hover:bg-brand-hover active:bg-brand-active"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span>
                {isSubmitting
                  ? "Mengirim Usulan..."
                  : "Setujui & Kirim Usulan"}
              </span>
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  )
}

export function ContextPassportDrawer({
  open,
  teamId,
  activeUserName,
  preview,
  onOpenChange,
}: ContextPassportDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border border-line-subtle bg-surface-raised ring-0 shadow-raised sm:max-w-3xl">
        {preview && (
          <ContextPassportForm
            key={`${preview.sourceMessageId}:${preview.originalText}`}
            teamId={teamId}
            activeUserName={activeUserName}
            preview={preview}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
