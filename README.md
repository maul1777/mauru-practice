# Mauru Practice

Aplikasi latihan soal asuransi production-oriented dengan import bank soal Markdown, konfigurasi dinamis, randomized session yang dapat dilanjutkan, autosave, timer server-based, scoring, review, dan area admin.

## Requirements

- Node.js 22 LTS
- PostgreSQL 15 atau lebih baru (Docker Compose disediakan)
- npm 10+

## Setup lokal

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Isi `AUTH_SECRET` dengan secret acak minimal 32 byte dan `ADMIN_INITIAL_PASSWORD` dengan password awal minimal 12 karakter. Admin dibuat dari `ADMIN_EMAIL` saat `npm run db:seed`, lalu login di `/admin/login`. Jangan gunakan credential contoh untuk production.

## Database dan deployment

Semua perubahan database direpresentasikan oleh migration di `prisma/migrations`. Production menjalankan `npm run db:deploy` sebelum `npm start`. Untuk deployment berbasis GitHub, hubungkan repository ke runtime Next.js seperti Vercel dan PostgreSQL terkelola, lalu isi `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, `ADMIN_EMAIL`, dan password seed secara aman di environment platform. GitHub Pages tidak mendukung server/Prisma aplikasi ini.

CI GitHub menjalankan Prisma generate, lint, typecheck, unit tests, dan production build pada push/PR.

## Import bank soal

Masuk sebagai admin, buka **Bank Soal → Import Markdown**, pilih file `.md`, lalu klik **Preview Parsing**. Periksa valid/warning/invalid/duplicate. Default duplikat adalah **Skip**; Replace dan Import as new harus dipilih eksplisit.

Format utama ada di [`examples/question-bank-example.md`](examples/question-bank-example.md). Field wajib: material, question, minimal dua options, dan answer yang cocok dengan salah satu option. Explanation, topic, difficulty, tags, image, dan external ID bersifat opsional.

Importer juga mengenali format legacy pada `Bank Soal - 1.md`: heading `#####`, pertanyaan satu baris dengan opsi `A.`–`D.`, serta tabel `No,Kunci` pada akhir file.

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run db:deploy
```

## Security notes

- Password admin di-hash bcrypt cost 12.
- Session admin memakai signed HTTP-only, same-site cookie.
- Session participant memakai token random 256-bit dan result code acak.
- Correct answer dan explanation tidak dikirim ke browser selama sesi aktif.
- Scoring dan expiry divalidasi server-side.
- Session menyimpan immutable question/options/correct-answer snapshot.

## Scope versi pertama

Selesai dalam struktur aplikasi: login admin, material/topic, manual question, import/validation/duplicate policy/history, filtering/pagination question bank, participant config/availability, balanced randomization, stable session snapshot, option shuffle, timer, autosave, flag/navigation, timeout/manual submit, result/review settings, session/participant admin, analytics sederhana, dan CSV export.

Future enhancements: editor opsi penuh saat edit, bulk action UI, drag-and-drop reordering hierarchy, upload/storage gambar terkelola, multiple-answer authoring UI, rate limiting terdistribusi, dan audit log granular.
