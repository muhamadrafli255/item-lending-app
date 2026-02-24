# LendGo Mobile App 📱

Aplikasi mobile berbasis **React Native (Expo)** untuk meminjam barang dengan mudah. Aplikasi ini tersambung langsung ke backend Next.js Anda.

---

## ✨ Fitur Utama
- **Autentikasi Aman**: Login dan Register untuk user.
- **Daftar Barang**: Lihat semua barang yang tersedia beserta stoknya.
- **Pinjam Barang**: Proses peminjaman barang hanya dengan beberapa ketukan.
- **Status Peminjaman**: Pantau status pinjaman (Pending, Approved, Rejected, Returned).
- **Profil User**: Ubah nama, ganti password, dan lihat foto profil.
- **Splash Screen Kustom**: Animasi loading awal yang keren dan premium.

---

## 🛠️ Persiapan Awal
Sebelum menjalankan aplikasi, pastikan Anda sudah menginstall:
1. **Node.js** (versi terbaru)
2. **Android Studio** (untuk emulator) atau aplikasi **Expo Go** (untuk HP fisik)

---

## 🚀 Cara Menjalankan

### 1. Jalankan Backend (Next.js)
Aplikasi mobile membutuhkan backend yang sedang berjalan. Buka terminal baru di **root directory** proyek ini dan jalankan:
```bash
npm run dev
```

### 2. Jalankan Aplikasi Mobile
Buka terminal lain di folder `mobile/` dan ikuti langkah berikut:

```bash
cd mobile
npx expo start --clear
```

- **Emulator Android**: Tekan tombol `a` pada keyboard.
- **HP Fisik**: Scan QR code yang muncul menggunakan aplikasi **Expo Go**.

> [!IMPORTANT]
> **Koneksi Backend**: 
> - Secara default aplikasi terhubung ke `http://10.0.2.2:3000` (untuk emulator).
> - Jika menggunakan HP fisik, ubah `BASE_URL` di `src/api/client.ts` menjadi Alamat IP Lokal PC Anda (contoh: `http://192.168.1.5:3000`).

---

## 🏗️ Build & APK
Jika Anda ingin mencoba aplikasi tanpa menjalankan Expo, file APK sudah tersedia:

**Lokasi APK**: `android/app/build/outputs/apk/debug/app-debug.apk`

Untuk membuat build baru secara lokal:
```bash
npx expo run:android
```

---

## 📁 Struktur Folder
- `src/api`: Koneksi ke backend & management cookie.
- `src/contexts`: State management untuk user login.
- `src/navigation`: Pengaturan alur pindah layar (Tabs & Stacks).
- `src/screens`: Kumpulan seluruh halaman aplikasi.
- `src/components`: Komponen yang bisa dipakai ulang (Card, Button, dll).

---

Dibuat dengan ❤️ untuk kemudahan peminjaman barang.
