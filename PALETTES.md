# BERSAMA — Dashboard Color & Surface Palette (`PALETTES.md`)

> **Untuk:** Referensi cepat warna, surface, border, shadow, dan status dashboard workspace BERSAMA (`src/components/layout/**` & `src/features/**`).
> **Sumber Token:** [`arkavidia-frontend/src/index.css`](arkavidia-frontend/src/index.css) · Ramps Studio (`#3d7dff`, analogous, WCAG AA >= 4.5:1).
> **Aturan Utama:** Semua token sudah terdaftar di `@theme inline` — gunakan **Tailwind utility class** atau **CSS variable** di bawah ini, jangan hardcode hex mentah untuk UI chrome.

---

## 1. Aturan Emas Warna Dashboard (Max 3 Peran UI Chrome)

Agar seluruh ruang dashboard (**Ruang Tim**, **Ruang Pribadi**, **Project Brain**, **Peta Pemahaman**, **Explain-Back**, **Tutored Briefing**) terasa menyatu sebagai satu produk:

1. **Netral 4-Tier (Dominan ~85% layar):** Latar, kartu, panel, border, dan teks primer/sekunder.
2. **Satu Aksen Brand Terpadu: Cobalt Blue (~10%):** Navigasi aktif, tombol utama (CTA), tautan, fokus, dan panel highlight (`bg-brand`, `bg-wash-brand`, `border-brand-subtle`, `text-ink-link`). **Jangan** membedakan warna tema UI chrome per halaman (tidak ada sidebar/button ungu untuk Ruang Pribadi atau cyan untuk Project Brain).
3. **Status Semantik Fungsional (~5%):** Hijau (*Paham / Confirmed*), Kuning (*Silo / Dibantu AI / Abstain*), Merah (*IFC Blocked / Konflik / PII*), Biru Info (*Digest / Tip*) — khusus untuk status nyata, bukan dekorasi.

> **Di mana warna ekspresif (Violet, Cyan, Amber, multi-warna) boleh dipakai?**  
> Khusus di **karakter AI `<AgentStickerAvatar />` (`boopface`)**, **grafik / heatmap (`--chart-*`)**, dan **ilustrasi / foto**.

---

## 2. 4-Tier Surface Ladder (Depth & Layering)

Gunakan tangga elevasi dari paling cekung (`Tier 1`) ke paling tinggi (`Tier 4B`) agar hierarki layar terasa tanpa perlu border tebal:

| Tier | Peran Dashboard | Light Hex | Dark Hex | CSS Variable | Tailwind Class |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Tier 1 · Well** | Relung sidebar kiri (`AppShell`), track segmented control, area resesif | `#e9ebef` | `#141518` | `--bg-well` | `bg-well` |
| **Tier 2 · Canvas** | Latar dasar halaman workspace utama | `#eef0f4` | `#1d1e21` | `--bg-canvas` | `bg-canvas` / `bg-background` |
| **Tier 3 · Surface** | Header topbar, sub-panel sekunder, grup list di dalam kartu | `#f4f6f9` | `#28292d` | `--bg-surface` | `bg-surface` |
| **Tier 4A · Card / Top** | Kartu konten (`<Card>`), tombol `outline` terangkat, input composer | `#ffffff` | `#323337` | `--bg-surface-card` / `--bg-surface-top` | `bg-surface-card` / `bg-surface-top` |
| **Tier 4B · Raised** | `<Popover>`, `<Dialog>`, `<DropdownMenu>`, `<SelectContent>`, mobile drawer | `#ffffff` | `#3d3f44` | `--bg-surface-raised` | `bg-surface-raised` / `bg-popover` |
| **Muted** | Track progress bar, hover kontrol netral, pill abu | `#d7d9dd` | `#5a5c60` | `--bg-muted` | `bg-muted` |
| **Inverse** | Tooltip gelap (Light) / terang (Dark), backdrop scrim (`bg-inverse/40`) | `#323337` | `#e9ebef` | `--bg-inverse` | `bg-inverse` |

---

## 3. Brand Accent & Chromatic Wash (Cobalt Blue)

| Peran | Light Hex / Value | Dark Hex / Value | CSS Variable | Tailwind Class |
| :--- | :---: | :---: | :--- | :--- |
| **Primary CTA / Active Nav** | `#1a51c4` | `#4784ff` | `--bg-brand` | `bg-brand` / `bg-primary` |
| **Primary Hover** | `#0c3c9f` | `#6ea0ff` | `--bg-brand-hover` | `hover:bg-brand-hover` |
| **Primary Active / Pressed** | `#042a7b` | `#9fc1ff` | `--bg-brand-active` | `active:bg-brand-active` |
| **Teks di atas `bg-brand`** | `#f1f6ff` | `#001652` | `--text-on-brand` | `text-on-brand` |
| **Soft Tint Wash (highlight card/banner)** | `rgb(26 81 196 / 0.08)` | `rgb(71 132 255 / 0.14)` | `--wash-brand` | `bg-wash-brand` |
| **Border untuk `bg-wash-brand`** | `#c6daff` | `rgb(71 132 255 / 0.34)` | `--border-brand-subtle` | `border-brand-subtle` |
| **Tautan / Aksen Teks Interaktif** | `#1a51c4` | `#9fc1ff` | `--text-link` | `text-ink-link` |
| **Focus Ring** | `#4784ff` | `#6ea0ff` | `--ring-focus` | `outline-ring` / `ring-ring` |

---

## 4. Text & Foreground Tokens (WCAG AA >= 4.5:1)

| Peran | Light Hex | Dark Hex | Rasio Kontras Terverifikasi | Tailwind Class | Catatan Penting |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Primary Ink** | `#323337` | `#e9ebef` | `12.62` (Light) · `8.83` (Dark raised) | `text-ink-primary` | Judul, body utama, label aktif |
| **Secondary Ink** | `#45474b` | `#bec0c5` | `9.31` (Light) · `5.79` (Dark `#3d3f44`) | `text-ink-secondary` | **Wajib** dipakai untuk teks sekunder di dalam overlay gelap (`bg-surface-raised`) |
| **Tertiary Ink** | `#5a5c60` | `#9fa2a7` | `6.70` (Light) · `4.93` (Dark `#323337`) | `text-ink-tertiary` | Metadata/timestamp di atas canvas & card. **Jangan** dipakai di atas `bg-surface-raised` (`#3d3f44`, turun ke `4.11:1`) |
| **Disabled Ink** | `#9fa2a7` | `#717479` | N/A | `text-ink-disabled` | Khusus state `disabled` |
| **Link / Brand Ink** | `#1a51c4` | `#9fc1ff` | `6.96` (Light) · `5.79` (Dark raised) | `text-ink-link` | Tautan, badge aktif Cobalt, ikon aksen |
| **Inverse Ink** | `#f4f6f9` | `#323337` | `12.1` | `text-on-inverse` | Teks di atas `bg-inverse` |

---

## 5. Status Semantik (Khusus Indikator State Nyata)

| Status | Pemakaian di Dashboard | Solid BG | Subtle BG | Teks di Subtle BG | Teks di Solid BG |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Success (Emerald)** | Paham ($P(L) \ge 0.70$), `CONFIRMED`, lulus Explain-Back | `bg-success` (`#006f31` / `#16a64f`) | `bg-success-subtle` (`#caf9d3` / `#003f19`) | `text-text-success` (`#006f31` / `#44be69`) | `text-on-success` (`#e1ffe6` / `#00260c`) |
| **Warning (Amber)** | Silo / Bus Factor <= 1, `Dibantu AI`, Conformal Abstain, `PROPOSED` | `bg-warning` (`#af8400` / `#c59b37`) | `bg-warning-subtle` (`#fce9c2` / `#423000`) | `text-text-warning` (`#755700` / `#c59b37`) | `text-on-warning` (`#281c00` di kedua mode) |
| **Error (Coral)** | Blokir IFC (M1 -> M2), konflik keputusan, PII terdeteksi | `bg-error` (`#c3413a` / `#e05950`) | `bg-error-subtle` (`#ffe4e0` / `#630b0c`) | `text-text-error` (`#a22a27` / `#f77469`) | `text-on-error` (`#fff3f1` / `#410002`) |
| **Info (Sky)** | Delta digest, tip Socratic, catatan sistem | `bg-info` (`#006199` / `#0192e3`) | `bg-info-subtle` (`#dbeeff` / `#003659`) | `text-text-info` (`#006199` / `#3baaf9`) | `text-on-info` (`#eef7ff` / `#002037`) |

---

## 6. Border & Single-Edge Shadow

**Aturan Single-Edge Depth:** Jangan pernah menumpuk `ring-1` dan `border` pada elemen yang sama. Jika memakai `<DialogContent>` (bawaan shadcn memiliki `ring-1`), selalu tambahkan `ring-0` saat memberi `border border-line-subtle`.

### Border Utilities
| Tailwind Class | Light Hex | Dark Hex | Pemakaian |
| :--- | :---: | :---: | :--- |
| `border-line-subtle` | `#d7d9dd` | `#45474b` | Hairline default kartu, divider, sidebar |
| `border-line-default` | `#bec0c5` | `#5a5c60` | Tombol `outline`, input, hover state kartu |
| `border-line-strong` | `#9fa2a7` | `#717479` | Pemisah tegas / border aktif sekunder |
| `border-line-active` | `#2d6ae7` | `#4784ff` | Kartu/tab terpilih, fokus input |
| `border-line-error` | `#e05950` | `#e05950` | Validasi error, kartu blokir IFC |
| `border-brand-subtle` | `#c6daff` | `rgb(71 132 255 / 0.34)` | Pasangan `bg-wash-brand` |

### Shadow Utilities
| Tailwind Class | Pemakaian |
| :--- | :--- |
| `shadow-control` | Tombol `outline` terangkat, input pill, segmen kontrol |
| `shadow-card` | `<Card>`, panel sidebar, bubble chat terstruktur |
| `shadow-raised` | `<Popover>`, `<Dialog>`, `<DropdownMenu>`, floating bar |
| `shadow-primary` | Tombol CTA `bg-brand` & item navigasi aktif |
| `shadow-badge` | Badge status & pill ringkas |

---

## 7. Data Visualization & Grafik (`--chart-1` s.d. `--chart-5`)

Gunakan urutan ini untuk chart, gauge, dan heatmap di **Peta Pemahaman** / **Project Brain**:

| Token | Warna | Light Hex | Dark Hex | Pemakaian Disarankan |
| :--- | :--- | :---: | :---: | :--- |
| `--chart-1` / `bg-chart-1` | Cobalt | `#1a51c4` | `#4784ff` | Seri utama, coverage tim |
| `--chart-2` / `bg-chart-2` | Violet | `#7f51db` | `#9669f8` | Overlay BKT / seri kedua |
| `--chart-3` / `bg-chart-3` | Cyan | `#006588` | `#0098ca` | Seri ketiga / pairing delta |
| `--chart-4` / `bg-chart-4` | Emerald | `#006f31` | `#16a64f` | Target tercapai / paham |
| `--chart-5` / `bg-chart-5` | Amber | `#af8400` | `#c59b37` | Ambang risiko / silo |

---

## 8. Warna Karakter AI BoopFace (`agentConfig.ts`)

Karakter AI memakai `<AgentStickerAvatar />` (**tanpa outline & tanpa background kotak**) dengan warna ekspresif per peran:

| Role (`role="..."`) | Nama | Warna Default | Warna Mata | Konteks |
| :--- | :--- | :---: | :---: | :--- |
| `team` | Team Agent | `#2d6ae7` (Cobalt) | `#f1f6ff` | Ruang Tim (`M2`), Project Brain |
| `private` | Personal Agent | `#7f51db` (Cozy Violet) | `#f6f4ff` | Ruang Pribadi (`M1`), Context Passport |
| `tutor` | Socratic Tutor | `#007fa9` (Fresh Cyan) | `#ebf8ff` | Peta Pemahaman, Explain-Back, Tutored Briefing |

**Swatch Kustomisasi Tersedia:** Cobalt `#2d6ae7`, Deep Cobalt `#1a51c4`, Cozy Violet `#7f51db`, Fresh Cyan `#007fa9`, Emerald `#16a64f`, Graphite `#323337`.

---

## 9. Raw Color Ramps (50–950, Ramps Studio)

Untuk kebutuhan SVG / ilustrasi custom di dashboard agar tetap harmonis dengan sistem warna:

| Ramp | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cobalt (Primary)** | `#f1f6ff` | `#e1ecff` | `#c6daff` | `#9fc1ff` | `#6ea0ff` | `#4784ff` | `#2d6ae7` | `#1a51c4` | `#0c3c9f` | `#042a7b` | `#001652` |
| **Violet (Chart/AI)** | `#f6f4ff` | `#ece8ff` | `#dbd2ff` | `#c4b3ff` | `#aa8aff` | `#9669f8` | `#7f51db` | `#673ab9` | `#502895` | `#3b1873` | `#25054f` |
| **Cyan (Chart/AI)** | `#ebf8ff` | `#d4f0ff` | `#aae2ff` | `#73cdf8` | `#3dafe0` | `#0098ca` | `#007fa9` | `#006588` | `#004e6a` | `#00394e` | `#002230` |
| **Neutral** | `#f4f6f9` | `#e9ebef` | `#d7d9dd` | `#bec0c5` | `#9fa2a7` | `#898b90` | `#717479` | `#5a5c60` | `#45474b` | `#323337` | `#1d1e21` |
| **Success (Emerald)** | `#e1ffe6` | `#caf9d3` | `#a6edb5` | `#79d990` | `#44be69` | `#16a64f` | `#008b3f` | `#006f31` | `#005624` | `#003f19` | `#00260c` |
| **Warning (Amber)** | `#fff5e0` | `#fce9c2` | `#f1d69b` | `#e0bb6c` | `#c59b37` | `#af8400` | `#926e00` | `#755700` | `#5b4300` | `#423000` | `#281c00` |
| **Error (Coral)** | `#fff3f1` | `#ffe4e0` | `#ffcbc4` | `#ffa59a` | `#f77469` | `#e05950` | `#c3413a` | `#a22a27` | `#821918` | `#630b0c` | `#410002` |
| **Info (Sky)** | `#eef7ff` | `#dbeeff` | `#b8deff` | `#85c8ff` | `#3baaf9` | `#0192e3` | `#007abe` | `#006199` | `#004b78` | `#003659` | `#002037` |

---

## 10. Resep Copy-Paste Cepat untuk Komponen Dashboard

```tsx
// 1. Kartu dashboard standar (Tier 4A, single-edge)
<div className="rounded-2xl border border-line-subtle bg-surface-card p-5 shadow-card" />

// 2. Highlight banner / kartu aksen Cobalt (terpadu semua ruang)
<div className="rounded-2xl border border-brand-subtle bg-wash-brand p-5 shadow-card" />

// 3. Item navigasi sidebar aktif (konsisten di semua ruang)
<NavLink className="rounded-lg bg-brand px-2.5 py-2 text-[13px] font-medium text-on-brand shadow-primary" />

// 4. Popover / Dialog overlay (Tier 4B, wajib ring-0 + text-ink-secondary di dark mode)
<DialogContent className="border border-line-subtle bg-surface-raised ring-0 shadow-raised">
  <p className="text-sm text-ink-secondary">Teks pendukung selalu >= 5.79:1 di dark mode.</p>
</DialogContent>

// 5. Status pill (floor minimal text-xs = 12px, tanpa font-mono)
<span className="rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-text-success">Paham</span>
<span className="rounded-full bg-warning-subtle px-2.5 py-0.5 text-xs font-medium text-text-warning">1 Silo</span>
<span className="rounded-full bg-error-subtle px-2.5 py-0.5 text-xs font-medium text-text-error">Diblokir IFC</span>
```

### Checklist Cepat Anti-Regresi
- Tidak ada `font-mono` di UI chrome (pakai `font-sans tabular-nums` + lantai ukuran `>= 12px` / `text-xs`).
- Tidak ada `transition-all` (tulis properti transisi eksplisit, mis. `transition-[background-color,border-color,color]`).
- Tidak ada `text-ink-tertiary` di atas `bg-surface-raised` (`#3d3f44`) — gunakan `text-ink-secondary`.
- Tidak ada double border (`ring-1` + `border`).
- Tidak ada warna ungu/cyan pada tombol utama, header halaman, atau sidebar nav — gunakan `bg-brand` / `bg-wash-brand` / `text-ink-link`.
