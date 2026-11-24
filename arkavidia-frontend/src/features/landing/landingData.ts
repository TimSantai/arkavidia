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

export interface EmpiricalStat {
  readonly id: string
  readonly value: string
  readonly description: string
  readonly citation: string
  readonly barPercentA: number
  readonly barPercentB: number
  readonly barLabelA: string
  readonly barLabelB: string
}

export interface WeeklyCyclePhase {
  readonly id: "capture" | "map" | "check" | "close"
  readonly step: string
  readonly title: string
  readonly shortSummary: string
  readonly mechanismTitle: string
  readonly formulaTag: string
  readonly mechanismPlain: string
  readonly demoPath: string
  readonly demoCta: string
}

export interface EthicsGuardrail {
  readonly id: "no-override" | "no-leak" | "no-grading" | "no-surveillance"
  readonly badge: string
  readonly title: string
  readonly description: string
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

export const NAV_LINKS: readonly NavLinkItem[] = [
  { href: "#perbedaan", label: "Perbedaan" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#privasi-etika", label: "Privasi & Etika" },
]

export const DEMO_TEAM_MEMBERS: readonly DemoTeamMember[] = [
  {
    id: "user-rani",
    name: "Rani Kusuma",
    shortName: "Rani",
    initials: "RK",
    roleLabel: "Lead • MVC",
    avatarSrc: avatarRani,
  },
  {
    id: "user-dimas",
    name: "Dimas Pratama",
    shortName: "Dimas",
    initials: "DP",
    roleLabel: "Member • JWT",
    avatarSrc: avatarDimas,
  },
  {
    id: "user-budi",
    name: "Budi Santoso",
    shortName: "Budi",
    initials: "BS",
    roleLabel: "Member • DB",
    avatarSrc: avatarBudi,
  },
  {
    id: "user-sari",
    name: "Sari Wulandari",
    shortName: "Sari",
    initials: "SW",
    roleLabel: "Member • API",
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

export const EMPIRICAL_STATS: readonly EmpiricalStat[] = [
  {
    id: "bastani",
    value: "-17%",
    description:
      "Penurunan performa siswa saat akses GPT-4 tanpa guardrail dicabut.",
    citation: "Bastani et al., PNAS 2025",
    barPercentA: 83,
    barPercentB: 100,
    barLabelA: "Tanpa Guardrail",
    barLabelB: "Kontrol Belajar",
  },
  {
    id: "anthropic",
    value: "50% vs 67%",
    description:
      "Skor pemahaman debugging developer memakai AI pasif dibanding manual.",
    citation: "Anthropic Research, Jan 2026",
    barPercentA: 50,
    barPercentB: 67,
    barLabelA: "AI Pasif",
    barLabelB: "Manual Aktif",
  },
  {
    id: "cscl",
    value: "g = 0.61",
    description:
      "Kenaikan self-regulated learning lewat Group Awareness Tools kolaboratif.",
    citation: "Chen et al., IJCSCL 2024",
    barPercentA: 45,
    barPercentB: 84,
    barLabelA: "Chat Biasa",
    barLabelB: "Group Awareness",
  },
]

export const WEEKLY_CYCLES: readonly WeeklyCyclePhase[] = [
  {
    id: "capture",
    step: "01",
    title: "Tangkap",
    shortSummary: "Ekstrak keputusan dari chat via propose-confirm & histori bitemporal.",
    mechanismTitle: "Bitemporal Knowledge Graph + Propose-Confirm",
    formulaTag: "M1 → CONTEXT PASSPORT → M2",
    mechanismPlain:
      "Kandidat keputusan, alasan, dan alternatif yang ditolak diekstrak terstruktur dengan rujukan pesan asli. Manusia selalu mengonfirmasi sebelum masuk Project Brain.",
    demoPath: "/teams/team-pbo-01/brain",
    demoCta: "Lihat Project Brain",
  },
  {
    id: "map",
    step: "02",
    title: "Petakan",
    shortSummary: "Deteksi cakupan tiap KC, Gini, dan Knowledge Bus Factor.",
    mechanismTitle: "Knowledge Coverage Matrix & Bus Factor",
    formulaTag: "BUS FACTOR = min |S| : cov < 50%",
    mechanismPlain:
      "Setiap keputusan tertaut ke Knowledge Component (KC). Sistem memetakan siapa yang sudah paham P(L) ≥ τ dan menyorot silo tunggal sebelum presentasi.",
    demoPath: "/teams/team-pbo-01/understanding",
    demoCta: "Buka Peta Pemahaman",
  },
  {
    id: "check",
    step: "03",
    title: "Uji Paham",
    shortSummary: "Explain-back IRT 2PL (≤ 5 mnt) dengan Conformal Abstention.",
    mechanismTitle: "Adaptive IRT 2PL + Conformal Risk Control",
    formulaTag: "I_j(θ) × w_j • s > λ̂ → ABSTAIN",
    mechanismPlain:
      "Soal adaptif memprioritaskan keputusan rekan lain & item dibantu AI. Jika grader ragu (s > λ̂), sistem abstain alih-alih memberi skor keliru.",
    demoPath: "/teams/team-pbo-01/check",
    demoCta: "Coba Explain-Back Check",
  },
  {
    id: "close",
    step: "04",
    title: "Tutup Celah",
    shortSummary: "Pairing 10 menit 'Jelaskan ke aku' & Tutored Briefing Socratic.",
    mechanismTitle: "Submodular Pairing & BKT dengan Forgetting",
    formulaTag: "PAIRING 10 MNT • SOCRATIC",
    mechanismPlain:
      "Optimizer greedy memasangkan rekan untuk transfer pemahaman 10 menit, sementara anggota baru mendapat dialog Socratic dari riwayat Project Brain.",
    demoPath: "/teams/team-pbo-01/briefing",
    demoCta: "Lihat Tutored Briefing",
  },
]

export const ETHICS_GUARDRAILS: readonly EthicsGuardrail[] = [
  {
    id: "no-override",
    badge: "PROPOSE → CONFIRM",
    title: "Tidak memutuskan atas nama tim",
    description:
      "AI hanya mengekstrak kandidat keputusan dari diskusi; konfirmasi akhir dan revisi tetap di tangan mahasiswa.",
  },
  {
    id: "no-leak",
    badge: "RLS + CEDAR + PII MASK",
    title: "Tidak membocorkan M1 tanpa Context Passport",
    description:
      "Catatan pribadi M1 dikunci Postgres RLS + Cedar Policy dan wajib melewati pratinjau masking PII sebelum masuk M2.",
  },
  {
    id: "no-grading",
    badge: "FORMATIF ONLY",
    title: "Skor pemahaman tidak dipakai untuk nilai kuliah",
    description:
      "Probabilitas P(L) adalah cermin belajar formatif agar mahasiswa jujur menutup celah, bukan alat pemeringkatan.",
  },
  {
    id: "no-surveillance",
    badge: "AGREGAT TIM ONLY",
    title: "Tidak mengirim skor individu ke dosen",
    description:
      "Sesuai UU PDP No. 27/2022, dosen hanya melihat metrik kesehatan tim agregat tanpa akses ke M1 atau P(L) pribadi.",
  },
]
