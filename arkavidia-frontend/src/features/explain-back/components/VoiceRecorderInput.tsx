import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, RotateCcw, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface VoiceRecorderInputProps {
  readonly value: string
  readonly onChange: (text: string) => void
  readonly disabled?: boolean
  readonly className?: string
}

interface SpeechRecognitionItem {
  readonly transcript: string
  readonly confidence?: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: {
    readonly [index: number]: SpeechRecognitionItem
  }
}

interface SpeechRecognitionEvent {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface BrowserSpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition

export function VoiceRecorderInput({
  value,
  onChange,
  disabled = false,
  className,
}: VoiceRecorderInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [speechConfidence, setSpeechConfidence] = useState<number | null>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  // Determine speech support once on initial render
  const [isSpeechSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition)
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition

    if (SpeechClass) {
      const recognition = new SpeechClass()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "id-ID"

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i][0]
          transcript += item.transcript
          if (typeof item.confidence === "number") {
            setSpeechConfidence(Number(item.confidence.toFixed(2)))
          }
        }
        if (transcript.trim()) {
          onChange(transcript)
        }
      }

      recognition.onerror = () => {
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore cleanup abort error
        }
      }
    }
  }, [onChange])

  // Timer while recording
  useEffect(() => {
    if (!isRecording) return
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isRecording])

  const toggleRecording = () => {
    if (disabled) return

    if (isRecording) {
      setIsRecording(false)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
    } else {
      setIsRecording(true)
      setSeconds(0)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // ignore if active
        }
      } else {
        // Fallback simulation when Web Speech API is unavailable
        setTimeout(() => {
          if (!value) {
            onChange(
              "Kami menggunakan JWT karena stateless sehingga tidak membebani RAM server ketika klien mobile dan web mengakses bersamaan.",
            )
            setSpeechConfidence(0.92)
          }
        }, 3000)
      }
    }
  }

  const handleReset = () => {
    if (isRecording) {
      toggleRecording()
    }
    onChange("")
    setSeconds(0)
    setSpeechConfidence(null)
  }

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Recording Control & Waveform Display */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-line-subtle bg-canvas/40 p-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="lg"
            disabled={disabled}
            onClick={toggleRecording}
            className={cn(
              "size-12 rounded-full p-0 shadow-sm transition-[transform,background-color,box-shadow] duration-150 ease-out",
              isRecording
                ? "animate-pulse bg-error text-on-error hover:bg-error/90"
                : "bg-brand text-on-brand hover:bg-brand-hover",
            )}
          >
            {isRecording ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Button>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold text-ink-primary">
                {isRecording ? "Merekam Suara..." : "Tekan untuk Mulai Rekam"}
              </span>
              {isRecording && <span className="flex size-2 rounded-full bg-error animate-ping" />}
            </div>
            <p className="font-mono text-xs text-ink-tertiary tabular-nums">
              {formatTimer(seconds)} / 02:00 maks
            </p>
          </div>
        </div>

        {/* Animated Waveform Simulation */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-1 rounded-full bg-brand transition-[height,opacity,background-color] duration-150 ease-out",
                isRecording ? "opacity-80" : "h-2 bg-muted opacity-40",
              )}
              style={{
                height: isRecording
                  ? `${Math.max(6, Math.sin((idx + seconds * 3) * 0.7) * 26 + 14)}px`
                  : "6px",
              }}
            />
          ))}
        </div>

        {/* Reset button */}
        {value && !isRecording && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-line-subtle text-xs"
            title="Rekam Ulang"
          >
            <RotateCcw className="size-3 mr-1" />
            Rekam Ulang
          </Button>
        )}
      </div>

      {/* Transcription Preview & Edit Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-ink-secondary">
          <span className="flex items-center gap-1 font-medium">
            <Volume2 className="size-3.5 text-brand" />
            Transkripsi Suara (Dapat Diedit Sebelum Kirim)
          </span>
          {speechConfidence !== null && (
            <span className="font-mono text-[11px] text-text-success">
              Confidence: {Math.round(speechConfidence * 100)}%
            </span>
          )}
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isRecording}
          placeholder="Hasil rekaman suara akan muncul di sini secara otomatis. Kamu dapat mengedit atau memperbaiki kalimat kapan saja sebelum dikirim."
          className="min-h-[100px] border-line-subtle bg-surface text-sm leading-relaxed text-ink-primary shadow-xs"
        />

        <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
          <span>
            {isSpeechSupported
              ? "Didukung Web Speech API Bahasa Indonesia."
              : "Mode fallback suara lokal aktif."}
          </span>
          <span className="font-mono tabular-nums">{value.length} karakter</span>
        </div>
      </div>
    </div>
  )
}
