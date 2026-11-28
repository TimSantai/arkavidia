# BERSAMA · Backend & AI (SPIKE pra-Hacking Day)

> **PERINGATAN ATURAN.** Kode di folder ini dibuat pada 25 November 2026, **sebelum** Hacking Day Hackvidia 11.0 (29–31 Januari 2027). Guidebook halaman cetak 13, butir 1a: *"Produk fungsional harus dikembangkan hanya selama sesi hacking day berlangsung (tidak diperkenankan membawa progres yang telah dikembangkan sebelum sesi dimulai)."* Karena itu kode ini **tidak boleh** disalin, di-*push*, atau dijadikan dasar repositori final yang diundang ke akun GitHub panitia. Fungsinya hanya untuk belajar dan memvalidasi desain di `../docs/blueprint/`. Risiko diskualifikasi bila aturan ini dilanggar ditanggung tim.

## Isi

Backend FastAPI + worker AI asinkron di atas satu Postgres (Supabase), mengikuti blueprint `docs/blueprint/01–07` dan skema DBML tim dengan perbaikan dari `07-review-dbml.md`.

| Bagian | Lokasi | Catatan |
| :--- | :--- | :--- |
| Skema + RLS (IFC lapis 1) | `supabase/migrations/20261125000000_init.sql` | DBML + perbaikan A1–A7, B, C. Tabel internal tertutup bagi klien |
| Shim Supabase lokal | `supabase/local/00_supabase_shim.sql` | Role `anon/authenticated/service_role`, `auth.users`, `auth.uid()`. **Jangan** dijalankan di Supabase cloud |
| API & Fitur Domain | `app/main.py`, `app/features/` | Vertical slice per fitur (`agents`, `brain`, `checks`, `credits`, `health`, `messages`, `passport`, `teams`, `common`). 29 path, error RFC 9457 (`app/errors/`), `x-request-id`, idempotensi. Kontrak: `docs/openapi.json` |
| Konfigurasi & DB | `app/config/` | `Settings` (`settings.py`) dan akses Postgres dengan RLS (`db.py`) |
| Autentikasi | `app/features/auth/` | Supabase OAuth start/callback, JWT verification, profile sync, and `Principal` dependency |
| Logging | `app/log/` | Konfigurasi `structlog` (`logger.py`) |
| Policy IFC lapis 2 | `app/policy/` | Otorisasi per item sebelum LLM, aturan data tier Free, taint dari isi bundle (`ifc.py`) |
| Retrieval | `app/retrieval/` | FTS `indonesian` + pgvector HNSW, RRF k=60, ekspansi graf 1-hop, as-of bitemporal (`hybrid.py`) |
| LLM gateway | `app/gateway/` | Fallback antar-provider, validasi JSON schema + 1 kali perbaikan, kuota harian, metering `llm_calls`, pre-authorization kredit Pro, mode `DEMO_REPLAY` |
| Modul AI murni | `app/ai/` | Ekstraksi + verifier grounding, PII, IRT 2PL (EAP), BKT dengan forgetting, grader self-consistency + conformal risk control, coverage, bus factor eksak, Gini, pairing eksak |
| Worker | `app/worker/` | Antrean Postgres `FOR UPDATE SKIP LOCKED`, backoff 1/4/16 detik, job macet dikembalikan setelah 5 menit (`runner.py`) |
| Ledger kredit | `app/billing/` | Mode simulasi. hold −H → release +H → charge −P (bersih −P) (`ledger.py`) |

## Menjalankan secara lokal

Prasyarat: Python 3.12+, [uv](https://docs.astral.sh/uv/), Docker (untuk Postgres + pgvector).

```bash
cd backend-spike
uv venv && source .venv/bin/activate          # Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"                     # tambah ".[llm]" untuk provider nyata
cp .env.example .env
docker compose -f docker-compose.local.yml up -d   # Postgres 16 + pgvector, migrasi otomatis

python -m scripts.seed_demo                    # data demo + token JWT tiap anggota
uvicorn app.main:_default_app --factory --reload --port 8000   # API, Swagger di /docs
python -m app.worker                           # terminal kedua: worker AI
```

Dengan `LLM_BACKEND=fake` semuanya berjalan tanpa API key dan tanpa internet. Provider palsu memakai heuristik deterministik, jadi kualitas jawabannya **bukan** ukuran kualitas AI.

Ke Supabase cloud: jalankan hanya migrasi kanonik `supabase/migrations/20261125000000_init.sql` (mis. `supabase db push`), isi `DATABASE_URL`, Supabase OAuth/JWT variables seperti di `docs/auth.md`, lalu set `LLM_BACKEND=litellm` beserta nama model dan kunci API. `Arkavidia.sql` adalah export/reference, bukan migrasi runtime lengkap.

## Tes

```bash
pytest tests/unit                                   # 38 tes, tanpa database
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:54329/postgres pytest tests/integration
ruff check .
```

Tes integrasi membuat database `bersama_test_<acak>` baru, menerapkan shim + migrasi, menjalankan API dan worker dengan provider palsu, lalu menghapus database. Hasil terakhir (25 Nov 2026, Postgres 16.x + pgvector 0.6.0, Python 3.12.3): **38 tes unit dan 40 tes integrasi lolos**, ruff bersih.

Tes integrasi mencakup siklus penuh (pesan → usulan berbukti → konfirmasi → KC + soal → explain-back → BKT → peta pemahaman), abstain ke penilai sebaya, edit dengan supersede dan query as-of, agent dengan sitasi, Context Passport, pre-authorization kredit, penghapusan akun yang mempertahankan memori tim, serta **30 skenario kebocoran** (`tests/integration/test_leaks.py`, 10 kategori × 3 sesuai blueprint 04 bagian 9) dengan 0 kebocoran.

## Batas yang perlu diketahui

1. **Adapter LiteLLM belum diuji terhadap API sungguhan** karena tidak ada kunci API di lingkungan pengembangan. Bentuk panggilan `litellm.acompletion` dan `aembedding` mengikuti dokumentasi yang saya kenal [STRONG], tetapi tetap harus diuji.
2. **Perilaku Supabase belum diuji di cloud.** `SET LOCAL ROLE authenticated` + `request.jwt.claims` diuji pada shim lokal, bukan pada proyek Supabase. Realtime juga belum diuji, karena tes hanya memeriksa RLS yang dipakai Realtime.
3. **IRT tidak terkalibrasi** (a = 1, b dari Bloom). **Conformal aktif hanya bila ada ≥ 100 pasangan nilai AI dan nilai manusia** (`CONFORMAL_MIN_N`). Sebelum itu, ambang abstain bersifat heuristik. Jangan mengklaim jaminan statistik di pitch.
4. Parameter BKT, bobot w_j, ambang dedupe 0,85, dan τ = 0,7 adalah nilai awal, bukan hasil fitting.
5. Embedding `hashing` hanya untuk tes. Ganti dengan model multilingual sungguhan dan sesuaikan `vector(768)` bila dimensinya berbeda.
6. Pada tier Free, embedding query pertanyaan pengguna tetap dikirim ke provider embedding. Ini perlu dicek terhadap ketentuan provider yang dipilih.
7. Tidak ada rate limit per IP dan tidak ada SSE streaming.
8. `docker-compose.local.yml` dan `Dockerfile` belum dijalankan, karena Docker tidak tersedia di lingkungan pengembangan saya. Tes di atas memakai Postgres 16 yang dipasang langsung. Bila container Postgres gagal start, cek dulu log inisialisasi shim dan migrasi.

## Kesesuaian dengan blueprint

Semua endpoint di `03-kontrak-api.md` sudah ada, ditambah `/v1/me`, `/members`, `/notes`, `/kcs`, dan `/peer-requests`. Perbedaan dari blueprint: KC usulan AI langsung dibuat dengan `created_by='ai'` dan bisa diubah lewat `PATCH /v1/kcs/{id}`, bukan menunggu konfirmasi. Ekstraksi hanya berjalan di Ruang Tim. Soal hanya dibangkitkan untuk satu KC utama per keputusan.
