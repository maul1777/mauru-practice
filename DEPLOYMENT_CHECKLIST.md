# Checklist Deployment Mauru Practice

Ikuti checklist ini secara berurutan. Jangan menyimpan password, database URL, atau secret ke dalam GitHub.

## A. Persiapan akun

- [ ] Pastikan sudah memiliki akun [GitHub](https://github.com/).
- [ ] Pastikan sudah memiliki akun [Vercel](https://vercel.com/) yang terhubung ke GitHub.
- [ ] Siapkan akun [Neon](https://neon.com/) atau gunakan integrasi Neon dari Vercel Marketplace.
- [ ] Aktifkan 2FA pada GitHub, Vercel, dan Neon.

## B. Upload source code ke GitHub

- [ ] Buka GitHub dan klik **New repository**.
- [ ] Gunakan nama repository `mauru-practice`.
- [ ] Pilih **Public** jika aplikasi dan bank soal boleh dilihat semua orang.
- [ ] Jangan memilih **Add a README**, `.gitignore`, atau license karena file tersebut sudah tersedia.
- [ ] Klik **Create repository**.
- [ ] Salin URL repository, misalnya `https://github.com/USERNAME/mauru-practice.git`.
- [ ] Buka PowerShell dan jalankan:

```powershell
cd D:\Belajar\AAPAI\mauru-practice
git remote add origin https://github.com/USERNAME/mauru-practice.git
git push -u origin main
```

- [ ] Ganti `USERNAME` dengan username GitHub Anda.
- [ ] Refresh halaman repository dan pastikan seluruh source code tampil.
- [ ] Buka tab **Actions** dan pastikan workflow CI berjalan.
- [ ] Pastikan CI berwarna hijau sebelum melanjutkan.
- [ ] Jangan mengaktifkan GitHub Pages; aplikasi ini membutuhkan server Next.js dan PostgreSQL.

Jika `origin` sebelumnya sudah pernah ditambahkan, periksa dengan:

```powershell
git remote -v
```

Jika URL-nya salah, perbaiki dengan:

```powershell
git remote set-url origin https://github.com/USERNAME/mauru-practice.git
git push -u origin main
```

## C. Membuat database PostgreSQL Neon

- [ ] Login ke Vercel.
- [ ] Import repository GitHub `mauru-practice` sebagai project baru.
- [ ] Sebelum production digunakan, buka **Storage** atau **Marketplace** pada project.
- [ ] Cari dan pilih **Neon Postgres**.
- [ ] Pilih **Create New Neon Account** jika belum memiliki akun Neon.
- [ ] Buat project/database baru bernama `mauru-practice`.
- [ ] Pilih region terdekat dengan pengguna, misalnya Singapore jika tersedia.
- [ ] Hubungkan database Neon ke project Vercel.
- [ ] Di Neon, buka menu **Connect**.
- [ ] Salin dan simpan sementara dua connection string berikut di password manager:
  - **Pooled connection string** untuk aplikasi/Vercel.
  - **Direct connection string** untuk Prisma migration.
- [ ] Pastikan connection string tidak ditempel ke GitHub, README, issue, atau chat publik.

## D. Membuat secret aplikasi

- [ ] Jalankan perintah berikut di PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

- [ ] Salin hasilnya ke password manager dengan nama `AUTH_SECRET`.
- [ ] Jangan memakai secret contoh dari `.env.example`.
- [ ] Tentukan email admin production.
- [ ] Buat password admin production yang unik, minimal 12 karakter.

## E. Mengatur environment variables di Vercel

- [ ] Buka project Vercel → **Settings** → **Environment Variables**.
- [ ] Tambahkan `DATABASE_URL` dengan **pooled connection string** Neon.
- [ ] Tambahkan `AUTH_SECRET` dengan secret acak yang dibuat sebelumnya.
- [ ] Tambahkan `APP_URL` dengan URL production, misalnya `https://mauru-practice.vercel.app`.
- [ ] Terapkan variables ke environment **Production**.
- [ ] Jika Preview Deployment juga harus bekerja, terapkan ke **Preview** menggunakan database/branch terpisah.
- [ ] Periksa kembali agar nilai variable tidak tertukar.

Environment production minimal:

```text
DATABASE_URL=<pooled Neon connection string>
AUTH_SECRET=<random secret minimal 32 byte>
APP_URL=https://mauru-practice.vercel.app
```

## F. Menjalankan database migration

- [ ] Buka PowerShell pada komputer lokal.
- [ ] Masuk ke folder project.
- [ ] Atur `DATABASE_URL` sementara menggunakan **direct connection string** Neon.
- [ ] Jalankan migration production:

```powershell
cd D:\Belajar\AAPAI\mauru-practice
$env:DATABASE_URL="DIRECT_CONNECTION_STRING_NEON"
npm install
npm run db:generate
npm run db:deploy
```

- [ ] Pastikan output menyatakan seluruh migration berhasil diterapkan.
- [ ] Jangan menggunakan `prisma db push` untuk production.

## G. Membuat akun admin production

- [ ] Masih pada PowerShell yang sama, isi email dan password admin production:

```powershell
$env:DATABASE_URL="DIRECT_CONNECTION_STRING_NEON"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_INITIAL_PASSWORD="PASSWORD_PRODUCTION_MINIMAL_12_KARAKTER"
npm run db:seed
```

- [ ] Pastikan seed selesai tanpa error.
- [ ] Simpan email dan password admin di password manager.
- [ ] Hapus environment variables sensitif dari sesi PowerShell setelah selesai:

```powershell
Remove-Item Env:DATABASE_URL
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_INITIAL_PASSWORD
```

## H. Deploy aplikasi di Vercel

- [ ] Kembali ke dashboard Vercel.
- [ ] Klik **Deploy** atau **Redeploy** setelah environment variables tersedia.
- [ ] Tunggu proses build sampai status **Ready**.
- [ ] Buka URL yang diberikan Vercel.
- [ ] Jika URL production berbeda, perbarui `APP_URL` lalu lakukan redeploy.
- [ ] Pastikan branch production Vercel adalah `main`.

## I. Import 500 soal

- [ ] Buka `https://URL-APLIKASI/admin/login`.
- [ ] Login menggunakan admin production.
- [ ] Buka menu **Import Markdown**.
- [ ] Pilih file `Bank Soal - 1.md` dari repository lokal.
- [ ] Klik **Preview Parsing**.
- [ ] Pastikan hasil menunjukkan:
  - 500 total soal.
  - 500 soal dapat diproses.
  - 0 parsing error.
  - Warning pembahasan boleh muncul karena bank legacy tidak memiliki explanation.
- [ ] Pilih kebijakan duplikat **Skip (aman)**.
- [ ] Klik tombol import.
- [ ] Tunggu sampai import selesai.
- [ ] Buka **Bank Soal** dan pastikan soal telah tersedia.

## J. Verifikasi production

- [ ] Buka landing page tanpa login.
- [ ] Masukkan nama peserta.
- [ ] Pastikan halaman konfigurasi menampilkan materi dan jumlah soal tersedia.
- [ ] Buat latihan 10 soal selama 10 menit.
- [ ] Jawab beberapa soal dan refresh browser.
- [ ] Pastikan jawaban tetap tersimpan dan timer tidak kembali ke awal.
- [ ] Tandai satu soal untuk ditinjau.
- [ ] Submit latihan.
- [ ] Pastikan nilai, benar, salah, kosong, dan breakdown materi tampil.
- [ ] Pastikan result reference code dapat dibuka kembali.
- [ ] Login ke admin.
- [ ] Pastikan session participant muncul di menu **Sessions**.
- [ ] Pastikan detail jawaban participant dapat dibuka.
- [ ] Coba export session sebagai CSV.
- [ ] Logout dan pastikan `/admin` mengarahkan kembali ke `/admin/login`.

## K. Verifikasi keamanan

- [ ] Pastikan repository GitHub tidak memiliki file `.env`.
- [ ] Pastikan tidak ada database URL atau password di source code dan commit history.
- [ ] Pastikan Vercel environment variables ditandai sebagai secret.
- [ ] Pastikan HTTPS aktif pada URL Vercel.
- [ ] Pastikan password admin berbeda dari password development.
- [ ] Jangan membagikan link dashboard Neon atau connection string.
- [ ] Jika secret pernah bocor, segera ganti password database dan `AUTH_SECRET` lalu redeploy.

## L. Update aplikasi berikutnya

Setelah mengubah source code:

```powershell
cd D:\Belajar\AAPAI\mauru-practice
npm test
npm run lint
npm run typecheck
npm run build
git add .
git commit -m "Jelaskan perubahan"
git push
```

- [ ] Pastikan GitHub Actions berhasil.
- [ ] Vercel akan membuat deployment baru otomatis setelah push ke `main`.
- [ ] Jika ada migration baru, jalankan `npm run db:deploy` terhadap Neon sebelum menggunakan fitur baru.

## M. Batas paket gratis

- [ ] Gunakan domain gratis `*.vercel.app` jika belum membutuhkan domain khusus.
- [ ] Pantau usage Vercel melalui dashboard.
- [ ] Pantau compute dan storage Neon melalui dashboard.
- [ ] Ingat bahwa Vercel Hobby ditujukan untuk proyek personal/non-komersial.
- [ ] Upgrade hanya jika trafik, database, atau kebutuhan komersial sudah melebihi paket gratis.

## Selesai

Deployment dianggap selesai jika:

- [ ] Repository GitHub tersedia dan CI hijau.
- [ ] Vercel deployment berstatus **Ready**.
- [ ] Migration dan seed berhasil.
- [ ] Admin dapat login.
- [ ] Bank soal 500 pertanyaan sudah diimpor.
- [ ] Participant dapat menyelesaikan quiz dan melihat hasil.
- [ ] Admin dapat melihat session participant.
