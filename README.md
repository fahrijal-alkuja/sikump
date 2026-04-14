# SIKUMP - Sistem Informasi Kepegawaian Unikarta

Aplikasi manajemen kepegawaian modern berbasis Nuxt 4, Prisma, dan MySQL.

## 🚀 Panduan Deployment Produksi (Smart Build)

Untuk memperbarui aplikasi di server produksi (aaPanel), ikuti tahapan berikut agar proses build berjalan lancar tanpa error memori atau file:

### 1. Masuk ke Terminal
Buka terminal SSH atau terminal di dashboard aaPanel Anda dan masuk ke folder proyek:
```bash
cd /www/apps/sikump
```

### 2. Jalankan Proses Update & Build
Gunakan perintah gabungan berikut untuk melakukan update otomatis. Perintah ini akan melepas folder aset sementara agar build cepat, lalu memasangnya kembali otomatis:

```bash
# 1. Ambil kode terbaru dari GitHub
git pull origin main

# 2. Lepas sementara link folder dokumen (agar build tidak berat/error)
rm -rf public/assets

# 3. Jalankan proses Build
npm run build

# 4. Sambungkan kembali folder dokumen ke penyimpanan luar
ln -s /www/wwwroot/sikump-storage public/assets
```

### 3. Restart Aplikasi di aaPanel
Setelah build selesai (muncul pesan `✨ Build complete!`), lakukan langkah terakhir:
1. Buka dashboard **aaPanel**.
2. Masuk ke menu **Website** -> **Node.js Project**.
3. Cari proyek **sikump**, lalu klik tombol **Restart**.

---

## 📂 Struktur Penyimpanan File
Semua file yang diunggah (Foto, KTP, Ijazah, dll) disimpan secara permanen di luar folder aplikasi untuk keamanan data:
- **Lokasi Fisik:** `/www/wwwroot/sikump-storage/`
- **Akses Aplikasi:** Melalui folder `public/assets` (Symbolic Link)

## 🛠️ Catatan Penting
- Jangan pernah menghapus folder `/www/wwwroot/sikump-storage` karena di sanalah sumber asli semua dokumen digital Anda berada.
- Jika Anda menambah kolom baru di database, pastikan untuk menjalankan `npx prisma generate` sebelum melakukan build.
