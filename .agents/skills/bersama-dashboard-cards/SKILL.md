---
name: bersama-dashboard-cards
description: Aturan dan proses untuk membuat, merombak, atau mereview kartu (card) di dashboard & halaman aplikasi BERSAMA supaya tidak terlihat generik / "AI slop". Gunakan saat membuat atau mengubah kartu tugas, kartu statistik, daftar keputusan, kartu sorotan (chart/donut), tile kesehatan tim, atau empty state; saat user bilang kartunya "slop", "generik", "template", "kayak AI", "flat", "ramai"; atau saat mereview PR yang menyentuh komponen kartu di src/features/**. Triggers: card, kartu, dashboard, beranda, stat tile, metric card, task card, anti slop, generic UI.
metadata:
  origin: project
  project: BERSAMA (arkavidia)
---

# Kartu dashboard BERSAMA yang tidak "AI slop"

Kartu yang bagus **menjawab satu pertanyaan pengguna** dan terlihat seperti dibuat untuk produk ini saja. Kartu slop adalah wadah seragam (ikon dalam lingkaran + judul + deskripsi + "Lihat detail") yang bisa dipindah ke produk mana pun tanpa ada yang sadar.

Skill ini melengkapi `DESIGN.md`, `LANDING.md`, dan `CONTEXT.md`. Kalau bertentangan, privasi & etika di `CONTEXT.md` §4.2 & §8.1 selalu menang.

## Sikap kerja

- **Konten dulu, wadah belakangan.** Tentukan isi dan pertanyaannya sebelum memilih bentuk kartu. Banyak hal tidak butuh kartu sama sekali.
- **Hapus sebelum menambah.** Border, shadow, ikon, eyebrow, badge berulang, dan gradien hampir selalu bisa dibuang.
- **Satu aturan berlaku global.** Kalau satu kartu diperbaiki karena aturan X, cek semua kartu sejenis di halaman itu.
- **Jangan pernah data palsu.** Tidak ada angka karangan, sparkline tanpa data, atau lorem ipsum. Kalau data belum ada, desain empty state-nya.
- **Perubahan terkecil yang menyelesaikan masalah.** Jangan merombak halaman kalau masalahnya satu kartu.

## Langkah 1: Deteksi slop

Periksa setiap kartu dengan daftar ini. Satu temuan = harus diperbaiki.

| # | Tanda slop | Contoh di BERSAMA |
| --- | --- | --- |
| S1 | Grid kartu berukuran sama berisi ikon-dalam-kotak + judul + deskripsi | 3 kartu tugas identik hanya beda warna |
| S2 | Ikon garis (lucide) diperbesar > 24px dipakai sebagai "ilustrasi" | ikon clipboard 64px miring di header kartu |
| S3 | Border + shadow + bayangan "pressed" sekaligus di semua kartu | setiap chip dan kartu punya `shadow-[0_3px_0_0_…]` |
| S4 | Badge/label yang sama persis berulang di tiap kartu | "Tenggat Jum" di 3 kartu |
| S5 | Angka telanjang tanpa satuan, rentang waktu, atau pembanding | "12" saja |
| S6 | Judul terpotong di tengah kata | "Jelaskan ulang DEC-02: Modu…" |
| S7 | CTA generik yang sama di semua kartu | "Lihat detail", "Mulai" tanpa objek |
| S8 | Eyebrow UPPERCASE bertracking lebar di atas setiap judul | `OVERVIEW`, `STATISTICS` |
| S9 | Dekorasi tanpa makna: gradien ungu-biru, glow, glassmorphism, border bergradien di kartu | |
| S10 | Semua kartu sama berat, tidak ada yang jadi fokus | 6 kartu putih sama besar |
| S11 | Warna dipilih acak, bukan karena makna | kartu biru/kuning/merah bergantian |
| S12 | Avatar/profil besar di tengah kartu tanpa fungsi | kartu profil dengan foto 88px |
| S13 | Tes tukar: kalau judul & ikon diganti produk lain dan kartunya tetap masuk akal, kartu itu terlalu generik | |

## Langkah 2: Tentukan jenis kartu

Setiap kartu harus masuk ke **salah satu** jenis berikut. Tulis pertanyaan yang dijawabnya sebagai komentar di atas komponen:

```tsx
// Q: "Apa satu hal yang harus aku kerjakan berikutnya untuk DEC-02?"
```

| Jenis | Pertanyaan yang dijawab | Contoh | Bentuk |
| --- | --- | --- | --- |
| **Aksi** | "Apa yang harus aku lakukan sekarang?" | Explain-back, pairing, tinjau usulan | Kartu pastel, 1 aksi spesifik |
| **Daftar** | "Apa saja yang berubah / perlu dipahami?" | Keputusan yang menyangkut tugasmu | **Satu** kartu berisi baris, bukan kartu per item |
| **Metrik** | "Seberapa jauh aku/tim?" | Keputusan dikonfirmasi, explain-back lulus | Beberapa angka dalam **satu** kartu, dipisah garis |
| **Sorotan** | "Bagaimana kondisiku secara keseluruhan?" | Pemahamanmu (donut) | Maks. **1 per halaman**, boleh ilustrasi & gradien lembut |
| **Status** | "Apakah ada yang berisiko?" | Coverage tim, bus factor | Tile tinted kecil + 1 link |
| **Kosong** | "Kenapa belum ada apa-apa, dan apa langkahnya?" | Belum ada keputusan | Ikon kecil, 1 kalimat, 1 aksi |

Kalau sebuah kartu tidak cocok dengan jenis mana pun, kemungkinan besar ia tidak perlu ada. Gabungkan atau hapus.

**Bukan kartu:** satu angka yang bisa jadi teks di header, daftar link navigasi, atau dua item yang lebih baik jadi baris.

## Langkah 3: Terapkan aturan

### Permukaan (pilih SATU per kartu)
| Jenis permukaan | Light | Dark | Untuk |
| --- | --- | --- | --- |
| Plain | `bg-white border border-[#eef0f3]` | `bg-surface border border-line-subtle` | Daftar, Metrik |
| Tinted | `bg-[#f6f7f9]` (tanpa border) | `bg-surface` | Status, grup, panel samping |
| Pastel | isian makna (tabel warna), tanpa border | token `-subtle` | Aksi, Sorotan |

- Border **atau** shadow, tidak pernah keduanya. Shadow hanya untuk dialog, popover, drawer.
- Tanpa bayangan "pressed" pada kartu. Hover kartu yang bisa diklik: ganti isian satu tingkat (mis. `hover:bg-[#f1f3f6]`), **tanpa** `translateY` / lift.
- Radius konsentris: kartu luar `rounded-3xl` (24px), elemen di dalamnya `rounded-2xl` (16px), kontrol `rounded-full`. Radius dalam = radius luar − padding.

### Warna punya makna, bukan dekorasi
| Makna | Light fill | Teks/ikon | Dark |
| --- | --- | --- | --- |
| Keputusan / Project Brain | `#f1f6ff` | `#1a51c4` | `bg-info-subtle text-text-info` |
| Explain-back / perlu dicek | `#fef8ec` | `#755700` | `bg-warning-subtle text-text-warning` |
| Sudah paham / lulus | `#effcf2` | `#006f31` | `bg-success-subtle text-text-success` |
| Pairing / silo | `#fff4f2` | `#a22a27` | `bg-error-subtle text-text-error` |

- Maks. 4 warna pastel per halaman, masing-masing hanya untuk maknanya.
- **Violet & cyan dilarang** di dashboard (khusus Peta Pemahaman, `DESIGN.md` §3).
- Satu elemen hitam `#1d1e21` per tampilan untuk aksi terpenting. Biru brand hanya untuk link, highlight teks, dan focus ring.
- Pastel coral tidak boleh bersebelahan dengan kata "Gagal" / "Error".

### Hierarki di dalam kartu
- **Satu elemen dominan** per kartu: angka besar **atau** judul, bukan keduanya sama besar.
- Skala: dominan (Geist 600 28–36px atau Allo 500), judul 15–16px 600, meta 13px `text-ink-tertiary`, label 11–12px.
- Maks. 3 tingkat teks dalam satu kartu.
- Label di atas angka cukup sentence case 12px. Tidak ada eyebrow UPPERCASE kecuali ID mono (`DEC-14`, `KC-02`).

### Angka yang jujur
- Setiap angka punya **satuan + rentang waktu atau pembanding**: "5 explain-back lulus · minggu ini", "2/4 anggota paham", "71% coverage tim".
- Progres pakai pecahan yang bisa dicek (`2/4`) sebelum persen.
- Chart hanya jika datanya nyata. Donut: stroke ≤ 10px, `strokeLinecap="round"`, celah 4° antar segmen, angka ringkasan di tengah.

### Ilustrasi
- Ikon UI ≤ 20px: `lucide-react`.
- Ilustrasi (72–96px): **Fluent Emoji 3D** yang disimpan lokal di `src/assets/illustrations/` (lisensi MIT, atribusi di `LICENSE`). `alt=""`, `drop-shadow-[0_8px_16px_rgb(29_30_33/0.12)]`, tanpa rotasi.
- Ilustrasi hanya di kartu **Aksi** dan **Sorotan**. Maks. 1 ilustrasi per kartu.
- **Dilarang** memperbesar ikon lucide sebagai ilustrasi, emoji di dalam teks, atau gambar stok.

### Copy
- CTA = kata kerja + objek: "Mulai 3 pertanyaan", "Jadwalkan dengan Dimas", "Tinjau DEC-03". Bukan "Lihat detail" / "Mulai".
- Judul ≤ 2 baris: `line-clamp-2` + atribut `title`. Kalau masih terpotong, **persingkat copy** di sumber data, jangan perkecil font.
- Info yang sama di semua kartu (mis. tenggat yang sama) dinaikkan ke judul section: "Tugas minggu ini · tenggat Jumat".

### Privasi & etika (tidak bisa ditawar)
- Skor pemahaman individu hanya milik user login, dengan label `Lock` "Hanya kamu yang melihat ini".
- Skor individu anggota lain **tidak pernah** tampil. Untuk orang lain hanya "siapa yang paham KC ini" (framing positif) atau agregat tim.
- **Dilarang:** poin, badge, sertifikat, streak, leaderboard, peringkat antar anggota.
- Kartu yang memuat data M1 menampilkan badge `M1 PRIVATE`.

## Langkah 4: Resep kelas

```tsx
// Kartu Aksi (pastel)
<article className="relative flex flex-col gap-3 rounded-3xl bg-[#fef8ec] p-5 dark:bg-warning-subtle">
  <div className="flex items-center justify-between text-xs">
    <span className="font-medium text-[#755700] dark:text-text-warning">Explain-back</span>
    <span className="rounded-full bg-white/70 px-2 py-0.5 font-mono text-[11px] text-ink-secondary">KC-02</span>
  </div>
  <img src={mic} alt="" className="absolute right-5 top-10 size-20 drop-shadow-[0_8px_16px_rgb(29_30_33/0.12)]" />
  <p className="font-sans text-4xl font-semibold tracking-[-0.02em] text-ink-primary">0/3</p>
  <h3 className="line-clamp-2 max-w-[70%] text-[15px] font-semibold text-ink-primary" title={title}>{title}</h3>
  <p className="text-[13px] text-ink-tertiary">≤ 5 menit · dibantu AI</p>
  <Link to={to} className="mt-auto text-sm font-medium text-ink-primary hover:underline">Mulai 3 pertanyaan →</Link>
</article>

// Kartu Daftar (plain, baris di dalam satu kartu)
<section className="rounded-3xl border border-[#eef0f3] bg-white dark:border-line-subtle dark:bg-surface">
  <header className="flex items-center justify-between px-5 pt-5 pb-3">…</header>
  <ul className="divide-y divide-[#f1f2f4] dark:divide-line-subtle">
    <li className="flex min-w-0 items-center gap-4 px-5 py-3">…</li>
  </ul>
</section>

// Kartu Metrik (beberapa angka, satu kartu)
<div className="grid grid-cols-3 divide-x divide-[#eef0f3] rounded-3xl border border-[#eef0f3] bg-white py-4 dark:divide-line-subtle dark:border-line-subtle dark:bg-surface">
  <div className="px-4">
    <p className="text-2xl font-semibold tabular-nums">12</p>
    <p className="text-xs text-ink-tertiary">keputusan dikonfirmasi · semester ini</p>
  </div>
</div>

// Tile Status (tinted)
<div className="flex flex-col gap-1 rounded-2xl bg-[#f6f7f9] p-4 dark:bg-surface">
  <p className="text-xs text-ink-tertiary">Coverage tim · agregat</p>
  <p className="text-2xl font-semibold tabular-nums">71%</p>
  <Link className="text-[13px] text-ink-link">Lihat peta →</Link>
</div>
```

## Langkah 5: Verifikasi sebelum selesai

Jalankan semua tes ini di 1280px dan 375px, light & dark:

- [ ] **Tes pertanyaan:** setiap kartu punya komentar `// Q:` dan isinya benar-benar menjawab pertanyaan itu.
- [ ] **Tes juling** (lihat layar dengan mata disipitkan): ada **satu** titik fokus per halaman (kartu Sorotan atau aksi utama), bukan grid rata.
- [ ] **Tes hapus border:** hilangkan border semua kartu Plain. Kalau hierarki masih terbaca dari isian warna & tipografi, sudah benar.
- [ ] **Tes tukar** (S13): kartu tidak bisa dipindah ke produk lain tanpa kehilangan makna.
- [ ] Tidak ada temuan S1–S12 yang tersisa.
- [ ] Tidak ada teks terpotong di tengah kata, dan tidak ada scroll horizontal.
- [ ] Setiap angka punya satuan + konteks.
- [ ] Aturan privasi & larangan gamifikasi terpenuhi.
- [ ] `prefers-reduced-motion` dihormati (count-up, draw chart).
- [ ] `npm run build` & `npx eslint <folder yang diubah>` lulus 0 error.

Laporkan hasil dalam format singkat:

```
Kartu diubah: <n>
Slop ditemukan → diperbaiki: S2 ×3, S4 ×1, S6 ×2, …
Kartu dihapus/digabung: <daftar + alasan>
Sisa yang perlu keputusan manusia: <daftar>
```
