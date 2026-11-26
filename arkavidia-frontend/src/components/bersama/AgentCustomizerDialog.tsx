import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "cn"
import {
  AGENT_ROLE_META,
  COLOR_SWATCHES,
  CURATED_SKIN_OPTIONS,
  EYE_COLOR_SWATCHES,
  skinSupportsEyeColor,
  useAgentAppearance,
  type AgentRole,
  type AgentSemanticState,
} from "./agentConfig"
import { AgentStickerAvatar } from "./AgentStickerAvatar"

export interface AgentCustomizerDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly initialRole?: AgentRole
}

const ROLE_ORDER: readonly AgentRole[] = ["team", "private", "tutor"]

const PREVIEW_STATES: readonly { readonly value: AgentSemanticState; readonly label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "thinking", label: "Thinking" },
  { value: "speaking", label: "Speaking" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Wary" },
  { value: "nudge", label: "Wink" },
]

export function AgentCustomizerDialog({
  open,
  onOpenChange,
  initialRole = "team",
}: AgentCustomizerDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AgentRole>(initialRole)
  const [previewState, setPreviewState] = useState<AgentSemanticState>("idle")
  const { appearances, updateAppearance, resetAppearance } = useAgentAppearance()

  const activeAppearance = appearances[selectedRole]
  const roleMeta = AGENT_ROLE_META[selectedRole]
  const eyeColorEditable = skinSupportsEyeColor(activeAppearance.skin)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border border-line-subtle bg-surface-raised ring-0 shadow-raised sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-ink-primary">
            Kustomisasi Stiker AI Agent
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-secondary">
            Atur tampilan BoopFace untuk tiap pendamping ruang. Pengaturan tersimpan lokal di perangkatmu.
          </DialogDescription>
        </DialogHeader>

        {/* Role Selector Tabs */}
        <div
          role="tablist"
          aria-label="Pilih peran AI agent"
          className="grid grid-cols-1 gap-2 rounded-xl bg-well p-1.5 sm:grid-cols-3"
        >
          {ROLE_ORDER.map((role) => {
            const meta = AGENT_ROLE_META[role]
            const isSelected = selectedRole === role
            return (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedRole(role)
                  setPreviewState("idle")
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isSelected
                    ? "bg-surface-top text-ink-primary shadow-control"
                    : "text-ink-secondary hover:text-ink-primary"
                )}
              >
                <AgentStickerAvatar
                  role={role}
                  size={32}
                  interactive={false}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">
                    {meta.label}
                  </span>
                  <span className="block truncate text-xs text-ink-secondary">
                    {meta.roomLabel}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
          {/* Live Stage Preview */}
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-line-subtle bg-surface p-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-ink-primary">{roleMeta.label}</p>
              <p className="mt-0.5 text-xs text-ink-secondary">{roleMeta.roomLabel}</p>
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              <AgentStickerAvatar
                role={selectedRole}
                state={previewState}
                size={96}
                interactive
              />
              <p className="text-center text-xs text-ink-secondary">
                Arahkan kursor atau usap dahinya
              </p>
            </div>

            <div className="w-full space-y-1.5">
              <p className="text-xs font-medium text-ink-secondary">Uji Ekspresi</p>
              <div className="flex flex-wrap gap-1.5">
                {PREVIEW_STATES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPreviewState(item.value)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      previewState === item.value
                        ? "border-line-active bg-wash-brand text-ink-primary"
                        : "border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Material / Skin */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-primary">Material & Skin</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateAppearance(selectedRole, { skin: null })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-[background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    activeAppearance.skin === null
                      ? "border-line-active bg-wash-brand text-ink-primary shadow-badge"
                      : "border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary"
                  )}
                >
                  <span
                    className="size-3 rounded-full border border-black/15"
                    style={{ backgroundColor: activeAppearance.color }}
                    aria-hidden="true"
                  />
                  Warna Solid
                </button>
                {CURATED_SKIN_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateAppearance(selectedRole, { skin: option.id })}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-[background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      activeAppearance.skin === option.id
                        ? "border-line-active bg-wash-brand text-ink-primary shadow-badge"
                        : "border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary"
                    )}
                  >
                    <span
                      className="size-3 rounded-full border border-black/15"
                      style={{ backgroundColor: option.previewColor }}
                      aria-hidden="true"
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color (Flat) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-primary">Warna Dasar</p>
                {activeAppearance.skin !== null && (
                  <span className="text-xs text-ink-secondary">
                    Aktif saat memilih Warna Solid
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((swatch) => {
                  const selected = activeAppearance.color.toLowerCase() === swatch.hex.toLowerCase()
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      aria-label={`Warna dasar ${swatch.label}`}
                      aria-pressed={selected}
                      onClick={() =>
                        updateAppearance(selectedRole, {
                          skin: null,
                          color: swatch.hex,
                        })
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-[border-color,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        selected && activeAppearance.skin === null
                          ? "border-line-active bg-wash-brand text-ink-primary"
                          : "border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary"
                      )}
                    >
                      <span
                        className="size-3.5 rounded-full border border-black/15"
                        style={{ backgroundColor: swatch.hex }}
                        aria-hidden="true"
                      />
                      {swatch.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Eye Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-primary">Warna Mata</p>
                {!eyeColorEditable && (
                  <span className="text-xs text-ink-secondary">
                    Skin ini mempertahankan tekstur mata asli (kecuali Tembus Pandang)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EYE_COLOR_SWATCHES.map((swatch) => {
                  const disabled = !eyeColorEditable && swatch.value !== "transparent"
                  const selected = activeAppearance.eyeColor === swatch.value
                  return (
                    <button
                      key={swatch.label}
                      type="button"
                      disabled={disabled}
                      aria-pressed={selected}
                      onClick={() => updateAppearance(selectedRole, { eyeColor: swatch.value })}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-[border-color,background-color,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-45",
                        selected
                          ? "border-line-active bg-wash-brand text-ink-primary"
                          : "border-line-subtle bg-surface-top text-ink-secondary hover:text-ink-primary"
                      )}
                    >
                      <span
                        className="size-3 rounded-full border border-line-default"
                        style={{
                          backgroundColor:
                            swatch.value === "transparent"
                              ? "transparent"
                              : (swatch.value ?? "#ffffff"),
                        }}
                        aria-hidden="true"
                      />
                      {swatch.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Shape, View & Antenna */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-ink-primary">Sudut Mata</p>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-well p-1">
                  {(["round", "sharp"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateAppearance(selectedRole, { eyeStyle: style })}
                      className={cn(
                        "rounded-md py-1 text-xs font-medium transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        activeAppearance.eyeStyle === style
                          ? "bg-surface-top text-ink-primary shadow-badge"
                          : "text-ink-secondary hover:text-ink-primary"
                      )}
                    >
                      {style === "round" ? "Rounded" : "Sharp"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-ink-primary">Mode Kepala</p>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-well p-1">
                  {(["3d", "2d"] as const).map((viewMode) => (
                    <button
                      key={viewMode}
                      type="button"
                      onClick={() => updateAppearance(selectedRole, { view: viewMode })}
                      className={cn(
                        "rounded-md py-1 text-xs font-medium uppercase transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        activeAppearance.view === viewMode
                          ? "bg-surface-top text-ink-primary shadow-badge"
                          : "text-ink-secondary hover:text-ink-primary"
                      )}
                    >
                      {viewMode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-ink-primary">Antena</p>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-well p-1">
                  {([true, false] as const).map((hasAntenna) => (
                    <button
                      key={String(hasAntenna)}
                      type="button"
                      onClick={() => updateAppearance(selectedRole, { antenna: hasAntenna })}
                      className={cn(
                        "rounded-md py-1 text-xs font-medium transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        activeAppearance.antenna === hasAntenna
                          ? "bg-surface-top text-ink-primary shadow-badge"
                          : "text-ink-secondary hover:text-ink-primary"
                      )}
                    >
                      {hasAntenna ? "Aktif" : "Sembunyi"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resetAppearance(selectedRole)}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset {roleMeta.label}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
