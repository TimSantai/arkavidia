# BERSAMA: Design System & UI Guidelines (`DESIGN.md`)

> **Tagline:** *Satu tim, semua paham.*
> **Aesthetic Direction:** Quiet, Tactile, Product-Forward Workspace (Hybrid Campsite + Linear Precision + Expressive Agent Stickers)
> **Theme Mode:** Dual-Mode (**Default: Light Mode**, Toggleable to Dark Mode via `.dark`)
> **Color Foundation:** Ramps Studio OKLCH Analogous Palette (`#3d7dff`, WCAG AA >= 4.5:1)
> **Typography (2 Voices Only):** `Allo` Variable (>= 20px Display/Hero/H1/H2/KPI) + `Geist Variable` (>= 12px UI/Body/Metadata)
> **Component Stack:** `shadcn/ui` + `@kibo-ui/*` + `@ai-elements/*` + `boopface` (`<AgentStickerAvatar />`) + `@icons-pack/react-simple-icons` + `react-icons` + Custom BERSAMA Primitives

---

## 1. Filosofi Desain

BERSAMA adalah ruang kerja pembelajaran kolaboratif mahasiswa (*One team, everyone understands*). Antarmuka harus terasa **tenang, hangat, taktil, dan jujur**, bukan dashboard analitik yang bising atau IDE dingin.

1. **4-Tier Chromatic Surface Ladder:** Kedalaman permukaan dibentuk melalui empat tingkat terang-gelap yang jelas (`well` -> `canvas` -> `surface` -> `surface-card` / `surface-top` / `surface-raised`) ditambah bayangan satu sisi (*single-edge shadows*) dan batas hairline tunggal, bukan tumpukan `ring-1` + `border` ganda.
2. **Room-Coded Chromatic Depth:**
   * **S2 Ruang Tim & Aksi Utama:** Cobalt (`--wash-brand`, `#1a51c4` / `#4784ff`).
   * **S3 Ruang Pribadi (M1) & Klaster Memori:** Cozy Violet (`--wash-violet`, `#7f51db` / `#9669f8`).
   * **S4 Project Brain, S6 Peta Pemahaman, S7 Tutored Briefing:** Fresh Cyan (`--wash-cyan`, `#006588` / `#0098ca`).
3. **2-Voice Typography Discipline:** Hanya gunakan `Allo` Variable (untuk display, hero, H1, H2, dan angka KPI utama `>= 20px`) dan `Geist Variable` (untuk seluruh body, kontrol UI, badge, timestamp, kode KC/DEC, dan metadata teknis dengan lantai ukuran `>= 12px`). **Dilarang** memakai `Geist Mono` atau `font-mono` di UI chrome.
4. **Anti-Bloat & Visual-First (Show, Don't Tell):** Utamakan visual workspace nyata, heatmap/gauge interaktif, dan kartu ringkas. Detail teknis sekunder (sitasi sumber, pasal UU PDP, kunci bitemporal DB) disimpan di balik tombol ikon `?` (`<Popover>`) agar kartu tetap bersih dan tenang.
5. **Human Portraits vs. Agent Stickers:** Anggota tim manusia selalu memakai foto potret realistis (`USER_AVATAR_MAP` via `<Avatar>`). Entitas AI (`Team Agent`, `Personal Agent`, `Socratic Tutor`) selalu memakai `<AgentStickerAvatar />` berbasis `boopface` di dalam kontainer stiker die-cut berbingkai putih taktil (`--shadow-sticker`).
6. **WCAG AA Compliance:** Semua pasangan teks dan latar wajib memenuhi rasio kontras `>= 4.5:1` (`>= 3.0:1` untuk teks display besar) di Light maupun Dark Mode. Pada permukaan Dark Mode terangkat (`--bg-surface-raised: #3d3f44`), gunakan `--text-secondary: #bec0c5` (5.79:1), bukan `#9fa2a7` (4.11:1).

---

## 2. Color System (Ramps Studio OKLCH + 4-Tier Surface Ladder)

Sumber dasar: `https://www.ramps.studio/?b=3d7dff&m=full&s=analogous&c=AA`

### 2.1 Raw Palette Ramps (50-950)

| Ramp | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **primary (Cobalt)** | `#f1f6ff` | `#e1ecff` | `#c6daff` | `#9fc1ff` | `#6ea0ff` | `#4784ff` | `#2d6ae7` | `#1a51c4` | `#0c3c9f` | `#042a7b` | `#001652` |
| **accent (Violet)** | `#f6f4ff` | `#ece8ff` | `#dbd2ff` | `#c4b3ff` | `#aa8aff` | `#9669f8` | `#7f51db` | `#673ab9` | `#502895` | `#3b1873` | `#25054f` |
| **accent-2 (Cyan)** | `#ebf8ff` | `#d4f0ff` | `#aae2ff` | `#73cdf8` | `#3dafe0` | `#0098ca` | `#007fa9` | `#006588` | `#004e6a` | `#00394e` | `#002230` |
| **neutral** | `#f4f6f9` | `#e9ebef` | `#d7d9dd` | `#bec0c5` | `#9fa2a7` | `#898b90` | `#717479` | `#5a5c60` | `#45474b` | `#323337` | `#1d1e21` |
| **success** | `#e1ffe6` | `#caf9d3` | `#a6edb5` | `#79d990` | `#44be69` | `#16a64f` | `#008b3f` | `#006f31` | `#005624` | `#003f19` | `#00260c` |
| **warning** | `#fff5e0` | `#fce9c2` | `#f1d69b` | `#e0bb6c` | `#c59b37` | `#af8400` | `#926e00` | `#755700` | `#5b4300` | `#423000` | `#281c00` |
| **error** | `#fff3f1` | `#ffe4e0` | `#ffcbc4` | `#ffa59a` | `#f77469` | `#e05950` | `#c3413a` | `#a22a27` | `#821918` | `#630b0c` | `#410002` |
| **info** | `#eef7ff` | `#dbeeff` | `#b8deff` | `#85c8ff` | `#3baaf9` | `#0192e3` | `#007abe` | `#006199` | `#004b78` | `#003659` | `#002037` |

### 2.2 4-Tier Surface Ladder

| Tier | Semantic Token | Light Hex | Dark Hex | Tailwind Utility | Peran |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Recessed)** | `--bg-well` | `#e9ebef` | `#141518` | `bg-well` | Relung sidebar, kolom tersembunyi, track kontrol |
| **Tier 2 (Canvas)** | `--bg-canvas` | `#eef0f4` | `#1d1e21` | `bg-canvas` / `bg-background` | Latar halaman utama workspace |
| **Tier 3 (Surface)** | `--bg-surface` | `#f4f6f9` | `#28292d` | `bg-surface` | Panel navigasi, header, area pendukung |
| **Tier 4A (Card/Top)** | `--bg-surface-card` / `--bg-surface-top` | `#ffffff` | `#323337` | `bg-surface-card` / `bg-surface-top` / `bg-card` | Kartu konten, tombol outline terangkat, composer |
| **Tier 4B (Raised)** | `--bg-surface-raised` | `#ffffff` | `#3d3f44` | `bg-surface-raised` / `bg-popover` | Popover, dropdown, dialog, floating bar (`shadow-raised`) |
| **Muted / Inverse** | `--bg-muted` / `--bg-inverse` | `#d7d9dd` / `#323337` | `#5a5c60` / `#e9ebef` | `bg-muted` / `bg-inverse` | Hover kontrol sekunder, badge netral, tooltip kontras tinggi |

### 2.3 Room-Coded Chromatic Washes & Borders

| Room / Domain | Wash Token | Light Value | Dark Value | Border Accent | Tailwind Utility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S2 Ruang Tim & Utama (Cobalt)** | `--wash-brand` | `rgb(26 81 196 / 0.08)` | `rgb(71 132 255 / 0.14)` | `#c6daff` / `rgb(71 132 255 / 0.34)` | `bg-wash-brand` |
| **S3 Ruang Pribadi M1 (Violet)** | `--wash-violet` | `rgb(127 81 219 / 0.09)` | `rgb(150 105 248 / 0.15)` | `#dbd2ff` / `rgb(150 105 248 / 0.36)` | `bg-wash-violet` |
| **S4/S6/S7 Brain & Tutor (Cyan)** | `--wash-cyan` | `rgb(0 101 136 / 0.08)` | `rgb(0 152 202 / 0.15)` | `#aae2ff` / `rgb(0 152 202 / 0.36)` | `bg-wash-cyan` |

### 2.4 Brand, Accent & Feedback Tokens

| Semantic Token | Light Hex | Dark Hex | Tailwind Utility | Peran |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-brand` | `#1a51c4` | `#4784ff` | `bg-brand` / `bg-primary` | CTA utama, konfirmasi memori M2, aksen Ruang Tim |
| `--bg-brand-hover` | `#0c3c9f` | `#6ea0ff` | `hover:bg-brand-hover` | Hover tombol utama |
| `--bg-brand-active` | `#042a7b` | `#9fc1ff` | `active:bg-brand-active` | Active/pressed state |
| `--bg-accent` | `#7f51db` | `#9669f8` | `bg-accent-violet` | Ruang Pribadi M1, node KC, overlay BKT |
| `--bg-tertiary` | `#006588` | `#0098ca` | `bg-tertiary` | Project Brain, Peta Pemahaman, Tutored Briefing, pairing |
| `--bg-success` / `-subtle` | `#006f31` / `#caf9d3` | `#16a64f` / `#003f19` | `bg-success` / `bg-success-subtle` | Paham ($P(L) >= \tau$), Decision Confirmed |
| `--bg-warning` / `-subtle` | `#af8400` / `#fce9c2` | `#c59b37` / `#423000` | `bg-warning` / `bg-warning-subtle` | Dibantu AI, Silo Alert, Conformal Abstention |
| `--bg-error` / `-subtle` | `#c3413a` / `#ffe4e0` | `#e05950` / `#630b0c` | `bg-error` / `bg-error-subtle` | Konflik keputusan, blokir IFC, PII sebelum masking |
| `--bg-info` / `-subtle` | `#006199` / `#dbeeff` | `#0192e3` / `#003659` | `bg-info` / `bg-info-subtle` | Delta digest, tip briefing |

### 2.5 Text & Foreground Pairs (WCAG AA >= 4.5:1 Verified)

| Semantic Token | Light Hex | Dark Hex | Verifikasi Kontras | Catatan Pemakaian |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` | `#323337` | `#e9ebef` | `12.62` (on `#fff`) / `8.83` (on `#3d3f44`) | Teks utama di semua tier |
| `--text-secondary` | `#45474b` | `#bec0c5` | `9.31` (on `#fff`) / `5.79` (on `#3d3f44`) | **Wajib** dipakai di atas `#3d3f44` (`--bg-surface-raised`) untuk teks pendukung |
| `--text-tertiary` | `#5a5c60` | `#9fa2a7` | `6.70` (on `#fff`) / `4.93` (on `#323337`) | Caption pada canvas/surface/card; jangan dipakai di atas `#3d3f44` |
| `--text-disabled` | `#9fa2a7` | `#717479` | N/A | Khusus kontrol `disabled` |
| `--text-link` | `#1a51c4` | `#9fc1ff` | `6.96` (on `#fff`) / `5.79` (on `#3d3f44`) | Tautan & teks interaktif Cobalt |
| `--text-accent-violet` | `#673ab9` | `#c4b3ff` | `6.39` (on `#eef0f4`) / `5.64` (on `#3d3f44`) | Teks/label Violet Ruang Pribadi (lulus AA di canvas & raised) |
| `--text-cyan` | `#006588` | `#73cdf8` | `6.53` (on `#fff`) / `5.93` (on `#3d3f44`) | Teks/label Cyan Project Brain & Tutor |
| `--text-on-brand` | `#f1f6ff` | `#001652` | `6.42` / `4.86` | Teks di atas `bg-brand` |
| `--text-on-accent` | `#f6f4ff` | `#25054f` | `4.71` / `4.68` | Teks di atas `bg-accent-violet` |
| `--text-on-tertiary` | `#ebf8ff` | `#002230` | `6.03` / `4.99` | Teks di atas `bg-tertiary` |
| `--text-on-warning` | `#281c00` | `#281c00` | `4.87` / `6.46` | Gelap di kedua mode |

---

## 3. Tipografi 2-Voice (`Allo` >= 20px + `Geist Variable` >= 12px)

* **Display & Hero Voice (`--font-heading`):** `'Allo', 'Geist Variable', -apple-system, BlinkMacSystemFont, sans-serif` (via `allo-font`).
  * **Batas ukuran wajib `>= 20px`:** hanya dipakai untuk Display, Hero, H1, H2, dan angka KPI utama (`.kpi-hero`).
  * **Optical Sizing & Roundness:** Terapkan `font-optical-sizing: auto` dan `font-variation-settings: "opsz" 32, "ROND" 75` melalui class `.font-display` dan `.kpi-hero` (yang juga menyertakan `font-variant-numeric: tabular-nums`).
  * **Focal Oblique Accent:** Gunakan `.font-display-oblique` (`font-style: italic`) hanya untuk 1-2 kata penekanan di hero/display dengan file `Allo-*Oblique.woff2` bawaan `allo-font`.
* **UI, Body & Metadata Voice (`--font-sans`):** `'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (via `@fontsource-variable/geist`).
  * **Lantai ukuran `>= 12px`:** Dilarang menggunakan `text-[10px]` atau `text-[11px]`. Ukuran minimum di seluruh aplikasi adalah `text-xs` (`12px`).
  * Dipakai untuk seluruh teks tubuh, navigasi, tombol, badge (`M1 PRIVATE`, `M2 TEAM`, `DEC-14`, `KC-01`), timestamp, rumus, dan shortcut.
  * **Mobile Input Rule:** Semua `<input>` dan `<textarea>` di UI mobile wajib menggunakan `text-base sm:text-sm` (`16px` di layar kecil) untuk mencegah auto-zoom iOS Safari.
* **NO Geist Mono:** `@fontsource-variable/geist-mono` dan class `font-mono` dilarang keras di UI chrome.

| Role | Font Class | Size Floor | Weight | Line Height | Pemakaian |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `display` | `.font-display` | `32px` - `56px` | `600` | `1.08` - `1.14` | Hero landing, judul utama onboarding |
| `kpi-hero` | `.kpi-hero` | `24px` - `40px` | `600` | `1.10` | Angka metrik utama (`tabular-nums`) |
| `h1` | `.font-display` | `24px` - `30px` | `600` | `1.20` | Judul halaman workspace |
| `h2` | `.font-display` | `20px` - `24px` | `600` | `1.28` | Judul section & panel utama |
| `h3` / `card-title` | `font-sans` | `15px` - `18px` | `600` | `1.35` | Judul kartu, sub-bagian, dialog |
| `body` | `font-sans` | `14px` - `15px` | `400` | `1.55` | Chat, alasan keputusan, deskripsi |
| `ui-label` / `badge` | `font-sans` | `12px` - `13px` | `500` | `1.35` | Nav item, tombol, badge `M1`/`M2`/`DEC`, timestamp |

---

## 4. Single-Edge Shadows, Borders & Elevation

Jangan pernah menggabungkan `ring-1` dan `border` pada komponen yang sama. Gunakan batas hairline tunggal + satu token shadow dari daftar ini:

* `--shadow-control`: Tombol `outline` terangkat di atas `--bg-surface-top`, segmen kontrol, input pill.
* `--shadow-card` (alias kompatibel `--shadow-surface`): Kartu konten (`<Card>`), panel sidebar, bubble terstruktur.
* `--shadow-raised`: Elemen melayang (`<Popover>`, `<DropdownMenu>`, `<Dialog>`, floating composer, tooltip).
* `--shadow-primary`: Tombol CTA Cobalt (`bg-brand`) dengan glow tepi bawah halus.
* `--shadow-badge`: Badge status dan pill penanda ruang.
* `--shadow-sticker`: Kontainer stiker `<AgentStickerAvatar />` berbingkai putih taktil (`2.5px` white border + drop shadow lembut).
* **Dark Mode Ambient Borders:** Di `.dark`, kartu dan permukaan terangkat memakai highlight tepi atas tipis (`border-white/[0.08]`) atau wash border berwarna per ruang agar pemisahan layer tetap tegas tanpa shadow berat.

---

## 5. Anti-Bloat, Visual-First & Popover `?` Pattern

1. **Maksimum informasi inti di permukaan:** Kartu keputusan, node pemahaman, dan kartu briefing menampilkan judul, status visual, pemilik/avatar, dan satu ringkasan inti.
2. **Pola `?` Popover (`<Popover>`):** Metadata teknis sekunder (referensi pasal UU PDP, ID pesan rujukan mentah, hash/versi bitemporal database, rumus BKT/IRT) **wajib** disembunyikan di balik tombol `<button>` ikon `?` (`HelpCircle`) atau `Info` yang membuka `<PopoverContent>` ketika diklik/fokus.
3. **Human Portraits vs. Agent Stickers:**
   * Manusia (Rani, Dimas, Budi, Sari) -> `<Avatar>` dengan foto potret `USER_AVATAR_MAP`.
   * AI Agent (`team`, `private`, `tutor`) -> `<AgentStickerAvatar role="..." state="..." />` (`boopface` web component di dalam die-cut sticker badge).

---

## 6. Never-Ship Governance Gate (WAJIB DIPERIKSA SEBELUM MERGE)

Setiap PR atau perubahan frontend BERSAMA **diblokir** jika melanggar salah satu aturan berikut:

1. **ZERO `Geist Mono` / `font-mono`:** Tidak ada `@fontsource-variable/geist-mono` dan tidak ada utility `font-mono` di UI chrome.
2. **ZERO `Allo` < 20px:** Class `font-heading`, `font-display`, atau `kpi-hero` tidak boleh dipasangkan dengan ukuran di bawah `20px` (`text-xl`).
3. **ZERO Text < 12px:** Tidak ada `text-[10px]`, `text-[11px]`, atau ukuran font `< 12px` di mana pun.
4. **ZERO `transition-all`:** Selalu sebutkan properti transisi secara eksplisit (mis. `transition-[background-color,border-color,color,transform,box-shadow]`).
5. **ZERO `Sparkles` Icon & Decorative Emojis:** Dilarang memakai ikon `Sparkles` dari `lucide-react` dan dilarang menaruh emoji dekoratif di label/judul/badge UI.
6. **ZERO UI Em-Dashes (`—`):** Di teks antarmuka pengguna (label, tombol, subtitle, placeholder, toast, empty state), gunakan titik dua `:`, koma `,`, atau middot `·`.
7. **ZERO Clickable `<div>` / `<span>`:** Seluruh elemen interaktif wajib memakai `<button>`, `<a href>`, `<Link>`, atau `<NavLink>` dengan `focus-visible` ring yang jelas.
8. **WCAG AA >= 4.5:1 & `prefers-reduced-motion`:** Semua pasangan warna lulus `contrast-check.py` dan seluruh animasi (termasuk `boopface`) menghormati `prefers-reduced-motion: reduce`.
