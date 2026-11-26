import type {
  BriefingStep,
  ChatMessage,
  CheckAttempt,
  ExplainBackQuestion,
  KnowledgeComponent,
  MasteryRecord,
  MemoryEdge,
  MemoryItem,
  Team,
  User,
} from "@/types/bersama"

export const SEED_USERS: readonly User[] = [
  {
    id: "user-rani",
    name: "Rani Kusuma",
    email: "rani@mahasiswa.itb.ac.id",
    initials: "RK",
    role: "lead",
    moduleFocus: "Arsitektur MVC & Frontend",
  },
  {
    id: "user-dimas",
    name: "Dimas Pratama",
    email: "dimas@mahasiswa.itb.ac.id",
    initials: "DP",
    role: "member",
    moduleFocus: "Autentikasi JWT & Keamanan",
  },
  {
    id: "user-budi",
    name: "Budi Santoso",
    email: "budi@mahasiswa.itb.ac.id",
    initials: "BS",
    role: "member",
    moduleFocus: "Skema Database & Antrean",
  },
  {
    id: "user-sari",
    name: "Sari Wulandari",
    email: "sari@mahasiswa.itb.ac.id",
    initials: "SW",
    role: "member",
    moduleFocus: "Integrasi API (Baru bergabung Minggu ke-3)",
  },
]

export const CURRENT_USER: User = SEED_USERS[0]

export const SEED_TEAMS: readonly Team[] = [
  {
    id: "team-pbo-01",
    name: "Kelompok 4 · Sistem Antrean Klinik",
    courseCode: "IF2210 PBO",
    description:
      "Proyek akhir Pemrograman Berorientasi Objek: manajemen antrean pasien real-time dengan arsitektur MVC dan autentikasi JWT.",
    inviteCode: "PBO-K4-2026",
    members: SEED_USERS,
    createdAt: "2026-11-01T08:00:00+07:00",
  },
]

export const SEED_KCS: readonly KnowledgeComponent[] = [
  {
    id: "kc-mvc",
    teamId: "team-pbo-01",
    code: "KC-01",
    name: "Arsitektur MVC",
    description:
      "Pemisahan tanggung jawab Model, View, dan Controller agar pengujian unit tidak terikat UI.",
    criticality: "high",
  },
  {
    id: "kc-jwt",
    teamId: "team-pbo-01",
    code: "KC-02",
    name: "Autentikasi JWT vs Session",
    description:
      "Trade-off stateless token JWT dibanding server-side session untuk klien web & mobile.",
    criticality: "high",
  },
  {
    id: "kc-db",
    teamId: "team-pbo-01",
    code: "KC-03",
    name: "Skema Relasional Antrean",
    description:
      "Normalisasi tabel pasien, poli, dan nomor antrean dengan constraint unik per hari.",
    criticality: "medium",
  },
  {
    id: "kc-api",
    teamId: "team-pbo-01",
    code: "KC-04",
    name: "Kontrak REST & Error Handling",
    description:
      "Standar payload envelope, status HTTP, dan validasi input pada batas layanan.",
    criticality: "medium",
  },
]

export const SEED_MEMORY_ITEMS: readonly MemoryItem[] = [
  {
    id: "mem-dec-01",
    code: "DEC-01",
    teamId: "team-pbo-01",
    type: "decision",
    content: {
      title: "Gunakan pola arsitektur MVC",
      summary:
        "Seluruh modul antrean klinik dipisahkan ke lapisan Model, View, dan Controller.",
      rationale:
        "Memudahkan pembagian tugas paralel antar 4 anggota dan memungkinkan unit test logika antrean tanpa ketergantungan antarmuka.",
      rejectedAlternatives: ["Monolithic Page Script", "Clean Architecture 5-Layer (terlalu berat untuk 4 minggu)"],
      assigneeId: "user-rani",
    },
    ownerId: "user-rani",
    scope: "team",
    sensitivity: "normal",
    status: "confirmed",
    aiAssisted: false,
    provenance: "Dibagikan oleh Rani dari Ruang Pribadi (Context Passport)",
    kcIds: ["kc-mvc"],
    sourceMessageIds: ["msg-team-01"],
    validFrom: "2026-11-05T10:15:00+07:00",
    validTo: null,
    recordedAt: "2026-11-05T10:15:00+07:00",
  },
  {
    id: "mem-dec-02-v0",
    code: "DEC-02",
    teamId: "team-pbo-01",
    type: "decision",
    content: {
      title: "Modul login memakai Cookie Session dasar",
      summary: "Draft awal login menyimpan session ID pada memori server.",
      rationale: "Sederhana untuk prototipe lokal awal.",
      rejectedAlternatives: ["OAuth2 pihak ketiga"],
      assigneeId: "user-dimas",
    },
    ownerId: "user-dimas",
    scope: "team",
    sensitivity: "normal",
    status: "superseded",
    aiAssisted: false,
    provenance: "Ruang Tim · diskusi pekan 1",
    kcIds: ["kc-jwt"],
    sourceMessageIds: ["msg-team-02"],
    validFrom: "2026-11-04T09:00:00+07:00",
    validTo: "2026-11-10T14:20:00+07:00",
    recordedAt: "2026-11-04T09:05:00+07:00",
  },
  {
    id: "mem-dec-02",
    code: "DEC-02",
    teamId: "team-pbo-01",
    type: "decision",
    content: {
      title: "Modul login memakai JWT (stateless) oleh Dimas",
      summary:
        "Dimas mengerjakan modul autentikasi login menggunakan JWT dengan masa berlaku akses singkat dan refresh token.",
      rationale:
        "Dimas sudah berpengalaman dengan JWT dan API akan dikonsumsi klien web serta aplikasi antrean mobile tanpa shared session store.",
      rejectedAlternatives: ["Server-side Session di RAM", "Basic Auth"],
      assigneeId: "user-dimas",
      dueDate: "2026-11-28",
    },
    ownerId: "user-dimas",
    scope: "team",
    sensitivity: "normal",
    status: "confirmed",
    aiAssisted: true,
    provenance: "Diekstrak dari Ruang Tim & dikonfirmasi oleh Rani, Dimas",
    kcIds: ["kc-jwt"],
    sourceMessageIds: ["msg-team-03"],
    validFrom: "2026-11-10T14:20:00+07:00",
    validTo: null,
    recordedAt: "2026-11-10T14:22:00+07:00",
    supersedesId: "mem-dec-02-v0",
  },
  {
    id: "mem-dec-03",
    code: "DEC-03",
    teamId: "team-pbo-01",
    type: "decision",
    content: {
      title: "Constraint unik (poli_id, tanggal, nomor_urut) di PostgreSQL",
      summary:
        "Mencegah nomor antrean ganda saat dua loket mendaftarkan pasien secara bersamaan.",
      rationale:
        "Menjamin konsistensi data di level database daripada mengandalkan pengecekan race-condition di kode aplikasi.",
      rejectedAlternatives: ["Counter di state React", "Auto-increment global tanpa reset harian"],
      assigneeId: "user-budi",
      dueDate: "2026-11-30",
    },
    ownerId: "user-budi",
    scope: "team",
    sensitivity: "normal",
    status: "proposed",
    aiAssisted: true,
    provenance: "Usulan Team Agent dari pesan Budi (menunggu konfirmasi tim)",
    kcIds: ["kc-db"],
    sourceMessageIds: ["msg-team-05"],
    validFrom: "2026-11-18T19:00:00+07:00",
    validTo: null,
    recordedAt: "2026-11-18T19:01:00+07:00",
  },
]

export const SEED_MEMORY_EDGES: readonly MemoryEdge[] = [
  { id: "edge-1", src: "mem-dec-02", dst: "mem-dec-02-v0", kind: "supersedes" },
  { id: "edge-2", src: "mem-dec-02", dst: "mem-dec-01", kind: "depends_on" },
  { id: "edge-3", src: "mem-dec-03", dst: "mem-dec-01", kind: "depends_on" },
  { id: "edge-4", src: "mem-dec-01", dst: "kc-mvc", kind: "about_kc" },
  { id: "edge-5", src: "mem-dec-02", dst: "kc-jwt", kind: "about_kc" },
  { id: "edge-6", src: "mem-dec-03", dst: "kc-db", kind: "about_kc" },
]

export const SEED_TEAM_MESSAGES: readonly ChatMessage[] = [
  {
    id: "msg-team-01",
    teamId: "team-pbo-01",
    room: "team",
    authorId: "user-rani",
    authorName: "Rani Kusuma",
    isAgent: false,
    body: "Aku bagikan ringkasan pola arsitektur dari ruang pribadiku lewat Context Passport: sebaiknya kita pakai pola MVC agar modul terpisah rapi dan mudah dites.",
    createdAt: "2026-11-05T10:12:00+07:00",
    scope: "team",
  },
  {
    id: "msg-team-03",
    teamId: "team-pbo-01",
    room: "team",
    authorId: "user-dimas",
    authorName: "Dimas Pratama",
    isAgent: false,
    body: "Setuju MVC. Untuk modul login aku ambil ya: kita pakai JWT bukan session server karena nanti antrean mobile juga akses API yang sama, dan aku sudah pernah implementasi JWT.",
    createdAt: "2026-11-10T14:18:00+07:00",
    scope: "team",
  },
  {
    id: "msg-team-04",
    teamId: "team-pbo-01",
    room: "team",
    authorId: "agent-team",
    authorName: "Team Agent",
    isAgent: true,
    agentKind: "team",
    body: "Usulan Decision Record tercatat (DEC-02): Dimas menangani modul login memakai JWT (menggantikan draft Cookie Session). Alasan: stateless untuk klien web + mobile. Silakan konfirmasi jika disepakati tim.",
    createdAt: "2026-11-10T14:20:00+07:00",
    scope: "team",
    proposedMemoryId: "mem-dec-02",
    citations: [
      {
        id: "cit-1",
        label: "Pesan Dimas · 10 Nov",
        sourceMessageId: "msg-team-03",
        memoryItemId: "mem-dec-02",
        excerpt: "pakai JWT bukan session server karena nanti antrean mobile juga akses API yang sama",
      },
    ],
  },
  {
    id: "msg-team-05",
    teamId: "team-pbo-01",
    room: "team",
    authorId: "user-budi",
    authorName: "Budi Santoso",
    isAgent: false,
    body: "Di database antrean, aku usul kita pasang unique constraint (poli_id, tanggal, nomor_urut) di Postgres biar nggak bentrok kalau 2 loket daftar barengan.",
    createdAt: "2026-11-18T18:59:00+07:00",
    scope: "team",
  },
  {
    id: "msg-team-06",
    teamId: "team-pbo-01",
    room: "team",
    authorId: "agent-team",
    authorName: "Team Agent",
    isAgent: true,
    agentKind: "team",
    body: "Usulan baru (DEC-03) terdeteksi dari pesan Budi tentang constraint unik antrean. Menunggu konfirmasi tim sebelum masuk memori M2 terkonfirmasi.",
    createdAt: "2026-11-18T19:01:00+07:00",
    scope: "team",
    proposedMemoryId: "mem-dec-03",
    citations: [
      {
        id: "cit-2",
        label: "Pesan Budi · 18 Nov",
        sourceMessageId: "msg-team-05",
        memoryItemId: "mem-dec-03",
        excerpt: "unique constraint (poli_id, tanggal, nomor_urut) di Postgres",
      },
    ],
  },
]

export const SEED_PRIVATE_MESSAGES: readonly ChatMessage[] = [
  {
    id: "msg-priv-01",
    teamId: "team-pbo-01",
    room: "private",
    authorId: "user-rani",
    authorName: "Rani Kusuma",
    isAgent: false,
    body: "Bantu bandingkan MVC vs Clean Architecture untuk proyek PBO 4 minggu. Catatan pribadi: kalau dosen tanya nanti hubungi aku di 0812-3456-7890 atau rani@mahasiswa.itb.ac.id.",
    createdAt: "2026-11-05T09:50:00+07:00",
    scope: "private",
    taintedPrivate: true,
  },
  {
    id: "msg-priv-02",
    teamId: "team-pbo-01",
    room: "private",
    authorId: "agent-personal",
    authorName: "Personal Agent (Rani)",
    isAgent: true,
    agentKind: "personal",
    body: "Untuk durasi 4 minggu dengan 4 anggota, **MVC** paling pas: pemisahan Model-View-Controller cukup bersih untuk unit test tanpa boilerplate 5 lapis seperti Clean Architecture. Catatan ini berlabel `M1 PRIVATE`: gunakan **Context Passport** jika ingin membagikan ringkasannya ke tim (nomor HP dan email akan disamarkan otomatis).",
    createdAt: "2026-11-05T09:51:00+07:00",
    scope: "private",
    taintedPrivate: true,
  },
]

export const SEED_MASTERY: readonly MasteryRecord[] = [
  // KC-01 MVC (3/4 paham >= 0.70)
  { userId: "user-rani", kcId: "kc-mvc", pMastery: 0.92, lastEvidenceAt: "2026-11-15T10:00:00+07:00" },
  { userId: "user-dimas", kcId: "kc-mvc", pMastery: 0.81, lastEvidenceAt: "2026-11-15T11:00:00+07:00" },
  { userId: "user-budi", kcId: "kc-mvc", pMastery: 0.74, lastEvidenceAt: "2026-11-16T09:00:00+07:00" },
  { userId: "user-sari", kcId: "kc-mvc", pMastery: 0.35, lastEvidenceAt: "2026-11-18T08:00:00+07:00" },
  // KC-02 JWT (SILO: 1/4 paham >= 0.70 — hanya Dimas!)
  { userId: "user-rani", kcId: "kc-jwt", pMastery: 0.42, lastEvidenceAt: "2026-11-17T08:30:00+07:00" },
  { userId: "user-dimas", kcId: "kc-jwt", pMastery: 0.91, lastEvidenceAt: "2026-11-12T15:00:00+07:00" },
  { userId: "user-budi", kcId: "kc-jwt", pMastery: 0.31, lastEvidenceAt: "2026-11-14T16:00:00+07:00" },
  { userId: "user-sari", kcId: "kc-jwt", pMastery: 0.2, lastEvidenceAt: "2026-11-18T08:00:00+07:00" },
  // KC-03 DB (2/4 paham)
  { userId: "user-rani", kcId: "kc-db", pMastery: 0.72, lastEvidenceAt: "2026-11-17T10:00:00+07:00" },
  { userId: "user-dimas", kcId: "kc-db", pMastery: 0.58, lastEvidenceAt: "2026-11-16T10:00:00+07:00" },
  { userId: "user-budi", kcId: "kc-db", pMastery: 0.89, lastEvidenceAt: "2026-11-18T19:00:00+07:00" },
  { userId: "user-sari", kcId: "kc-db", pMastery: 0.25, lastEvidenceAt: "2026-11-18T08:00:00+07:00" },
  // KC-04 API (2/4 paham)
  { userId: "user-rani", kcId: "kc-api", pMastery: 0.78, lastEvidenceAt: "2026-11-16T14:00:00+07:00" },
  { userId: "user-dimas", kcId: "kc-api", pMastery: 0.76, lastEvidenceAt: "2026-11-16T14:00:00+07:00" },
  { userId: "user-budi", kcId: "kc-api", pMastery: 0.55, lastEvidenceAt: "2026-11-15T14:00:00+07:00" },
  { userId: "user-sari", kcId: "kc-api", pMastery: 0.45, lastEvidenceAt: "2026-11-18T08:00:00+07:00" },
]

export const SEED_QUESTIONS: readonly ExplainBackQuestion[] = [
  {
    id: "q-jwt-why",
    kcId: "kc-jwt",
    itemId: "mem-dec-02",
    decisionCode: "DEC-02",
    prompt:
      "Kenapa modul login tim kita memilih JWT (stateless) dibandingkan server-side session di RAM?",
    bloomLevel: "analyze",
    irtA: 1.35,
    irtB: 0.25,
    aiAssistedContext: true,
    estimatedSeconds: 90,
    rubricPoints: [
      "Menyebut sifat stateless sehingga server tidak menyimpan session di RAM",
      "Menghubungkan dengan kebutuhan akses klien web dan mobile secara bersamaan",
      "Menyebut konsekuensi / pengelolaan masa berlaku token (refresh token)",
    ],
    decisionAuthorId: "user-dimas",
  },
  {
    id: "q-mvc-whatif",
    kcId: "kc-mvc",
    itemId: "mem-dec-01",
    decisionCode: "DEC-01",
    prompt:
      "Bagaimana jika logika perhitungan urutan antrean ditaruh langsung di komponen View? Apa dampaknya terhadap pengujian tim?",
    bloomLevel: "evaluate",
    irtA: 1.15,
    irtB: -0.1,
    aiAssistedContext: false,
    estimatedSeconds: 75,
    rubricPoints: [
      "Unit test menjadi sulit karena terikat render UI",
      "Perubahan tampilan berisiko merusak aturan bisnis antrean",
    ],
    decisionAuthorId: "user-rani",
  },
  {
    id: "q-db-race",
    kcId: "kc-db",
    itemId: "mem-dec-03",
    decisionCode: "DEC-03",
    prompt:
      "Jelaskan alur apa yang dicegah oleh unique constraint (poli_id, tanggal, nomor_urut) ketika dua loket aktif bersamaan.",
    bloomLevel: "apply",
    irtA: 1.25,
    irtB: 0.4,
    aiAssistedContext: true,
    estimatedSeconds: 90,
    rubricPoints: [
      "Mencegah race condition / nomor antrean duplikat di hari dan poli yang sama",
      "Menjamin integritas langsung di lapisan database",
    ],
    decisionAuthorId: "user-budi",
  },
]

export const SEED_CHECK_ATTEMPTS: readonly CheckAttempt[] = [
  {
    id: "att-01",
    userId: "user-rani",
    questionId: "q-jwt-why",
    answer: "Karena Dimas sudah biasa pakai JWT agar cepat jadi.",
    inputMode: "text",
    grade: 1,
    gradeLabel: "sebagian",
    uncertainty: 0.12,
    abstained: false,
    gradedBy: "ai",
    feedback:
      "Tepat bahwa pengalaman tim menjadi pertimbangan, namun belum menjelaskan alasan arsitektural stateless untuk klien web + mobile.",
    createdAt: "2026-11-17T08:30:00+07:00",
  },
]

export const SEED_BRIEFING_STEPS: readonly BriefingStep[] = [
  {
    id: "brief-1",
    order: 1,
    kcId: "kc-mvc",
    decisionCode: "DEC-01",
    tutorPrompt:
      "Halo Sari! Selamat bergabung di Kelompok 4. Sebelum melihat kode, menurutmu kenapa tim memilih MVC dibanding menulis logika langsung di halaman tampilan?",
    hint: "Pikirkan soal kerja paralel 4 orang dan kemudahan unit testing.",
    expectedConcept: "Pemisahan Model-View-Controller memudahkan testing dan kerja paralel",
    completed: false,
  },
  {
    id: "brief-2",
    order: 2,
    kcId: "kc-jwt",
    decisionCode: "DEC-02",
    tutorPrompt:
      "Bagus! Nah, di DEC-02 tim mengganti Cookie Session ke JWT. Kalau nanti aplikasi antrean juga dipakai dari HP pasien, keunggulan apa yang diberikan JWT?",
    hint: "Bandingkan penyimpanan sesi di RAM server vs token mandiri di header.",
    expectedConcept: "Stateless token memudahkan konsumsi lintas klien web dan mobile",
    completed: false,
  },
]
