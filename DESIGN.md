# BERSAMA — Design System & UI Guidelines (`DESIGN.md`)

> **Tagline:** *Satu tim, semua paham.*  
> **Aesthetic Direction:** Quiet, Tactile, Product-Forward Workspace (Hybrid Campsite + team-brain.com + Linear Precision)  
> **Theme Mode:** Dual-Mode (**Default: Light Mode**, Toggleable to Dark Mode via `.dark`)  
> **Color Foundation:** Ramps Studio OKLCH Analogous Palette (`#3d7dff`, WCAG AA $\ge 4.5:1$)  
> **Typography:** `Allo` (Display & Headings) + `Geist Variable` (Body, Subtext & UI) + `Geist Mono Variable` (Technical Metadata)  
> **Component Stack:** `shadcn/ui` + `@kibo-ui/*` + `@ai-elements/*` + `@icons-pack/react-simple-icons` + `react-icons` + Custom BERSAMA Primitives

---

## 1. Filosofi Desain

BERSAMA adalah ruang kerja pembelajaran kolaboratif mahasiswa (*One team, everyone understands*). Desain antarmuka harus terasa **tenang, hangat, terstruktur, dan jujur**, bukan seperti dashboard analitik yang bising atau IDE dingin.

1. **Quiet Chat, Expressive Data:** Ruang diskusi (Ruang Tim, Ruang Pribadi, dan Project Brain) dipertahankan **hampir monokrom dengan aksen Primary Blue** agar mahasiswa fokus pada argumen dan keputusan. Aksen kromatik kaya (**Violet** & **Cyan**) dialokasikan khusus untuk **Peta Pemahaman Tim** dan **Knowledge Bus Factor**.
2. **Tactile & Layered:** Permukaan dipisahkan melalui hierarki kanvas $\rightarrow$ surface $\rightarrow$ raised surface. Di Light Mode, `bg-surface` dan `bg-surface-raised` bernilai sama (`#f4f6f9`), sehingga elemen melayang (*dropdown, popover, tooltip, floating modal*) **wajib** memakai `shadow-raised` agar tetap terbaca terangkat.
3. **Zero-Friction Privacy Signalling:** Perbedaan **M1 (Personal Memory)** dan **M2 (Team Memory / Project Brain)** harus jelas secara struktural melalui ikon kunci, batas hairline, dan badge monospace (`M1 PRIVATE` vs `M2 TEAM`), bukan lewat warna neon yang agresif.
4. **WCAG AA Compliance:** Semua pasangan foreground/background berasal langsung dari kurva OKLCH Ramps Studio. **Jangan pernah** mengganti warna pasangan token secara manual agar rasio kontras $\ge 4.5:1$ tetap terjaga di Light maupun Dark Mode.
5. **Product-Forward & Visual-First (Show, Don't Tell):** Utamakan mockup workspace nyata lebar penuh, foto profil anggota realistis, diagram/heatmap visual, dan slider interaktif alih-alih dinding teks. Biarkan produk berbicara terlebih dahulu sebelum salinan penjelasan singkat.

---

## 2. Color System (Ramps Studio — OKLCH Verbatim)

Sumber: `https://www.ramps.studio/?b=3d7dff&m=full&s=analogous&c=AA`  
*(Catatan teknis: Input `#3d7dff` dipetakan ke kurva lightness OKLCH sehingga langkah terdekat adalah `primary-500` `#4784ff`. Gunakan nilai hex ramp di bawah secara eksak.)*

### 2.1 Raw Palette Ramps (50–950)

| Ramp | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **primary** | `#f1f6ff` | `#e1ecff` | `#c6daff` | `#9fc1ff` | `#6ea0ff` | `#4784ff` | `#2d6ae7` | `#1a51c4` | `#0c3c9f` | `#042a7b` | `#001652` |
| **accent** | `#f6f4ff` | `#ece8ff` | `#dbd2ff` | `#c4b3ff` | `#aa8aff` | `#9669f8` | `#7f51db` | `#673ab9` | `#502895` | `#3b1873` | `#25054f` |
| **accent-2** | `#ebf8ff` | `#d4f0ff` | `#aae2ff` | `#73cdf8` | `#3dafe0` | `#0098ca` | `#007fa9` | `#006588` | `#004e6a` | `#00394e` | `#002230` |
| **neutral** | `#f4f6f9` | `#e9ebef` | `#d7d9dd` | `#bec0c5` | `#9fa2a7` | `#898b90` | `#717479` | `#5a5c60` | `#45474b` | `#323337` | `#1d1e21` |
| **success** | `#e1ffe6` | `#caf9d3` | `#a6edb5` | `#79d990` | `#44be69` | `#16a64f` | `#008b3f` | `#006f31` | `#005624` | `#003f19` | `#00260c` |
| **warning** | `#fff5e0` | `#fce9c2` | `#f1d69b` | `#e0bb6c` | `#c59b37` | `#af8400` | `#926e00` | `#755700` | `#5b4300` | `#423000` | `#281c00` |
| **error** | `#fff3f1` | `#ffe4e0` | `#ffcbc4` | `#ffa59a` | `#f77469` | `#e05950` | `#c3413a` | `#a22a27` | `#821918` | `#630b0c` | `#410002` |
| **info** | `#eef7ff` | `#dbeeff` | `#b8deff` | `#85c8ff` | `#3baaf9` | `#0192e3` | `#007abe` | `#006199` | `#004b78` | `#003659` | `#002037` |

### 2.2 Semantic Tokens (Light & Dark Mapping)

Gunakan token semantik di bawah ini (melalui CSS custom properties atau utility Tailwind di `src/index.css`) alih-alih angka ramp mentah:

#### Surfaces & Neutrals
| Semantic Token | Light Hex | Dark Hex | Tailwind Utility | Peran |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#e9ebef` | `#1d1e21` | `bg-canvas` / `bg-background` | Latar belakang halaman utama |
| `--bg-surface` | `#f4f6f9` | `#323337` | `bg-surface` / `bg-card` | Card, sidebar, panel pesan |
| `--bg-surface-raised` | `#f4f6f9` | `#45474b` | `bg-surface-raised` / `bg-popover` | Dropdown, popover, dialog *(gunakan `shadow-raised` di Light Mode)* |
| `--bg-muted` | `#d7d9dd` | `#5a5c60` | `bg-muted` / `bg-secondary` | Hover baris tabel, tombol sekunder, chip netral |
| `--bg-inverse` | `#323337` | `#e9ebef` | `bg-inverse` | Tooltip & toast kontras tinggi |

#### Brand, Accent & Graph Colors
| Semantic Token | Light Hex | Dark Hex | Tailwind Utility | Peran di BERSAMA |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-brand` | `#1a51c4` | `#4784ff` | `bg-brand` / `bg-primary` | CTA utama, konfirmasi memori M2, nav aktif |
| `--bg-brand-hover` | `#0c3c9f` | `#6ea0ff` | `hover:bg-brand-hover` | Hover tombol utama |
| `--bg-brand-active` | `#042a7b` | `#9fc1ff` | `active:bg-brand-active` | Active/pressed state tombol utama |
| `--bg-accent` | `#7f51db` | `#9669f8` | `bg-accent-violet` | **Khusus Grafik/Peta Pemahaman:** Node KC & overlay BKT |
| `--bg-accent-hover` | `#673ab9` | `#aa8aff` | `hover:bg-accent-violet-hover` | Hover elemen grafik Violet |
| `--bg-accent-active` | `#502895` | `#c4b3ff` | `active:bg-accent-violet-active` | Active elemen grafik Violet |
| `--bg-tertiary` | `#006588` | `#0098ca` | `bg-tertiary` | **Khusus Grafik/Peta Pemahaman:** Jalur pairing & coverage |
| `--bg-tertiary-hover` | `#004e6a` | `#3dafe0` | `hover:bg-tertiary-hover` | Hover elemen grafik Cyan |

#### Feedback & Status Surfaces
| Semantic Token | Light Hex | Dark Hex | Tailwind Utility | Peran di BERSAMA |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-success` | `#006f31` | `#16a64f` | `bg-success` | Badge paham ($P(L) \ge \tau$) & Decision Confirmed |
| `--bg-success-subtle` | `#caf9d3` | `#003f19` | `bg-success-subtle` | Banner konfirmasi sukses |
| `--bg-warning` | `#af8400` | `#c59b37` | `bg-warning` | Badge *"Dibantu AI"*, Silo Alert, Conformal Abstention |
| `--bg-warning-subtle` | `#fce9c2` | `#423000` | `bg-warning-subtle` | Banner peringatan Bus Factor / batas waktu |
| `--bg-error` | `#c3413a` | `#e05950` | `bg-error` / `bg-destructive` | Aksi destruktif, konflik keputusan, blokir IFC |
| `--bg-error-subtle` | `#ffe4e0` | `#630b0c` | `bg-error-subtle` | Banner error / temuan PII sensitif sebelum masking |
| `--bg-info` | `#006199` | `#0192e3` | `bg-info` | Badge informasi / Tutored Briefing prompt |
| `--bg-info-subtle` | `#dbeeff` | `#003659` | `bg-info-subtle` | Banner delta digest & tips |

#### Text & Foreground Pairs (Terjamin WCAG AA $\ge 4.5:1$)
| Semantic Token | Light Hex | Dark Hex | Contrast (L / D) | Paired Against |
| :--- | :--- | :--- | :---: | :--- |
| `--text-primary` | `#323337` | `#e9ebef` | `10.57` / `13.96` | `bg-canvas`, `bg-surface` |
| `--text-secondary` | `#45474b` | `#bec0c5` | `7.80` / `9.16` | `bg-canvas`, `bg-surface` |
| `--text-tertiary` | `#5a5c60` | `#9fa2a7` | `5.61` / `6.51` | `bg-canvas` *(Gunakan ini untuk teks sekunder/caption yang harus terbaca, BUKAN `--text-disabled`)* |
| `--text-disabled` | `#9fa2a7` | `#717479` | `2.15` / `3.55` | Hanya untuk kontrol non-aktif (*disabled*) |
| `--text-link` | `#1a51c4` | `#6ea0ff` | `5.83` / `6.46` | `bg-canvas` |
| `--text-on-brand` | `#f1f6ff` | `#001652` | `6.42` / `4.86` | `bg-brand` |
| `--text-on-accent` | `#f6f4ff` | `#25054f` | `4.71` / `4.68` | `bg-accent` |
| `--text-on-tertiary` | `#ebf8ff` | `#002230` | `6.03` / `4.99` | `bg-tertiary` |
| `--text-on-success` | `#e1ffe6` | `#00260c` | `5.92` / `5.15` | `bg-success` |
| `--text-on-warning` | `#281c00` | `#281c00` | `4.87` / `6.46` | `bg-warning` *(Gelap di kedua mode!)* |
| `--text-on-error` | `#fff3f1` | `#410002` | `4.67` / `4.66` | `bg-error` |
| `--text-on-info` | `#eef7ff` | `#002037` | `6.12` / `4.93` | `bg-info` |
| `--text-success` | `#006f31` | `#44be69` | `5.30` / `7.00` | `bg-canvas` |
| `--text-warning` | `#755700` | `#c59b37` | `5.64` / `6.44` | `bg-canvas` |
| `--text-error` | `#a22a27` | `#f77469` | `6.07` / `6.08` | `bg-canvas` |
| `--text-info` | `#006199` | `#3baaf9` | `5.55` / `6.59` | `bg-canvas` |
| `--text-inverse` | `#f4f6f9` | `#323337` | `11.65` / `10.57` | `bg-inverse` |

#### Borders & Focus Ring
| Semantic Token | Light Hex | Dark Hex | Peran |
| :--- | :--- | :--- | :--- |
| `--border-subtle` | `#d7d9dd` | `#45474b` | Garis pemisah antar baris / kartu standar |
| `--border-default` | `#bec0c5` | `#5a5c60` | Outline input form & kontrol interaktif |
| `--border-strong` | `#9fa2a7` | `#717479` | Batas kartu berprioritas tinggi |
| `--border-active` | `#2d6ae7` | `#4784ff` | Tab terpilih, item aktif |
| `--border-error` | `#e05950` | `#e05950` | Outline input tidak valid / konflik |
| `--ring-focus` | `#4784ff` | `#6ea0ff` | Focus ring keyboard (`focus-visible`) |

---

## 3. Aturan Penggunaan Warna di Domain BERSAMA

1. **Ruang Tim & Ruang Pribadi (Chat):**
   * Gunakan warna netral (`bg-canvas`, `bg-surface`, `border-line-subtle`) sebagai dominan.
   * **Ruang Pribadi (M1):** Dibedakan dengan permukaan `bg-surface` + header strip/badge monospace `M1 PRIVATE` dan ikon gembok (`text-ink-tertiary`), **bukan** warna latar mencolok.
   * **Context Passport Preview:** Gunakan `bg-warning-subtle` / `border-error` hanya untuk menyorot entitas PII yang berhasil disamarkan sebelum dikirim ke M2.
   * **Aksi Konfirmasi (`Propose -> Confirm`):** Gunakan `bg-brand` (`text-on-brand`).
2. **Project Brain (Decision Record):**
   * Item `proposed`: Badge outline `border-line-strong` + label monospace.
   * Item `confirmed`: Indikator `text-success` / `bg-success-subtle`.
   * Item `conflicts_with`: Highlight `bg-error-subtle` + `text-error`.
   * Item bertanda *"dibantu AI"*: Pill `bg-warning-subtle` + `text-warning`.
3. **Peta Pemahaman Tim & Bus Factor (Visualisasi):**
   * Area **satu-satunya** tempat **Violet (`bg-accent-violet`)** dan **Cyan (`bg-tertiary`)** dipakai secara ekspresif (bersama `chart-1..5`) untuk membedakan klaster Knowledge Component (KC), kontribusi anggota, dan grafik coverage submodular.

---

## 4. Tipografi & Skala (Allo + Geist Variable + Geist Mono — Hybrid Campsite + Linear)

* **Display & Heading Font (`--font-heading`):** `'Allo', 'Geist Variable', -apple-system, BlinkMacSystemFont, sans-serif` (via `allo-font`) — khusus judul display, hero, heading halaman, dan judul kartu.
* **Primary UI, Body & Subtext Font (`--font-sans`):** `'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (via `@fontsource-variable/geist`) — digunakan untuk seluruh paragraf, subtext, eyebrow, caption, label navigasi, dan tombol agar terbaca menyatu dan bersih.
* **Monospace Metadata Font (`--font-mono`):** `'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (via `@fontsource-variable/geist-mono`) — digunakan **khusus** untuk metadata teknis: ID keputusan (`DEC-14`), kode KC (`KC-01`), versi bitemporal (`as_of`), angka probabilitas ($P(L)=0.82$), tag `M1`/`M2`, URL path, rumus, dan keyboard shortcut (`⌘K`). **Jangan** memakai `font-mono` untuk subtext prosa atau eyebrow biasa.
* **Prinsip Bobot:** Ikuti disiplin Linear/Campsite — hindari penggunaan `font-bold` (`700`) berlebihan. Gunakan **400 (Regular)** untuk teks tubuh, **500 (Medium)** untuk label UI & subheading, dan **600 (Semibold)** untuk judul utama & tombol aksi.

| Role | Font Token | Size | Weight | Line Height | Letter Spacing | Pemakaian |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `display` | `font-heading` | `36px`–`56px` | `600` | `1.08`–`1.15` | `-0.03em` | Hero / onboarding judul utama |
| `h1` | `font-heading` | `28px` (`1.75rem`) | `600` | `1.22` | `-0.022em` | Judul halaman workspace |
| `h2` | `font-heading` | `20px`–`30px` | `600` | `1.30` | `-0.018em` | Judul panel / section card |
| `h3` | `font-heading` | `16px` (`1rem`) | `500`–`600` | `1.40` | `-0.011em` | Judul kartu keputusan / modul |
| `body` | `font-sans` | `14px`–`16px` | `400` | `1.55` | `-0.008em` | Pesan chat, deskripsi alasan, esai |
| `ui-label` | `font-sans` | `12px`–`13px` | `500` | `1.35` | `0em` | Item sidebar, tab, eyebrow, tombol |
| `caption` | `font-sans` | `11px`–`12px` | `400`–`500` | `1.35` | `0em` | Subtext anggota, timestamp, helper |
| `mono-tag` | `font-mono` | `10px`–`12px` | `500`–`600` | `1.20` | `+0.02em` | Decision ID, kode KC, status tag, rumus, shortcut |

---

## 5. Layout, Spacing, Radius & Elevasi (Tactile Rules)

* **Grid Dasar:** Kelipatan `4px` (`gap-2` = 8px, `gap-3` = 12px, `gap-4` = 16px, `p-4` / `p-5` pada card).
* **Border Radius:**
  * Kontrol kompak & tombol: `8px` (`rounded-lg`, `--radius-md`)
  * Card & panel workspace: `12px` (`rounded-xl`, `--radius-lg`)
  * Status badge, tag KC, avatar group: `9999px` (`rounded-full`)
* **Borders & Elevation:**
  * Kartu standar di atas `bg-canvas`: `bg-surface border border-line-subtle` + `shadow-surface`.
  * Permukaan melayang (`DropdownMenu`, `Popover`, `Tooltip`, `CommandDialog`): `bg-surface-raised border border-line-subtle shadow-raised` *(wajib menggunakan `shadow-raised` karena nilai hex `#f4f6f9` di Light Mode sama dengan `bg-surface`)*.
* **Motion:** Cepat dan tenang (`150ms cubic-bezier(0.2, 0.8, 0.2, 1)`), hindari animasi memantul berlebihan.

---

## 6. Strategi & Katalog Komponen

### 6.1 Base Primitives (`shadcn/ui` + `@kibo-ui/*`)
Selalu cek dan pasang komponen dari `@kibo-ui/*` terlebih dahulu sebelum membuat komponen baru:
* **Kolaborasi & Identitas:** `@kibo-ui/avatar-stack` *(terpasang)* (anggota tim & pemilik pemahaman KC), `@kibo-ui/pill` *(terpasang)*, `@kibo-ui/status` *(terpasang)* (status konfirmasi & sinkronisasi), `@kibo-ui/cursor` *(terpasang)* (indikator kolaborasi ruang aktif).
* **Manajemen Keputusan & Proyek:** `@kibo-ui/list`, `@kibo-ui/table`, `@kibo-ui/gantt` *(terpasang)*, `@kibo-ui/tags` *(terpasang)* (label KC), `@kibo-ui/tree` (struktur dependensi modul).
* **Input & Evaluasi:** `@kibo-ui/choicebox` (pemilihan opsi Explain-back / onboarding), `@kibo-ui/dropzone` (import log chat/WhatsApp), `@kibo-ui/code-block` & `@kibo-ui/snippet` (cuplikan kode di Project Brain), `@kibo-ui/comparison` *(terpasang)* (slider visual Before/After).
* **Utilitas:** `@kibo-ui/theme-switcher` *(terpasang)* (Light/Dark toggle), `@kibo-ui/announcement` *(terpasang)*, `@kibo-ui/dialog-stack`.

### 6.2 Komponen AI (`@ai-elements/*` — Penerus Komponen AI Kibo UI)
Komponen AI dari pencipta Kibo UI kini dikelola resmi di registry **AI Elements** (`npx shadcn@latest add @ai-elements/<name>`):
* `@ai-elements/conversation` & `@ai-elements/message`: Alur percakapan Team Agent dan Personal Agent.
* `@ai-elements/prompt-input`: Composer chat dengan indikator ruang (`Team` vs `Private`) serta lampiran konteks.
* `@ai-elements/reasoning` & `@ai-elements/sources`: Menampilkan rujukan pesan sumber (*citations*) dan alasan penarikan kesimpulan dari Project Brain.

### 6.3 Komponen Kustom BERSAMA *(Dibuat Mandiri Jika Tidak Ada di Registry)*
Jika suatu komponen tidak tersedia di `@kibo-ui` maupun `@ai-elements`, bangun komponen kustom di `src/components/bersama/` dengan aturan:
1. Wajib membungkus primitif `Card` / `Button` / `Dialog` dari `src/components/ui/` agar mewarisi token WCAG AA.
2. Komponen kustom yang dipetakan untuk BERSAMA:
   * **Knowledge Coverage Matrix & Bus Factor Gauge:** Heatmap penguasaan per `(anggota, KC)` memakai palet `chart-1..5` (`brand`, `accent-violet`, `tertiary`).
   * **Context Passport PII Diff Drawer:** Tampilan berdampingan sebelum/sesudah penyamaran PII (highlighting pakai `bg-warning-subtle` / `bg-error-subtle`).
   * **Explain-Back Check Modal:** Timer ringan 5 menit, input teks / voice note waveform, serta tampilan status *Conformal Abstention* (*"Diteruskan ke penulis keputusan untuk peer explanation"*).

### 6.4 Ikonografi & Logo Brand
* **UI Icons:** Gunakan `lucide-react` secara konsisten untuk seluruh ikon kontrol, navigasi, dan status.
* **Official Brand Logos:** Wajib mengambil logo resmi pihak ketiga dari `@icons-pack/react-simple-icons` (plus `react-icons/ri` untuk `RiOpenaiFill` karena penghapusan slug OpenAI di Simple Icons) — **dilarang** menggambar SVG ikon brand generik manual.
  * Brand monokrom gelap (`OpenAI`, `Notion`, `GitHub`) wajib memakai `color="currentColor"` (mewarisi `text-ink-primary`) agar tetap kontras di Dark Mode.
  * Brand berwarna (`Claude`, `Gemini`, `WhatsApp`, `PostgreSQL`, `Supabase`, `FastAPI`) gunakan `color="default"` dengan warna resmi masing-masing brand.
