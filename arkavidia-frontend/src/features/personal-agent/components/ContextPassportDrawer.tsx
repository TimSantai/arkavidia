import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowRight,
  CheckCircle2,
  GitPullRequestDraft,
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
          <DialogTitle className="font-heading text-lg font-semibold text-ink-primary">
            Context Passport · Tinjau &amp; Samarkan PII
          </DialogTitle>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
              piiCount > 0
                ? "bg-warning-subtle text-text-warning"
                : "bg-success-subtle text-text-success"
            )}
          >
            <ShieldCheck className="size-3.5" />
            {piiCount > 0
              ? `${piiCount} PII Terdeteksi & Disamarkan`
              : "0 PII Terdeteksi · Bersih"}
          </span>
        </div>
        <DialogDescription className="text-xs text-ink-secondary">
          Gerbang Information-Flow Control (M1 → M2). Hanya ringkasan yang
          sudah disamarkan dan Anda setujui yang dikirim sebagai usulan ke
          Project Brain tim.
        </DialogDescription>

        {/* Visual Pipeline */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line-subtle bg-canvas px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary">
            <Lock className="size-3 text-ink-tertiary" />
            M1 Private
          </span>
          <ArrowRight className="size-3.5 text-ink-tertiary" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-subtle px-2.5 py-0.5 font-medium text-text-warning">
            <ShieldCheck className="size-3" />
            Deteksi &amp; Masking PII
          </span>
          <ArrowRight className="size-3.5 text-ink-tertiary" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-info">
            <GitPullRequestDraft className="size-3" />
            M2 Usulan
          </span>
        </div>
      </DialogHeader>

      {sharedItem ? (
        <div className="space-y-4 rounded-xl border border-line-subtle bg-canvas p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-success">
              <CheckCircle2 className="size-4" />
              <span>Usulan Berhasil Dikirim ke Project Brain Tim</span>
            </div>
            <span className="rounded-full bg-info-subtle px-2.5 py-0.5 font-mono text-[11px] font-semibold text-text-info">
              {sharedItem.code} · PROPOSED
            </span>
          </div>

          <div className="space-y-2 rounded-xl border border-line-subtle bg-surface p-3.5">
            <h4 className="font-heading text-sm font-semibold text-ink-primary">
              {sharedItem.content.title}
            </h4>
            <p className="text-xs leading-relaxed text-ink-secondary">
              {sharedItem.content.summary}
            </p>
            <p className="font-mono text-[11px] text-ink-tertiary">
              {sharedItem.provenance}
            </p>
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-xl border border-line-subtle bg-surface px-4 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button
              asChild
              className="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
            >
              <Link to={`/teams/${teamId}/brain`}>
                Lihat di Project Brain →
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-primary">
                    Sumber Asli M1 (Hanya Baca)
                  </span>
                  <span className="font-mono text-[10px] text-ink-tertiary">
                    TIDAK DIBAGIKAN
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-line-subtle bg-canvas p-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-secondary">
                  {highlightedSegments.map((seg) =>
                    seg.pii ? (
                      <span
                        key={seg.key}
                        title={`${PII_KIND_LABELS[seg.pii.kind]} terdeteksi`}
                        className="rounded bg-error-subtle px-1 font-mono text-text-error line-through"
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
                  className="block text-xs font-medium text-ink-primary"
                >
                  Ringkasan Tersamarkan (Dikirim ke M2)
                </label>
                <Textarea
                  id="passport-masked-summary"
                  value={redactedSummary}
                  onChange={(e) => setRedactedSummary(e.target.value)}
                  rows={4}
                  className="border-line-default bg-canvas text-xs leading-relaxed text-ink-primary"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-ink-secondary">
                  Entitas PII yang Disamarkan
                </span>
                {piiCount > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {preview.detectedPii.map((pii, index) => (
                      <span
                        key={`${pii.kind}-${index}`}
                        className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-warning"
                      >
                        <span>{PII_KIND_LABELS[pii.kind]}:</span>
                        <span>{pii.redacted}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-tertiary">
                    Tidak ada nomor HP, email, atau NIK yang terdeteksi pada
                    pesan ini.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Proposal Metadata */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="passport-title"
                  className="block text-xs font-medium text-ink-primary"
                >
                  Judul Usulan
                </label>
                <Input
                  id="passport-title"
                  value={suggestedTitle}
                  onChange={(e) => setSuggestedTitle(e.target.value)}
                  placeholder="Contoh: Pola MVC untuk Modul Antrean"
                  className="border-line-default bg-canvas text-xs text-ink-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="passport-rationale"
                  className="block text-xs font-medium text-ink-primary"
                >
                  Alasan Singkat
                </label>
                <Textarea
                  id="passport-rationale"
                  value={suggestedRationale}
                  onChange={(e) => setSuggestedRationale(e.target.value)}
                  rows={3}
                  placeholder="Mengapa usulan ini penting untuk diketahui tim..."
                  className="border-line-default bg-canvas text-xs leading-relaxed text-ink-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="passport-kc"
                  className="block text-xs font-medium text-ink-primary"
                >
                  Knowledge Component Terkait
                </label>
                <Select value={targetKcId} onValueChange={setTargetKcId}>
                  <SelectTrigger
                    id="passport-kc"
                    className="w-full border-line-default bg-canvas text-xs text-ink-primary"
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
                          <span className="font-mono text-ink-tertiary">
                            {kc.code}
                          </span>
                          <span>{kc.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 rounded-xl border border-line-subtle bg-canvas p-3">
                <span className="block font-mono text-[10px] font-medium text-ink-tertiary">
                  PROVENANCE M2
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
              className="gap-1.5 bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active"
            >
              <ShieldCheck className="size-4" />
              <span>
                {isSubmitting
                  ? "Mengirim Usulan..."
                  : "Setujui & Kirim Usulan ke Tim"}
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
      <DialogContent className="max-h-[85vh] overflow-y-auto border border-line-subtle bg-surface-raised shadow-raised sm:max-w-3xl">
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
