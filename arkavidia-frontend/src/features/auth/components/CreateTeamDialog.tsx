import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Team, User } from "@/types/bersama"

interface CreateTeamDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly activeUser: User
  readonly onCreateTeam: (newTeam: Team) => void
}

function generateInviteCode(courseCode: string): string {
  const prefix =
    courseCode
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase() || "TEAM"
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${suffix}`
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  activeUser,
  onCreateTeam,
}: CreateTeamDialogProps) {
  const [name, setName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{
    name?: string
    courseCode?: string
    description?: string
  }>({})

  const resetForm = () => {
    setName("")
    setCourseCode("")
    setDescription("")
    setErrors({})
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedCourse = courseCode.trim()
    const trimmedDesc = description.trim()
    const nextErrors: {
      name?: string
      courseCode?: string
      description?: string
    } = {}

    if (trimmedName.length < 3) {
      nextErrors.name = "Nama tim minimal 3 karakter."
    }
    if (trimmedCourse.length < 2) {
      nextErrors.courseCode = "Kode mata kuliah wajib diisi (mis. IF2210 PBO)."
    }
    if (trimmedDesc.length < 8) {
      nextErrors.description = "Deskripsi singkat proyek minimal 8 karakter."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const createdTeam: Team = {
      id: `team-${Date.now()}`,
      name: trimmedName,
      courseCode: trimmedCourse.toUpperCase(),
      description: trimmedDesc,
      inviteCode: generateInviteCode(trimmedCourse),
      members: [activeUser],
      createdAt: new Date().toISOString(),
    }

    onCreateTeam(createdTeam)
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-line-subtle bg-surface-raised shadow-raised ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-ink-primary">
            Buat Tim Proyek Baru
          </DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Setiap tim mendapat Ruang Tim (M2), Project Brain, serta Ruang
            Pribadi M1 per anggota.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="create-team-name"
              className="text-xs font-medium text-ink-primary"
            >
              Nama Tim
            </label>
            <Input
              id="create-team-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="Contoh: Kelompok 7 (Smart Campus)"
              aria-invalid={Boolean(errors.name)}
              className={cn(
                "bg-surface text-base text-ink-primary sm:text-sm",
                errors.name ? "border-line-error" : "border-line-default"
              )}
            />
            {errors.name && (
              <p className="text-xs text-text-error">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="create-team-course"
              className="text-xs font-medium text-ink-primary"
            >
              Kode Mata Kuliah
            </label>
            <Input
              id="create-team-course"
              value={courseCode}
              onChange={(e) => {
                setCourseCode(e.target.value)
                if (errors.courseCode) {
                  setErrors((prev) => ({ ...prev, courseCode: undefined }))
                }
              }}
              placeholder="Contoh: IF3270 Machine Learning"
              aria-invalid={Boolean(errors.courseCode)}
              className={cn(
                "bg-surface text-base text-ink-primary sm:text-sm",
                errors.courseCode ? "border-line-error" : "border-line-default"
              )}
            />
            {errors.courseCode && (
              <p className="text-xs text-text-error">{errors.courseCode}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="create-team-desc"
              className="text-xs font-medium text-ink-primary"
            >
              Deskripsi Singkat Proyek
            </label>
            <Textarea
              id="create-team-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }))
                }
              }}
              placeholder="Jelaskan ruang lingkup tugas besar tim kalian."
              aria-invalid={Boolean(errors.description)}
              className={cn(
                "min-h-20 bg-surface text-base text-ink-primary sm:text-sm",
                errors.description ? "border-line-error" : "border-line-default"
              )}
            />
            {errors.description && (
              <p className="text-xs text-text-error">{errors.description}</p>
            )}
          </div>

          <DialogFooter className="border-t border-line-subtle bg-surface/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="gap-1.5">
              <Plus className="size-4" aria-hidden="true" />
              Buat Tim
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
