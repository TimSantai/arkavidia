import { SEED_MASTERY } from "@/mocks/seedData"
import type { PiiMatch, User } from "@/types/bersama"

export interface PersonalSuggestionChip {
  readonly id: string
  readonly label: string
  readonly prompt: string
}

export interface TextHighlightSegment {
  readonly key: string
  readonly text: string
  readonly pii?: PiiMatch
}

export const PERSONAL_AGENT_SUGGESTIONS: readonly PersonalSuggestionChip[] = [
  {
    id: "team-delta",
    label: "Apa yang berubah di tim dan menyangkut tugasku?",
    prompt: "Apa yang berubah di tim dan menyangkut tugasku?",
  },
  {
    id: "explain-jwt",
    label: "Bantu jelaskan ulang kenapa tim memilih JWT di DEC-02",
    prompt: "Bantu jelaskan ulang kenapa tim memilih JWT di DEC-02",
  },
  {
    id: "simulate-pii",
    label: "Simulasikan catatan dengan nomor HP 0812-9988-7766 untuk tes Context Passport",
    prompt: "Simulasikan catatan dengan nomor HP 0812-9988-7766 untuk tes Context Passport",
  },
]

export const PII_KIND_LABELS: Readonly<Record<PiiMatch["kind"], string>> = {
  phone: "No. HP",
  email: "Email",
  nik: "NIK",
  name: "Nama",
}

export function formatPrivateMessageTime(iso: string): string {
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

export function buildHighlightedPiiSegments(
  text: string,
  matches: readonly PiiMatch[]
): readonly TextHighlightSegment[] {
  if (!text || matches.length === 0) {
    return [{ key: "seg-0", text }]
  }

  const segments: TextHighlightSegment[] = []
  let cursor = 0
  let segIndex = 0

  for (const match of matches) {
    const cleanNeedle = match.original.trimEnd()
    if (!cleanNeedle) continue

    const foundAt = text.indexOf(cleanNeedle, cursor)
    if (foundAt === -1) continue

    if (foundAt > cursor) {
      segments.push({
        key: `seg-${segIndex++}`,
        text: text.slice(cursor, foundAt),
      })
    }

    segments.push({
      key: `seg-${segIndex++}`,
      text: cleanNeedle,
      pii: match,
    })

    cursor = foundAt + cleanNeedle.length
  }

  if (cursor < text.length) {
    segments.push({
      key: `seg-${segIndex}`,
      text: text.slice(cursor),
    })
  }

  return segments.length > 0 ? segments : [{ key: "seg-0", text }]
}

function getPersonaMasteryNote(userId: string): string {
  const records = SEED_MASTERY.filter((m) => m.userId === userId)
  const formatScore = (kcId: string): string => {
    const rec = records.find((r) => r.kcId === kcId)
    return rec ? rec.pMastery.toFixed(2) : "0.00"
  }

  return `KC-01 MVC=${formatScore("kc-mvc")}, KC-02 JWT=${formatScore("kc-jwt")}, KC-03 DB=${formatScore("kc-db")}, KC-04 API=${formatScore("kc-api")}`
}

export function buildPersonalAgentReply(user: User, promptText: string): string {
  const firstName = user.name.split(" ")[0]
  const lower = promptText.toLowerCase()
  const masterySummary = getPersonaMasteryNote(user.id)

  // Chip 3: PII simulation for Context Passport test
  if (
    /simulasikan catatan|context passport|0812-9988-7766|nik|@gmail/i.test(lower)
  ) {
    const emailByPersona: Readonly<Record<string, string>> = {
      "user-rani": "rani.personal@gmail.com",
      "user-dimas": "dimas.personal@gmail.com",
      "user-budi": "budi.personal@gmail.com",
      "user-sari": "sari.personal@gmail.com",
    }
    const personalEmail = emailByPersona[user.id] ?? "rani.personal@gmail.com"

    if (user.id === "user-dimas") {
      return `Draft catatan M1 untuk Dimas: untuk rotasi refresh token DEC-02 pada modul login, jika pengujian QA mobile menemukan token kadaluarsa sebelum waktunya silakan hubungi 0812-9988-7766 atau email ${personalEmail}. Inti teknisnya: kita pakai TTL access token 15 menit dan refresh token tersimpan aman. Catatan ini siap diuji dengan **Bagikan via Context Passport** agar nomor HP & email disamarkan otomatis sebelum masuk ke M2.`
    }
    if (user.id === "user-budi") {
      return `Draft catatan M1 untuk Budi: skema constraint unik (poli_id, tanggal, nomor_urut) di DEC-03 sudah siap diuji skrip migrasi; jika loket klinik butuh eskalasi jadwal lab, kontak pribadiku di 0812-9988-7766 atau ${personalEmail}. Gunakan **Bagikan via Context Passport** di bawah pesan ini untuk menyamarkan PII otomatis sebelum menjadi usulan tim M2.`
    }
    if (user.id === "user-sari") {
      return `Draft catatan M1 untuk Sari: checklist integrasi endpoint antrean dan header JWT Bearer sudah kususun; untuk review tugas minggu ke-3 bisa hubungi 0812-9988-7766 atau ${personalEmail}. Klik **Bagikan via Context Passport** untuk melihat penyamaran nomor HP dan email sebelum dikirim ke Project Brain M2.`
    }

    return `Draft catatan M1 untuk Rani: untuk finalisasi struktur Controller antrean di DEC-01 dan sinkronisasi dengan login JWT DEC-02, kalau perlu koordinasi cepat di luar jam kelas hubungi 0812-9988-7766 atau ${personalEmail}. Tekan **Bagikan via Context Passport** pada pesan ini — nomor HP dan email akan disamarkan otomatis menjadi placeholder sebelum masuk ke usulan tim M2.`
  }

  // Chip 1: What changed in team & relates to user's task
  if (/berubah di tim|menyangkut tugasku|update tim|delta/i.test(lower)) {
    switch (user.id) {
      case "user-dimas":
        return `Ringkasan pribadi untuk Dimas (M1 + M2 + M3 milikmu: ${masterySummary}):\n1. **DEC-03 (Proposed)** dari Budi mengusulkan unique constraint \`(poli_id, tanggal, nomor_urut)\` — cek apakah endpoint login/loket milikmu perlu mengembalikan \`poli_id\` di klaim JWT.\n2. **Silo Alert M3**: Di \`KC-02 JWT\`, hanya kamu yang sudah paham (P(L)=0.91), sementara Rani (0.42) dan Sari (0.20) masih butuh penjelasan arsitektural.`
      case "user-budi":
        return `Ringkasan pribadi untuk Budi (M1 + M2 + M3 milikmu: ${masterySummary}):\n1. **DEC-03** yang kamu usulkan tentang constraint unik PostgreSQL masih berstatus \`PROPOSED\` menunggu konfirmasi tim di Ruang Tim.\n2. **DEC-02 (Confirmed)** memakai JWT stateless — pastikan tabel antrean mengaitkan \`user_id\` dari klaim token. Skor \`KC-02 JWT\` milikmu masih 0.31; mau kuringkaskan alurnya?`
      case "user-sari":
        return `Selamat bergabung minggu ke-3, Sari! (M1 + M2 + M3 milikmu: ${masterySummary}):\n1. **DEC-01 (Confirmed)**: Tim sepakat memakai pola MVC.\n2. **DEC-02 (Confirmed)**: Dimas mengganti Cookie Session ke JWT stateless agar web & mobile bisa akses API yang sama.\n3. **DEC-03 (Proposed)**: Budi mengusulkan constraint unik nomor antrean di PostgreSQL.\nFokus tugas \`KC-04 API\` milikmu sekarang langsung bersinggungan dengan header \`Authorization: Bearer\` dari DEC-02.`
      default:
        return `Ringkasan pribadi untuk Rani (M1 + M2 + M3 milikmu: ${masterySummary}):\n1. **DEC-03 (Proposed)** oleh Budi menambahkan constraint unik PostgreSQL \`(poli_id, tanggal, nomor_urut)\` — berpengaruh ke penanganan error duplikat pada Controller MVC kamu.\n2. **DEC-02 (Confirmed)** memakai JWT dengan refresh token; ini menyangkut alur View login.\n3. Di M3 pribadimu, \`KC-02 JWT\` masih P(L)=0.42 (di bawah ambang 0.70), jadi layak dipelajari sebelum Explain-Back Check.`
    }
  }

  // Chip 2: Re-explain why team chose JWT in DEC-02
  if (/jwt|dec-02|dec 02|session/i.test(lower)) {
    switch (user.id) {
      case "user-dimas":
        return `Pengingat poin inti **DEC-02** untukmu, Dimas (supaya mudah dijelaskan saat peer pairing):\n• **Kenapa mengganti DEC-02-v0 (Cookie Session)?** Session di RAM server tidak cocok karena aplikasi antrean mobile pasien akan memakai REST API yang sama.\n• **Trade-off**: JWT bersifat *stateless* (header \`Authorization: Bearer\`), namun tim wajib mengelola masa berlaku pendek + refresh token agar pencabutan sesi tetap aman.`
      case "user-budi":
        return `Penjelasan **DEC-02 (JWT)** dari sisi dampak ke Database untukmu, Budi:\n• Tim mengganti Cookie Session (\`DEC-02-v0\`) dengan JWT agar server API tidak perlu membaca tabel \`sessions\` di PostgreSQL setiap kali polling status antrean.\n• Klien web dan aplikasi antrean mobile cukup mengirim token bertanda tangan di header HTTP, sehingga beban query ke DB fokus pada data pasien & antrean.`
      case "user-sari":
        return `Penjelasan **DEC-02 (JWT)** khusus untuk integrasi API, Sari:\n• Awalnya tim mencoba Cookie Session di memori server (\`DEC-02-v0\`), tetapi dibatalkan karena klien mobile antrean pasien juga akan mengakses API yang sama.\n• Dengan **JWT stateless**, endpoint yang kamu kerjakan cukup memvalidasi signature token di header \`Authorization: Bearer <token>\` tanpa session store bersama.`
      default:
        return `Penjelasan **DEC-02 (JWT)** dari sudut pandang MVC & Frontend untukmu, Rani:\n• Tim mengganti Cookie Session (\`DEC-02-v0\`) ke **JWT stateless** karena API yang sama akan dipakai oleh web frontend dan klien antrean mobile tanpa berbagi memori session di server.\n• Di lapisan Controller/View MVC, artinya frontend menyimpan access token berumur pendek dan memakai refresh token saat kadaluarsa — memahami trade-off ini juga menaikkan penguasaan \`KC-02 JWT\` kamu.`
    }
  }

  return `Catatan untuk ${firstName} (konteks M1 pribadi + M2 terkonfirmasi + skor M3 milikmu: ${masterySummary}): pesan "${promptText.trim()}" sudah dicatat di Ruang Pribadi berlabel \`M1 PRIVATE\`. Informasi ini tidak terbaca oleh Team Agent maupun anggota lain kecuali kamu mengirim ringkasan tersamarkan lewat **Context Passport**.`
}
