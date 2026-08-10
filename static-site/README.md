# Mauru Practice Static

Versi tanpa database untuk GitHub Pages.

- Soal dibundel dari data/bank-soal.md saat build.
- Soal dan opsi jawaban diacak setiap memulai latihan baru.
- Jawaban, timer, dan sesi aktif disimpan di localStorage browser.
- Refresh tidak mengubah urutan soal pada sesi yang sedang berjalan.
- Tidak ada login admin, API, database, atau sinkronisasi antarperangkat.

## Menjalankan secara lokal

    npm install
    npm run dev

## Validasi

    npm run lint
    npm run typecheck
    npm test
    npm run build

Hasil static export berada di folder out.
