# Tutorial Umum Deployment Aplikasi Next.js ke Internet

Tutorial ini dapat digunakan untuk project Next.js lain yang memakai PostgreSQL. GitHub menyimpan source code, Vercel menjalankan aplikasi, dan Neon menyediakan database.

Ikuti checklist secara berurutan. Jangan menyimpan password, database URL, atau secret ke dalam GitHub.

## Cara membaca placeholder

Ganti nilai dalam tanda `<...>` dengan data milik Anda:

| Placeholder | Keterangan |
| --- | --- |
| `<PROJECT_FOLDER>` | Lokasi folder project pada komputer |
| `<GITHUB_USERNAME>` | Username GitHub |
| `<REPOSITORY_NAME>` | Nama repository/project |
| `<ADMIN_EMAIL>` | Email admin production |
| `<ADMIN_PASSWORD>` | Password unik admin, minimal 12 karakter |
| `<DIRECT_DATABASE_URL>` | Connection string langsung untuk migration |
| `<POOLED_DATABASE_URL>` | Connection string pooled untuk aplikasi |
| `<APP_URL>` | URL production dari Vercel |

Contoh: ubah `cd <PROJECT_FOLDER>` menjadi `cd C:\Projects\quiz-app` atau `cd ~/projects/quiz-app`.

## A. Persiapan akun

- [ ] Pastikan sudah memiliki akun [GitHub](https://github.com/).
- [ ] Pastikan sudah memiliki akun [Vercel](https://vercel.com/) yang terhubung ke GitHub.
- [ ] Siapkan akun [Neon](https://neon.com/) atau gunakan integrasi Neon dari Vercel Marketplace.
- [ ] Aktifkan 2FA pada GitHub, Vercel, dan Neon.

## B. Upload source code ke GitHub

- [ ] Buka GitHub dan klik **New repository**.
- [ ] Gunakan nama repository `<REPOSITORY_NAME>`.
- [ ] Pilih **Public** jika source code boleh dilihat semua orang, atau **Private** jika tidak.
- [ ] Jika project lokal sudah memiliki README, `.gitignore`, atau license, jangan membuat file yang sama dari GitHub agar tidak terjadi konflik saat push pertama.
- [ ] Klik **Create repository**.
- [ ] Salin URL repository, misalnya `https://github.com/<GITHUB_USERNAME>/<REPOSITORY_NAME>.git`.
- [ ] Buka PowerShell dan jalankan:

```powershell
cd <PROJECT_FOLDER>
git remote add origin https://github.com/<GITHUB_USERNAME>/<REPOSITORY_NAME>.git
git push -u origin main
```

- [ ] Ganti `<GITHUB_USERNAME>` dengan username GitHub Anda.
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
git remote set-url origin https://github.com/<GITHUB_USERNAME>/<REPOSITORY_NAME>.git
git push -u origin main
```

## C. Membuat database PostgreSQL Neon

- [ ] Login ke Vercel.
- [ ] Import repository GitHub `<REPOSITORY_NAME>` sebagai project baru.
- [ ] Sebelum production digunakan, buka **Storage** atau **Marketplace** pada project.
- [ ] Cari dan pilih **Neon Postgres**.
- [ ] Pilih **Create New Neon Account** jika belum memiliki akun Neon.
- [ ] Buat project/database baru bernama `<REPOSITORY_NAME>`.
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
- [ ] Tambahkan `APP_URL` dengan URL production, misalnya `<APP_URL>`.
- [ ] Terapkan variables ke environment **Production**.
- [ ] Jika Preview Deployment juga harus bekerja, terapkan ke **Preview** menggunakan database/branch terpisah.
- [ ] Periksa kembali agar nilai variable tidak tertukar.

Environment production minimal:

```text
DATABASE_URL=<POOLED_DATABASE_URL>
AUTH_SECRET=<random secret minimal 32 byte>
APP_URL=<APP_URL>
```

## F. Menjalankan database migration

- [ ] Buka PowerShell pada komputer lokal.
- [ ] Masuk ke folder project.
- [ ] Atur `DATABASE_URL` sementara menggunakan **direct connection string** Neon.
- [ ] Jalankan migration production:

```powershell
cd <PROJECT_FOLDER>
$env:DATABASE_URL="<DIRECT_DATABASE_URL>"
npm install
npm run db:generate
npm run db:deploy
```

- [ ] Pastikan output menyatakan seluruh migration berhasil diterapkan.
- [ ] Jangan menggunakan `prisma db push` untuk production.

## G. Membuat akun admin production

- [ ] Masih pada PowerShell yang sama, isi email dan password admin production:

```powershell
$env:DATABASE_URL="<DIRECT_DATABASE_URL>"
$env:ADMIN_EMAIL="<ADMIN_EMAIL>"
$env:ADMIN_INITIAL_PASSWORD="<ADMIN_PASSWORD>"
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

## Catatan untuk macOS dan Linux

Perintah Git dan npm sama. Untuk mengatur environment variable, gunakan:

```bash
export DATABASE_URL='<DIRECT_DATABASE_URL>'
export ADMIN_EMAIL='<ADMIN_EMAIL>'
export ADMIN_INITIAL_PASSWORD='<ADMIN_PASSWORD>'
npm run db:deploy
npm run db:seed
unset DATABASE_URL ADMIN_EMAIL ADMIN_INITIAL_PASSWORD
```

## H. Deploy aplikasi di Vercel

- [ ] Kembali ke dashboard Vercel.
- [ ] Klik **Deploy** atau **Redeploy** setelah environment variables tersedia.
- [ ] Tunggu proses build sampai status **Ready**.
- [ ] Buka URL yang diberikan Vercel.
- [ ] Jika URL production berbeda, perbarui `APP_URL` lalu lakukan redeploy.
- [ ] Pastikan branch production Vercel adalah `main`.

## I. Import data awal (opsional)

- [ ] Lewati bagian ini jika aplikasi tidak membutuhkan import data awal.
- [ ] Buka `<APP_URL>/admin/login`.
- [ ] Login menggunakan admin production.
- [ ] Buka menu import yang disediakan aplikasi.
- [ ] Pilih file data awal dari komputer lokal.
- [ ] Jalankan preview atau validasi sebelum import.
- [ ] Pastikan jumlah data valid sesuai file sumber dan tidak ada parsing error.
- [ ] Pilih kebijakan duplikat yang paling aman, biasanya **Skip**.
- [ ] Jalankan import.
- [ ] Tunggu sampai import selesai.
- [ ] Buka halaman pengelolaan data dan pastikan seluruh data yang valid telah tersedia.

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
cd <PROJECT_FOLDER>
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
- [ ] Data awal yang dibutuhkan sudah diimpor atau dibuat.
- [ ] Participant dapat menyelesaikan quiz dan melihat hasil.
- [ ] Admin dapat melihat session participant.
