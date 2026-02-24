# 📖 ENSIKLOPEDIA KODE LENGKAP: Item Lending App

Selamat datang di "Alkitab" teknis project Anda. Dokumen ini membedah setiap file dan hampir setiap baris kode yang memiliki logika fungsional, menggunakan bahasa yang mudah dipahami namun tetap akurat secara teknis.

---

## 📁 1. FOLDER ROOT (Akar Project)

### 📄 `.env`
*File ini adalah pusat rahasia aplikasi.*
- **`DATABASE_URL`**: Alamat koneksi ke PostgreSQL. Formatnya `driver://user:password@host:port/database`.
- **`AUTH_SECRET`**: Kunci rahasia untuk menandatangani cookie sesi agar tidak bisa dipalsukan.
- **`AUTH_URL`**: Alamat dasar aplikasi (localhost:3000), digunakan Auth.js untuk membuat link redirect.
- **`GOOGLE_CLIENT_ID/SECRET`**: Kredensial untuk fitur login Google.
- **`RESEND_API_KEY`**: Kunci akses untuk mengirim email via sistem Resend.
- **`EMAIL_FROM`**: Alamat pengirim email (harus `onboarding@resend.dev` jika pakai akun trial).

### 📄 `proxy.ts` (Next.js Middleware)
*Satpam yang berdiri di pintu masuk.*
- **`auth((req) => { ... })`**: Membungkus middleware dengan fungsi cek auth.
- **`const isLoggedIn = !!req.auth`**: Mengubah objek session menjadi nilai `true/false`.
- **`if (!isLoggedIn) ...`**: Jika tidak login, paksa pindah ke `/login`.
- **`matcher: ["/dashboard/:path*"]`**: HANYA jalankan satpam ini jika user mencoba akses folder dashboard.

### 📄 `clean-env.js` (Utility Script)
*Skrip pembersih file sampah.*
- **`fs.readdirSync('.')`**: Membaca semua file di root.
- **`if (file.includes('.env') && file !== '.env')`**: Mencari file salah nama seperti ` .env` (dengan spasi).
- **`fs.unlinkSync(file)`**: Menghapus file sampah tersebut.

---

## 📁 2. FOLDER `prisma/` (Database Blueprint)

### 📄 `schema.prisma`
*Cetak biru seluruh informasi di database.*
- **`model User`**: 
  - `emailVerified`: Jika berisi jam/menit, user sudah klik link email.
  - `role`: Defaultnya `USER`, bisa diubah jadi `ADMIN`.
- **`model Account`**: Menyimpan data teknis dari Google (seperti token akses).
- **`model VerificationToken`**: Tempat penyimpanan sementara token magic link yang dikirim ke email.

---

## 📁 3. FOLDER `app/_lib/` (Otak & Alat)

### 📄 `auth.ts` (Pusat Keamanan)
*Ini adalah file paling penting dalam aplikasi.*
- **`trustHost: true`**: Penting untuk lingkungan lokal agar Auth.js tidak memblokir rute sendiri.
- **`adapter: PrismaAdapter(prisma)`**: Menghubungkan Auth.js ke database lewat Prisma.
- **`Resend Provider`**: 
  - `sendVerificationRequest`: Fungsi kustom untuk mengirim email.
  - `html template`: Berisi kode CSS & HTML untuk tombol verifikasi yang cantik.
- **`signIn` Callback**:
  - Mengecek `account.provider`. Jika `google`, langsung izinkan.
  - Jika `credentials`, paksa cek database: `if (!dbUser?.emailVerified) throw Error`.

### 📄 `prisma.ts` (Koneksi Database)
- **`new Pool(...)`**: Membuat antrean koneksi agar database tidak "kaget" saat banyak permintaan serentak.
- **`new PrismaPg(pool)`**: Adapter khusus agar Prisma 7 bisa berbicara lancar dengan PostgreSQL.
- **`globalThis.prisma`**: Trik agar saat Anda mengedit kode (save), Next.js tidak membuat koneksi database baru yang bisa menyebabkan error "Too many connections".

### 📄 `rate-limit.ts` (Rem Tangan Keamanan)
- **`new Map()`**: Media simpan memori sementara untuk mencatat alamat IP.
- **`if (record.count > 5) return false`**: Jika satu HP/Laptop mencoba daftar > 5 kali dalam semenit, blokir mereka.

---

## 📁 4. FOLDER `app/api/` (Jalur Belakang / API)

### 📄 `register/route.ts` (Pendaftaran User)
- **`bcrypt.hash(password, 10)`**: Mengamankan password. Angka 10 berarti algoritma pengacakan berjalan 10 kali per password.
- **`prisma.user.findUnique`**: Mencari apakah email sudah ada. Jika ada, gagalkan pendaftaran dengan pesan "Email sudah terdaftar".
- **`NextResponse.json`**: Cara server mengirim jawaban balik ke browser user (Format JSON).

### 📄 `auth/[...nextauth]/route.ts`
- **`export const { GET, POST } = handlers`**: Baris super pendek ini sebenarnya menghandle puluhan rute otomatis seperti login, logout, dan callback tanpa Anda perlu buat satu-per-satu.

---

## 📁 5. FOLDER `app/dashboard/` (Halaman Admin & User)

### 📄 `layout.tsx` (Template Dashboard)
- **`const session = await auth()`**: Mengambil data user yang sedang login di sisi server.
- **`navItems`**: Daftar menu yang berubah otomatis. Jika Anda ADMIN, menu "Kelola Barang" muncul. Jika USER, menunya "Cari Barang".
- **`LogoutButton`**: Komponen terpisah karena butuh interaksi klik (Client Component).

### 📄 `admin/page.tsx` & `user/page.tsx`
- **Warna & Animasi**: Menggunakan `animate-in fade-in` dari Tailwind CSS agar halaman tidak muncul kaku tapi perlahan memudar (smooth).
- **Stat Cards**: Menggunakan array `.map()` untuk merender kotak statistik (Total Barang, Request, dll) secara otomatis tanpa tulis kode berulang.

---

## 📁 6. FOLDER `app/_schemas/` (Aturan Validasi)

### 📄 `register-schema.ts` & `login-schema.ts`
- **`z.string().email()`**: Menjamin input harus berbentuk email (ada @ dan titik).
- **`z.string().min(6)`**: Menjamin password minimal 6 karakter demi keamanan user.

---

## 🛠️ 7. ANALISIS BARIS KODE BERGUNA (Deep Logic)

### Mengapa ada `Check-DB.ts`?
Skrip ini menggunakan `ts-node` untuk menjalankan kode TypeScript langsung di terminal. Baris `prisma.user.findMany()` di dalamnya berguna untuk mendebug apakah user yang baru daftar benar-benar masuk ke database atau tidak tanpa harus buka dashboard.

### Mengapa ada `Trash Cleaner` di Register Page?
Di `app/register/page.tsx`, kita menggunakan `try { ... } catch { ... }`. 
Jika `axios.post` berhasil tapi pengiriman email (`signIn("resend")`) gagal, aplikasi tidak akan diam saja, tapi memberikan `alert` yang memberitahu user apa masalahnya.

---

## 💡 KESIMPULAN BELAJAR
1. **Frontend** (React) bertugas menampilkan form dan tombol.
2. **Backend** (API Route) bertugas memproses data dan bicara ke database.
3. **Database** (PostgreSQL) adalah lemari penyimpan file jangka panjang.
4. **Auth.js** adalah sistem keamanan yang menghubungkan ketiganya agar aman.

> [!TIP]
> **Cara baca kode ini:** Ikuti alur dari `.env` (isi kunci), lalu `schema.prisma` (buat tabel), lalu `auth.ts` (atur izin), dan terakhir lihat `page.tsx` (tampilan).
