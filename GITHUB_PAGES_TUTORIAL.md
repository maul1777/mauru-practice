# Tutorial Deploy Quiz Tanpa Database ke GitHub Pages

Versi publik berada di folder **static-site**. Anda tidak perlu Neon, Vercel, database URL, atau environment variable.

## Yang perlu diketahui

- GitHub Pages hanya menjalankan HTML, CSS, dan JavaScript statis.
- Soal dan opsi jawaban diacak otomatis setiap latihan baru.
- Refresh saat latihan tidak mengubah urutan soal karena sesi disimpan di browser.
- Jawaban dan hasil hanya tersimpan pada browser/perangkat peserta.
- Tidak ada login admin, dashboard peserta, atau sinkronisasi antarperangkat.
- Isi bank soal ikut terkirim ke browser, sehingga jawaban benar tidak dapat dianggap rahasia.

## Langkah 1 - Push perubahan

Buka PowerShell:

    cd D:\Belajar\AAPAI\mauru-practice
    git push origin main

## Langkah 2 - Aktifkan GitHub Pages

1. Buka repository **mauru-practice** di GitHub.
2. Klik **Settings**.
3. Pada menu kiri, klik **Pages**.
4. Pada **Build and deployment**, ubah **Source** menjadi **GitHub Actions**.
5. Tidak perlu memilih branch atau folder.

## Langkah 3 - Jalankan deployment

Deployment otomatis berjalan setelah push yang mengubah folder **static-site**.

Jika belum berjalan:

1. Buka tab **Actions**.
2. Pilih workflow **Deploy static quiz to GitHub Pages**.
3. Klik **Run workflow**.
4. Pilih branch **main**.
5. Klik tombol **Run workflow**.

Workflow akan memasang package, menjalankan lint, typecheck, test, membuat static export, lalu menerbitkannya.

## Langkah 4 - Buka aplikasi

Setelah workflow berwarna hijau, buka:

    https://USERNAME.github.io/NAMA-REPOSITORY/

Untuk repository ini, URL yang diharapkan:

    https://maul1777.github.io/mauru-practice/

URL final juga tampil pada halaman workflow dan pada **Settings > Pages**.

## Langkah 5 - Tes setelah online

- [ ] Landing page terbuka tanpa error 404.
- [ ] Jumlah soal dan materi tampil.
- [ ] Peserta dapat mengisi nama.
- [ ] Materi dapat dipilih.
- [ ] Tombol **Acak & Mulai Latihan** bekerja.
- [ ] Urutan soal berbeda ketika membuat latihan baru.
- [ ] Jawaban tetap ada setelah refresh.
- [ ] Timer tetap berjalan setelah refresh.
- [ ] Submit menampilkan skor dan review jawaban.
- [ ] Tampilan dapat digunakan di ponsel.

## Cara mengubah bank soal

Edit atau ganti file:

    static-site/data/bank-soal.md

Lalu validasi dan push:

    cd D:\Belajar\AAPAI\mauru-practice\static-site
    npm run lint
    npm run typecheck
    npm test
    npm run build

    cd ..
    git add static-site
    git commit -m "Update static quiz"
    git push origin main

GitHub Pages akan diperbarui otomatis.

## Biaya

GitHub Pages dan GitHub Actions dapat digunakan gratis untuk repository public dalam batas penggunaan GitHub. Domain bawaan **github.io** juga gratis.

## Jika deployment gagal

1. Buka **Actions**.
2. Klik workflow yang berwarna merah.
3. Buka job dan langkah yang gagal.
4. Pastikan **Settings > Pages > Source** sudah **GitHub Actions**.
5. Pastikan repository memiliki file **.github/workflows/deploy-pages.yml**.
6. Jalankan workflow kembali setelah memperbaiki error.
