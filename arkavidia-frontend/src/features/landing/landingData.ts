import avatarBudi from "./assets/avatar-budi.jpg"
import avatarDimas from "./assets/avatar-dimas.jpg"
import avatarRani from "./assets/avatar-rani.jpg"
import avatarSari from "./assets/avatar-sari.jpg"
import teamCollabScene from "./assets/team-collab-scene.jpg"

export type EcosystemBrandId =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "notion"
  | "whatsapp"
  | "github"
  | "postgresql"
  | "supabase"
  | "fastapi"

export interface NavLinkItem {
  readonly href: string
  readonly label: string
}

export interface EcosystemNode {
  readonly id: EcosystemBrandId
  readonly name: string
  readonly role: string
  readonly ring: "outer" | "inner"
  readonly status: "live" | "soon"
}

export interface PulseEvent {
  readonly from: EcosystemBrandId
  readonly text: string
}

export interface EmpiricalStat {
  readonly id: string
  readonly value: string
  readonly description: string
  readonly citation: string
  readonly methodNote: string
}

export interface DecisionRow {
  readonly id: string
  readonly title: string
  readonly kc: string
  readonly understood: number
  readonly total: number
  readonly aiAssisted?: boolean
  readonly comments?: number
  readonly date: string
  readonly ownerId: string
}

export interface DecisionGroup {
  readonly label: string
  readonly count: number
  readonly faded?: boolean
  readonly rows: readonly DecisionRow[]
}

export interface WeeklyCyclePhase {
  readonly id: "capture" | "map" | "check" | "close"
  readonly step: string
  readonly title: string
  readonly shortSummary: string
  readonly mechanismTitle: string
  readonly formulaTag: string
  readonly mechanismPlain: string
  readonly technicalNote: string
  readonly demoPath: string
  readonly demoCta: string
  readonly size: "wide" | "narrow"
  readonly glow: "brand" | "violet" | "amber" | "cyan"
}

export interface EthicsGuardrail {
  readonly id: "no-override" | "no-leak" | "no-grading" | "no-surveillance"
  readonly badge: string
  readonly title: string
  readonly description: string
  readonly technicalNote: string
}

export interface DemoTeamMember {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly initials: string
  readonly roleLabel: string
  readonly avatarSrc: string
}

export interface HeatmapKcColumn {
  readonly code: string
  readonly shortLabel: string
  readonly coverageCount: number
  readonly isSilo?: boolean
}

export interface HeatmapMemberRow {
  readonly memberId: string
  readonly scores: readonly [number, number, number, number]
}

export const TEAM_COLLAB_SCENE_SRC = teamCollabScene

export const HERO_CONTENT = {
  announcementTag: "HACKVIDIA 11.0",
  announcementText: "AI for Learning & Self-Growth",
  title: "Satu tim, semua paham.",
  titleLead: "Satu tim,",
  titleAccent: "semua paham.",
  leadBefore: "ChatGPT membantu tim tahu",
  leadWhat: "apa",
  leadMiddle: "yang diputuskan. BERSAMA memastikan setiap anggota bisa menjelaskan",
  leadWhy: "kenapa",
  primaryCta: { label: "Coba demo gratis", to: "/teams/team-pbo-01/chat" },
  secondaryCta: { label: "Lihat cara kerjanya", href: "#cara-kerja" },
  socialProof: "Dicoba tim IF2210 PBO · 5 menit per minggu",
} as const

export const NAV_LINKS: readonly NavLinkItem[] = [
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#privasi", label: "Privasi" },
  { href: "#riset", label: "Riset" },
  { href: "#tim", label: "Tim" },
]

export const ECOSYSTEM_NODES: readonly EcosystemNode[] = [
  // Outer ring: everyday student collaboration & AI tools
  { id: "whatsapp", name: "WhatsApp", role: "Import riwayat chat grup", ring: "outer", status: "soon" },
  { id: "github", name: "GitHub", role: "PR & commit jadi konteks keputusan", ring: "outer", status: "soon" },
  { id: "notion", name: "Notion", role: "Catatan rapat jadi usulan keputusan", ring: "outer", status: "soon" },
  { id: "chatgpt", name: "ChatGPT", role: "Model AI pilihan tim", ring: "outer", status: "live" },
  { id: "claude", name: "Claude", role: "Model AI pilihan tim", ring: "outer", status: "live" },
  { id: "gemini", name: "Gemini", role: "Model AI pilihan tim", ring: "outer", status: "live" },
  // Inner ring: core infrastructure behind the scenes
  { id: "supabase", name: "Supabase", role: "Auth & Row-Level Security", ring: "inner", status: "live" },
  { id: "postgresql", name: "PostgreSQL", role: "Memori tim + pencarian hybrid", ring: "inner", status: "live" },
  { id: "fastapi", name: "FastAPI", role: "Orkestrator agent", ring: "inner", status: "live" },
]

export const PULSE_EVENTS: readonly PulseEvent[] = [
  { from: "whatsapp", text: "12 pesan grup diimpor" },
  { from: "claude", text: "Kandidat DEC-15 diekstrak" },
  { from: "github", text: "PR #18 ditautkan ke DEC-14" },
  { from: "notion", text: "Catatan rapat jadi 2 usulan" },
  { from: "gemini", text: "Ringkasan mingguan dibuat" },
  { from: "chatgpt", text: "Pertanyaan explain-back disusun" },
]

export const DEMO_TEAM_MEMBERS: readonly DemoTeamMember[] = [
  {
    id: "user-rani",
    name: "Rani Kusuma",
    shortName: "Rani",
    initials: "RK",
    roleLabel: "Lead · MVC",
    avatarSrc: avatarRani,
  },
  {
    id: "user-dimas",
    name: "Dimas Pratama",
    shortName: "Dimas",
    initials: "DP",
    roleLabel: "Member · JWT",
    avatarSrc: avatarDimas,
  },
  {
    id: "user-budi",
    name: "Budi Santoso",
    shortName: "Budi",
    initials: "BS",
    roleLabel: "Member · DB",
    avatarSrc: avatarBudi,
  },
  {
    id: "user-sari",
    name: "Sari Wulandari",
    shortName: "Sari",
    initials: "SW",
    roleLabel: "Member · API",
    avatarSrc: avatarSari,
  },
]

export const HEATMAP_KCS: readonly HeatmapKcColumn[] = [
  { code: "KC-01", shortLabel: "MVC", coverageCount: 3 },
  { code: "KC-02", shortLabel: "JWT", coverageCount: 1, isSilo: true },
  { code: "KC-03", shortLabel: "Skema DB", coverageCount: 2 },
  { code: "KC-04", shortLabel: "REST API", coverageCount: 2 },
]

export const HEATMAP_MATRIX: readonly HeatmapMemberRow[] = [
  { memberId: "user-rani", scores: [0.92, 0.34, 0.78, 0.81] },
  { memberId: "user-dimas", scores: [0.82, 0.91, 0.44, 0.79] },
  { memberId: "user-budi", scores: [0.76, 0.24, 0.89, 0.48] },
  { memberId: "user-sari", scores: [0.58, 0.18, 0.41, 0.62] },
]

export const DECISION_GROUPS: readonly DecisionGroup[] = [
  {
    label: "PERLU DIPAHAMI",
    count: 3,
    rows: [
      {
        id: "DEC-14",
        title: "Autentikasi pakai JWT + refresh token",
        kc: "KC-02 JWT",
        understood: 1,
        total: 4,
        aiAssisted: true,
        date: "12 Mar",
        ownerId: "user-dimas",
      },
      {
        id: "DEC-12",
        title: "Antrean pasien pakai priority queue",
        kc: "KC-03 Skema DB",
        understood: 2,
        total: 4,
        date: "10 Mar",
        ownerId: "user-budi",
      },
      {
        id: "DEC-11",
        title: "Validasi input dipindah ke service layer",
        kc: "KC-04 REST",
        understood: 2,
        total: 4,
        comments: 4,
        date: "9 Mar",
        ownerId: "user-sari",
      },
    ],
  },
  {
    label: "SUDAH DIPAHAMI",
    count: 6,
    faded: true,
    rows: [
      {
        id: "DEC-09",
        title: "Arsitektur MVC untuk modul klinik",
        kc: "KC-01 MVC",
        understood: 4,
        total: 4,
        date: "5 Mar",
        ownerId: "user-rani",
      },
      {
        id: "DEC-07",
        title: "Penamaan endpoint REST pakai kata benda jamak",
        kc: "KC-04 REST",
        understood: 3,
        total: 4,
        date: "3 Mar",
        ownerId: "user-dimas",
      },
    ],
  },
]

export const EMPIRICAL_STATS: readonly EmpiricalStat[] = [
  {
    id: "bastani",
    value: "-17%",
    description: "Skor siswa turun saat akses AI tanpa guardrail dicabut.",
    citation: "Bastani et al., PNAS 2025",
    methodNote:
      "Studi eksperimental pada pembelajaran pemrograman menunjukkan ketergantungan pada jawaban instan AI menurunkan transfer pemahaman mandiri ketika bantuan dilepas.",
  },
  {
    id: "anthropic",
    value: "50% vs 67%",
    description: "Pemahaman debugging dengan AI pasif lebih rendah dibanding aktif.",
    citation: "Anthropic Research, Jan 2026",
    methodNote:
      "Developer yang hanya menyalin solusi LLM mencetak skor pemahaman konseptual lebih rendah dibanding yang melakukan penjelasan aktif.",
  },
  {
    id: "cscl",
    value: "g = 0.61",
    description: "Kenaikan self-regulated learning lewat Group Awareness kolaboratif.",
    citation: "Chen et al., IJCSCL 2024",
    methodNote:
      "Meta-analisis Computer-Supported Collaborative Learning menunjukkan alat kesadaran kelompok meningkatkan regulasi belajar dan koordinasi tim.",
  },
]

export const WEEKLY_CYCLES: readonly WeeklyCyclePhase[] = [
  {
    id: "capture",
    step: "01",
    title: "Tangkap.",
    shortSummary:
      "Keputusan, alasan, dan alternatif yang ditolak diekstrak dari chat. Tim selalu mengonfirmasi dulu.",
    mechanismTitle: "Project Brain & Propose-Confirm",
    formulaTag: "M1 · Context Passport · M2",
    mechanismPlain:
      "Kandidat keputusan, alasan, dan alternatif yang ditolak diekstrak dari diskusi. Anggota tim tetap memegang konfirmasi akhir.",
    technicalNote:
      "Disimpan pada graf bitemporal (valid_from / recorded_at) dengan tautan langsung ke pesan sumber M2.",
    demoPath: "/teams/team-pbo-01/brain",
    demoCta: "Lihat Project Brain",
    size: "wide",
    glow: "brand",
  },
  {
    id: "map",
    step: "02",
    title: "Petakan.",
    shortSummary:
      "Lihat siapa paham bagian mana, dan silo mana yang berisiko.",
    mechanismTitle: "Knowledge Coverage & Bus Factor",
    formulaTag: "Bus Factor = min |S| : cov < 50%",
    mechanismPlain:
      "Setiap keputusan tertaut ke Knowledge Component (KC) untuk memetakan siapa yang sudah paham dan mencegah silo sebelum presentasi.",
    technicalNote:
      "Ambang penguasaan memakai probabilitas BKT P(L) >= 0.70 serta deteksi konsentrasi Gini.",
    demoPath: "/teams/team-pbo-01/understanding",
    demoCta: "Buka Peta Pemahaman",
    size: "narrow",
    glow: "violet",
  },
  {
    id: "check",
    step: "03",
    title: "Uji paham.",
    shortSummary:
      "Jelaskan ulang keputusan rekanmu lewat teks atau voice note. Kalau AI ragu, ia tidak menebak.",
    mechanismTitle: "Adaptive Explain-Back Check",
    formulaTag: "IRT 2PL · Conformal s > lambda",
    mechanismPlain:
      "Pertanyaan singkat memprioritaskan keputusan rekan lain atau item berbantuan AI. Saat grader ragu, sistem abstain dan meneruskan ke rekan.",
    technicalNote:
      "Pemilihan item memakai informasi Fisher I_j(theta) * w_j dan kontrol risiko konformal alpha = 0.10.",
    demoPath: "/teams/team-pbo-01/check",
    demoCta: "Coba Explain-back",
    size: "narrow",
    glow: "amber",
  },
  {
    id: "close",
    step: "04",
    title: "Tutup celah.",
    shortSummary:
      "Sesi 10 menit \"jelaskan ke aku\" antar rekan, plus briefing interaktif untuk anggota yang tertinggal.",
    mechanismTitle: "Peer Pairing & Tutored Briefing",
    formulaTag: "Pairing 10 mnt · Socratic BKT",
    mechanismPlain:
      "Pasangkan anggota untuk transfer pemahaman 10 menit, dan bantu anggota baru mengejar konteks lewat dialog Socratic.",
    technicalNote:
      "Rekomendasi pairing memakai optimasi submodular greedy dan pembaruan BKT dengan faktor pelupaan.",
    demoPath: "/teams/team-pbo-01/briefing",
    demoCta: "Lihat Tutored Briefing",
    size: "wide",
    glow: "cyan",
  },
]

export const ETHICS_GUARDRAILS: readonly EthicsGuardrail[] = [
  {
    id: "no-override",
    badge: "Propose · Confirm",
    title: "Tidak memutuskan atas nama tim",
    description:
      "AI hanya mengekstrak kandidat keputusan; konfirmasi dan revisi tetap di tangan mahasiswa.",
    technicalNote:
      "Setiap usulan dari chat atau Context Passport berstatus proposed hingga disetujui anggota di Ruang Tim.",
  },
  {
    id: "no-leak",
    badge: "IFC Zero-Leak",
    title: "Tidak membocorkan M1 tanpa Context Passport",
    description:
      "Catatan pribadi M1 terisolasi dan wajib melewati pratinjau penyamaran PII sebelum dibagikan.",
    technicalNote:
      "Isolasi ditegakkan lewat Postgres Row-Level Security (RLS), Cedar Policy pre-LLM gate, dan deteksi PII otomatis.",
  },
  {
    id: "no-grading",
    badge: "Formatif Only",
    title: "Skor pemahaman bukan untuk nilai kuliah",
    description:
      "Probabilitas P(L) hanya menjadi cermin belajar pribadi agar tim berani menutup celah.",
    technicalNote:
      "Tidak ada ekspor nilai individu ke rubrik penilaian akademik atau peringkat kelas.",
  },
  {
    id: "no-surveillance",
    badge: "Agregat Tim",
    title: "Tidak mengirim skor individu ke dosen",
    description:
      "Dosen hanya melihat kesehatan belajar agregat tim tanpa akses ke catatan M1 maupun skor pribadi.",
    technicalNote:
      "Dirancang selaras dengan prinsip minimalisasi data dan persetujuan eksplisit UU PDP No. 27/2022.",
  },
]
