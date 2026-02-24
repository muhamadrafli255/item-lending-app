# 🎓 Masterclass Project: Item Lending App (Panduan Belajar Total)

Selamat! Ini adalah dokumen **paling lengkap** yang akan membimbing Anda memahami setiap file, setiap folder, dan hampir setiap baris kode penting di project ini. Kita akan menggunakan bahasa yang santai namun teknis.

---

## 🏗️ 1. PONDASI: Konfigurasi & Database

### 📂 `.env` (Brankas Rahasia)
Ini adalah file paling sensitif. Bayangkan ini sebagai kumpulan kunci pintu rumah Anda.
- **`DATABASE_URL`**: Alamat GPS bagi aplikasi untuk menemukan database PostgreSQL.
- **`AUTH_SECRET`**: Kode enkripsi. Tanpa ini, pencuri bisa membuat token login palsu.
- **`RESEND_API_KEY`**: Saldo untuk mengirim email. Jika kunci ini bocor, orang lain bisa mengirim email pakai akun Anda.

### 📂 `prisma/schema.prisma` (Cetak Biru Gedung)
Di sini kita menggambar "tabel" database.
- **`model User`**: Mendefinisikan kolom `id`, `email`, `password`, dan `role`.
- **`emailVerified DateTime?`**: Jika kolom ini `null`, user belum sah. Jika ada isinya, user sudah klik link di email.

---

## 🧠 2. OTAK APLIKASI: Library & Logika (`app/_lib/`)

### 📂 `prisma.ts` (Koneksi Database)
```typescript
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
```
- **Baris 1-2**: Kita tidak langsung "ketuk pintu" database, tapi pakai `Pool` (kolam koneksi) agar permintaan data mengalir teratur.
- **Baris 4**: Pola `Singleton`. Artinya, kita hanya buat 1 koneksi yang dipakai bareng-bareng agar memori komputer tidak penuh.

### 📂 `auth.ts` (Sistem Keamanan Pusat)
File ini menggunakan **NextAuth v5**. Ini adalah bagian tersulit.
- **`trustHost: true`**: Memberitahu NextAuth bahwa domain `localhost` bisa dipercaya.
- **`Resend Provider`**: 
  - Di sini kita menulis kode HTML untuk email. 
  - Tombol `<a href="${url}">` di dalam email berisi token unik. Saat diklik, Auth.js akan mencocokkan token itu dengan yang ada di database.
- **`signIn` Callback**:
  ```typescript
  if (!dbUser?.emailVerified) throw new Error(...)
  ```
  - Ini adalah "Satpam". Baris ini mengecek apakah user sudah verifikasi email. Jika belum, akses login ditutup.

---

## 🛡️ 3. SATPAM DEPAN: `proxy.ts` (Middleware)
File ini berdiri di paling depan sebelum folder `/dashboard`.
- **Logika**: `if (!isLoggedIn) redirect("/login")`.
- Artinya: Setiap kali Anda klik menu Dashboard, file ini akan "mencegat" dan bertanya: *"Mana kartu identitasmu (Session)?"*. Jika tidak punya, Anda akan ditarik paksa kembali ke halaman Login.

---

## ⚡ 4. JALUR BELAKANG: API (`app/api/`)

### 📂 `register/route.ts` (Proses Pendaftaran)
1. **Langkah 1**: Ambil data dari formulir (`req.json`).
2. **Langkah 2 (`bcrypt.hash`)**: Mengacak password. Password "rahasia123" akan berubah menjadi teks acak sepanjang 60 karakter agar jika database bocor, password user tetap aman.
3. **Langkah 3 (`prisma.user.create`)**: Menyimpan data user ke database dengan status `role: "USER"`.

---

## 🎨 5. TAMPILAN DEPAN: Halaman Web (`app/`)

### 📂 `register/page.tsx` & `login/page.tsx`
- **`"use client"`**: Penanda bahwa file ini punya interaksi tombol dan input.
- **`handleSubmit`**: Saat tombol diklik, fungsi akan menjalankan validasi Zod terlebih dahulu untuk memastikan email valid (ada tanda `@`).
- **`signIn("resend", ...)`**: Setelah user berhasil daftar, baris ini otomatis memicu pengiriman email verifikasi.

### 📂 `dashboard/` (Area Terbatas)
- **`admin/page.tsx`**: Menampilkan statistik total barang dan request. Hanya user dengan `role: "ADMIN"` yang seharusnya bisa melakukan aksi di sini.
- **`layout.tsx`**: Mengatur Sidebar dan Navbar agar muncul di semua halaman dashboard tanpa harus kita tulis ulang kodenya di setiap file.

---

## 🛠️ 6. ALAT DIAGNOSA (Tools)

- **`check-db.ts`**: Skrip cepat untuk melihat isi database tanpa harus buka aplikasi. Sangat berguna untuk memastikan user sudah masuk atau belum.
- **`rate-limit.ts`**: Rem tangan. Jika ada orang jahat mencoba login terus menerus ribuan kali, file ini akan memblokir alamat IP mereka selama 1 menit.

---

## 📖 7. CARA BELAJAR TERBAIK
1. **Ubah Hal Kecil**: Coba ganti tulisan di `auth.ts` (misal judul email), lalu lihat perubahannya.
2. **Lihat Database**: Jalankan `npx prisma studio` di terminal untuk melihat tampilan visual database Anda.
3. **Cek Log**: Perhatikan terminal saat Anda klik tombol. Di sana akan muncul proses apa yang sedang berjalan (POST, GET, dll).

---

> [!NOTE]
> Project ini dibangun dengan prinsip **Clean Code**. Artinya, setiap file punya satu tugas spesifik agar jika terjadi error, Anda tahu persis ke file mana harus pergi untuk memperbaikinya.
