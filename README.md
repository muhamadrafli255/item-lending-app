# LendGo 📦

Sistem peminjaman barang terintegrasi yang terdiri dari web admin (Next.js) dan aplikasi mobile (React Native/Expo).

---

## 🏗️ Struktur Proyek

Proyek ini memiliki dua komponen utama:

1. **Web App (Backend & Admin)**: Folder root (`/`). Digunakan untuk manajemen barang oleh admin dan sebagai API server.
2. **Mobile App (User)**: Folder `mobile/`. Digunakan oleh pengguna umum untuk meminjam barang.

---

## 🚀 Cara Menjalankan

### 1. Persiapan Database & Lingkungan
Pastikan Anda sudah mengatur file `.env` di root directory dengan database URL dan secret lainnya.

### 2. Jalankan Web & API Server
Server ini harus berjalan agar aplikasi mobile bisa berfungsi.
```bash
npm install
npm run dev
```
Akses di: `http://localhost:3000`

### 3. Jalankan Aplikasi Mobile
Buka terminal baru:
```bash
cd mobile
npm install
npx expo start
```
Gunakan **Expo Go** di HP atau emulator Android untuk membuka aplikasi.

---

## ✨ Fitur Utama

### Web (Admin)
- Dashboard statistik peminjaman.
- Manajemen inventaris barang (Tambah/Edit/Hapus).
- Manajemen user dan verifikasi peminjaman.

### Mobile (User)
- Katalog barang real-time.
- Sistem peminjaman mandiri.
- Riwayat peminjaman dengan status badge.
- Profil dan pengaturan akun.

---

## 📱 Standalone APK (Android)
Jika Anda hanya ingin mencoba aplikasi mobile di Android tanpa setup environment, Anda bisa menginstall file APK yang sudah di-build:

**Lokasi**: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🛠️ Teknologi yang Digunakan
- **Frontend Web**: Next.js, Tailwind CSS, Shadcn UI.
- **Mobile**: React Native, Expo, Axios.
- **Backend**: Next.js API Routes, NextAuth.js.
- **Database**: Prisma ORM, PostgreSQL/MySQL.

---

Dibuat dengan ❤️ untuk efisiensi peminjaman barang.
