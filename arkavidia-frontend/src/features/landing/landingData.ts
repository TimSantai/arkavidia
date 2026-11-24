export interface NavLinkItem {
  readonly href: string
  readonly label: string
}

export interface ComparisonRow {
  readonly id: string
  readonly dimension: string
  readonly existingTools: string
  readonly bersama: string
}

export interface EmpiricalStat {
  readonly id: string
  readonly value: string
  readonly description: string
  readonly citation: string
}

export interface WeeklyCyclePhase {
  readonly id: "capture" | "map" | "check" | "close"
  readonly step: string
  readonly title: string
  readonly shortSummary: string
  readonly mechanismTitle: string
  readonly formulaTag: string
  readonly mechanismPlain: string
  readonly scenarioLabel: string
  readonly scenarioDetail: string
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
  readonly initials: string
  readonly roleLabel: string
}

export const NAV_LINKS: readonly NavLinkItem[] = [
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#perbedaan", label: "Perbedaan dengan ChatGPT" },
  { href: "#privasi-etika", label: "Privasi & Etika" },
]

export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  {
    id: "goal",
    dimension: "Tujuan Utama",
    existingTools:
      "Berhenti di \"apa yang diputuskan\" dan merangkum action item rapat.",
    bersama:
      "Memastikan setiap anggota tim mampu menjelaskan \"kenapa diputuskan\".",
  },
  {
    id: "privacy",
    dimension: "Isolasi Privasi Memori",
    existingTools:
      "Thread tunggal atau proyek bersama rawan mencampur catatan pribadi.",
    bersama:
      "IFC 2-lapis (Postgres RLS + Cedar Policy): M1 Privat → Context Passport (masking PII) → M2 Tim.",
  },
  {
    id: "validation",
    dimension: "Validasi Pemahaman",
    existingTools:
      "Tidak pernah mengukur penguasaan konsep tiap anggota di balik kode.",
    bersama:
      "Explain-Back adaptif berbasis IRT 2PL (≤ 5 mnt/minggu), prioritas pada keputusan rekan & item dibantu AI.",
  },
  {
    id: "uncertainty",
    dimension: "Penanganan Ketidakpastian AI",
    existingTools:
      "Tetap memberi jawaban atau skor yakin meski LLM sedang ragu.",
    bersama:
      "Conformal Risk Control (α = 0.1): otomatis abstain dan meneruskan ke pembuat keputusan untuk peer explanation.",
  },
  {
    id: "silo",
    dimension: "Deteksi Silo & Onboarding",
    existingTools:
      "Dokumen Notion atau ringkasan chat pasif yang jarang dibaca ulang.",
    bersama:
      "Peta Pemahaman, Knowledge Bus Factor, pairing 10 menit (\"Jelaskan ke aku\"), & Tutored Briefing Socratic.",
  },
]

export const EMPIRICAL_STATS: readonly EmpiricalStat[] = [
  {
    id: "bastani",
    value: "-17%",
    description:
      "Penurunan performa belajar siswa ketika akses GPT-4 tanpa guardrail dicabut.",
    citation: "Bastani et al., PNAS 2025",
  },
  {
    id: "anthropic",
    value: "50% vs 67%",
    description:
      "Skor pemahaman debugging developer dengan AI pasif dibandingkan pengerjaan manual.",
    citation: "Anthropic Research, Jan 2026",
  },
  {
    id: "cscl",
    value: "g = 0.61",
    description:
      "Effect size peningkatan self-regulated learning melalui Group Awareness Tools.",
    citation: "Chen et al., IJCSCL 2024",
  },
]

export const WEEKLY_CYCLES: readonly WeeklyCyclePhase[] = [
  {
    id: "capture",
    step: "01",
    title: "Tangkap",
    shortSummary:
      "Ekstraksi kandidat keputusan dari diskusi tim dengan alur propose-confirm dan histori bitemporal.",
    mechanismTitle: "Bitemporal Knowledge Graph + Propose-Confirm",
    formulaTag: "M1 → CONTEXT PASSPORT → M2",
    mechanismPlain:
      "Saat tim berdiskusi di Ruang Tim, AI mengekstrak kandidat keputusan, alasan, dan alternatif yang ditolak menggunakan JSON schema terverifikasi bukti kutipan. Tidak ada memori yang langsung sah sebelum dikonfirmasi manusia, dan perubahan keputusan lama dicatat dengan garis waktu valid_from / recorded_at.",
    scenarioLabel: "Skenario IF2210 PBO • DEC-02",
    scenarioDetail:
      "Dimas mengusulkan peralihan dari Cookie Session ke JWT stateless. Project Brain menyimpan versi lama (supersedes) sehingga Sari yang baru bergabung tetap bisa melacak perubahan minggu ke-1 hingga minggu ke-3.",
    demoPath: "/teams/team-pbo-01/brain",
    demoCta: "Lihat Project Brain",
  },
  {
    id: "map",
    step: "02",
    title: "Petakan",
    shortSummary:
      "Memetakan Knowledge Components (KC), cakupan pemahaman tim, dan Knowledge Bus Factor.",
    mechanismTitle: "Knowledge Coverage Matrix & Bus Factor",
    formulaTag: "BUS FACTOR = min |S| : cov < 50%",
    mechanismPlain:
      "Setiap keputusan ditautkan ke Knowledge Component (KC) seperti Arsitektur MVC atau JWT vs Session. Sistem menghitung berapa anggota yang sudah mencapai ambang paham P(L) ≥ τ, mengukur ketimpangan lewat koefisien Gini, serta mendeteksi titik rapuh jika satu anggota berhalangan.",
    scenarioLabel: "Silo Terdeteksi • KC-02",
    scenarioDetail:
      "Pada Kelompok 4, hanya Dimas yang memahami trade-off JWT vs Cookie Session (1/4 anggota). Peta Pemahaman menandai Bus Factor = 1 agar tim sadar sebelum presentasi tugas besar.",
    demoPath: "/teams/team-pbo-01/understanding",
    demoCta: "Buka Peta Pemahaman",
  },
  {
    id: "check",
    step: "03",
    title: "Uji Paham",
    shortSummary:
      "Explain-back singkat adaptif berbasis IRT 2PL (≤ 5 menit/minggu) dengan Conformal Abstention.",
    mechanismTitle: "Adaptive IRT 2PL + Conformal Risk Control",
    formulaTag: "I_j(θ) × w_j • s > λ̂ → ABSTAIN",
    mechanismPlain:
      "Algoritma Item Response Theory (IRT 2PL) memilih 3–5 pertanyaan terpenting, memprioritaskan keputusan yang dibuat rekan lain atau bertanda \"dibantu AI\". Jika tingkat ketidakpastian grader (s) melampaui ambang batas λ̂, AI tidak menebak nilai—sistem melakukan abstain dan mengundang peer explanation.",
    scenarioLabel: "Uji Paham • DEC-02",
    scenarioDetail:
      "Rani diminta menjelaskan alasan tim menolak Cookie Session pada modul login. Saat jawabannya berada di area abu-abu, grader melakukan abstain (s = 0.34 > λ̂) alih-alih memberi skor keliru.",
    demoPath: "/teams/team-pbo-01/check",
    demoCta: "Coba Explain-Back Check",
  },
  {
    id: "close",
    step: "04",
    title: "Tutup Celah",
    shortSummary:
      "Silo Alert dengan pairing 10 menit 'Jelaskan ke aku' serta Tutored Briefing Socratic.",
    mechanismTitle: "Submodular Pairing & BKT dengan Forgetting",
    formulaTag: "PAIRING 10 MNT • SOCRATIC",
    mechanismPlain:
      "Optimizer greedy memilih pasangan belajar peer-to-peer 10 menit yang memberi kenaikan coverage paling tinggi. Bagi anggota yang tertinggal atau baru bergabung, Tutored Briefing memandu dialog Socratic dari Project Brain agar mereka membangun pemahaman aktif, bukan sekadar membaca rangkuman pasif.",
    scenarioLabel: "Onboarding Sari & Pairing Dimas ↔ Rani",
    scenarioDetail:
      "Sari yang masuk pada minggu ke-3 mengikuti Tutored Briefing interaktif tentang MVC dan skema database, sementara Dimas dan Rani dipasangkan 10 menit untuk menuntaskan silo KC-02.",
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
      "AI hanya mengusulkan kandidat keputusan dan alternatifnya dari percakapan. Keputusan final, revisi, dan penanggung jawab sepenuhnya berada di tangan anggota tim.",
  },
  {
    id: "no-leak",
    badge: "RLS + CEDAR + PII MASK",
    title: "Tidak membocorkan M1 tanpa Context Passport",
    description:
      "Catatan belajar, keraguan pribadi, dan draft di Ruang Pribadi (M1) dikunci oleh Row-Level Security dan Cedar Policy. Berbagi ke tim wajib melewati pratinjau masking PII.",
  },
  {
    id: "no-grading",
    badge: "FORMATIF ONLY",
    title: "Skor pemahaman tidak pernah dipakai untuk nilai kuliah",
    description:
      "Probabilitas penguasaan P(L) berfungsi murni sebagai cermin belajar formatif untuk membantu mahasiswa jujur pada celah pemahamannya, bukan pemeringkatan akademis.",
  },
  {
    id: "no-surveillance",
    badge: "AGREGAT TIM ONLY",
    title: "Tidak mengirim skor individu ke dosen",
    description:
      "Sesuai kepatuhan UU PDP No. 27 Tahun 2022, dosen hanya dapat melihat kesehatan tim secara agregat (Coverage, Bus Factor, Gini) tanpa akses ke M1 maupun skor P(L) pribadi.",
  },
]

export const DEMO_TEAM_MEMBERS: readonly DemoTeamMember[] = [
  { id: "user-rani", name: "Rani Kusuma", initials: "RK", roleLabel: "Lead • MVC" },
  { id: "user-dimas", name: "Dimas Pratama", initials: "DP", roleLabel: "Member • JWT" },
  { id: "user-budi", name: "Budi Santoso", initials: "BS", roleLabel: "Member • DB" },
  { id: "user-sari", name: "Sari Wulandari", initials: "SW", roleLabel: "Member • API" },
]
