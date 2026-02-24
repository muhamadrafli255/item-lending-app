# 📖 MATERI PEMBELAJARAN LENGKAP: Item Lending App
# Pembahasan Semua File & Semua Baris Kode

---

## DAFTAR ISI
1. [Dependencies (package.json)](#-dependencies-packagejson)
2. [Konfigurasi Project](#-konfigurasi-project)
3. [Database Schema (Prisma)](#-database-schema-prisma)
4. [Library Inti (_lib)](#-library-inti-_lib)
5. [Validasi Input (_schemas)](#-validasi-input-_schemas)
6. [Providers (Context React)](#-providers-context-react)
7. [Hooks Kustom (_hooks)](#-hooks-kustom-_hooks)
8. [API Backend](#-api-backend)
9. [Halaman Publik (Login & Register)](#-halaman-publik)
10. [Dashboard (Admin & User)](#-dashboard)
11. [Middleware (proxy.ts)](#-middleware)
12. [Skrip Utilitas](#-skrip-utilitas)
13. [Styling (CSS)](#-styling-css)

---

## 📦 Dependencies (package.json)

File `package.json` mendaftarkan semua library yang digunakan project ini.

### Dependencies Utama (Production)
| Library | Versi | Fungsi |
|---------|-------|--------|
| `next` | 16.1.6 | Framework utama. Menjalankan server, routing, dan rendering halaman. |
| `react` & `react-dom` | 19.2.3 | Library UI. Mengubah kode JSX menjadi tampilan di browser. |
| `next-auth` | 5.0.0-beta.30 | Sistem autentikasi (login/register/SSO). Versi 5 = Auth.js. |
| `@auth/prisma-adapter` | 2.11.1 | Penghubung Auth.js dengan database Prisma. Menyimpan session & account ke DB. |
| `@prisma/client` | 7.4.1 | ORM (Object Relational Mapping). Menerjemahkan kode TypeScript ke query SQL. |
| `@prisma/adapter-pg` | 7.4.1 | Adapter PostgreSQL untuk Prisma 7. Menggunakan driver `pg` langsung. |
| `pg` | 8.18.0 | Driver PostgreSQL murni untuk Node.js. Digunakan membuat koneksi pool. |
| `bcrypt` | 6.0.0 | Library hashing password. Mengacak password agar tidak bisa dibaca. |
| `resend` | 6.9.2 | SDK untuk mengirim email transaksional (verifikasi, notifikasi). |
| `axios` | 1.13.5 | HTTP client. Mengirim request dari frontend ke backend (POST /api/register). |
| `react-hook-form` | 7.71.2 | Mengelola state form (input, validasi, submit) secara efisien. |
| `@hookform/resolvers` | 5.2.2 | Penghubung react-hook-form dengan library validasi (Zod). |
| `zod` | 4.3.6 | Library validasi schema. Mendefinisikan aturan untuk input user. |
| `@tanstack/react-query` | 5.90.21 | Library untuk fetching data. Mengelola cache, loading state, dan re-fetching. |
| `sonner` | 2.0.7 | Komponen toast notification yang elegan dan modern. |
| `@upstash/ratelimit` | 2.0.8 | Rate limiting berbasis Redis (belum aktif dipakai di project ini). |
| `@upstash/redis` | 1.36.2 | Redis client untuk Upstash (cloud Redis). |

### Dev Dependencies (Development Only)
| Library | Fungsi |
|---------|--------|
| `prisma` | CLI untuk generate client, migrasi database, dan Prisma Studio. |
| `tailwindcss` | Framework CSS utility-first untuk styling cepat. |
| `@tailwindcss/postcss` | Plugin PostCSS agar Tailwind berjalan di build system Next.js. |
| `typescript` | Compiler TypeScript. Mengubah `.ts` menjadi `.js`. |
| `@types/bcrypt`, `@types/pg`, dll | Type definitions agar TypeScript mengenali library JavaScript. |
| `eslint` & `eslint-config-next` | Linter untuk mendeteksi error dan bad practice di kode. |

---

## ⚙️ Konfigurasi Project

### 📄 `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",          // Output JavaScript versi ES2017
    "lib": ["dom", "dom.iterable", "esnext"], // API browser + fitur JS terbaru
    "strict": true,              // Mode ketat: semua pengecekan tipe aktif
    "noEmit": true,              // Tidak menghasilkan file .js (Next.js yang handle)
    "module": "esnext",          // Menggunakan sistem modul ESM (import/export)
    "moduleResolution": "bundler", // Resolusi modul gaya bundler modern
    "jsx": "react-jsx",          // Transformasi JSX otomatis (tidak perlu import React)
    "paths": { "@/*": ["./*"] }  // Alias: @/ = root project (shortcut import)
  }
}
```
**Penjelasan**: File ini memberitahu TypeScript bagaimana membaca kode Anda. `"strict": true` memaksa Anda menulis tipe data yang benar, mengurangi bug.

### 📄 `next.config.ts`
```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = { /* config options here */ };
export default nextConfig;
```
**Penjelasan**: File konfigurasi Next.js. Saat ini kosong karena kita menggunakan pengaturan default. Di sini Anda bisa menambah redirect, environment variables publik, atau image domains.

### 📄 `postcss.config.mjs`
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // Mengaktifkan Tailwind CSS v4 via PostCSS
  },
};
export default config;
```
**Penjelasan**: PostCSS adalah "pipa proses" untuk CSS. Plugin Tailwind akan mengubah class seperti `bg-blue-500` menjadi CSS asli saat build.

### 📄 `eslint.config.mjs`
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals"; // Aturan performa web
import nextTs from "eslint-config-next/typescript";           // Aturan TypeScript

const eslintConfig = defineConfig([
  ...nextVitals,     // Memastikan kode tidak merusak performa (Core Web Vitals)
  ...nextTs,         // Memastikan kode TypeScript mengikuti best practice
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]), // Abaikan folder build
]);
export default eslintConfig;
```
**Penjelasan**: ESLint adalah "guru" yang memeriksa kode Anda. Jika ada yang salah (misalnya variabel tidak dipakai), ESLint akan memberi peringatan.

### 📄 `prisma.config.ts`
```typescript
import 'dotenv/config'  // Memuat variabel dari .env agar Prisma bisa baca DATABASE_URL

export default {
    datasource: {
        url: process.env.DATABASE_URL,  // Alamat database PostgreSQL
    },
}
```
**Penjelasan**: Prisma 7 membutuhkan file ini untuk tahu di mana database berada. `dotenv/config` memastikan file `.env` dibaca saat menjalankan perintah Prisma CLI.

### 📄 `.env`
```
DATABASE_URL="postgresql://postgres:Rafli251983@localhost:5432/lending_db"
AUTH_SECRET="NsMEWAvqRNhaxKVfarYvEtDx0/9qvBhB6aFzR58eawU="
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID="721332211669-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
RESEND_API_KEY="re_arTrzuri_..."
AUTH_RESEND_KEY="re_arTrzuri_..."
EMAIL_FROM="onboarding@resend.dev"
```
**Penjelasan per baris:**
- `DATABASE_URL`: Format = `postgresql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE`
- `AUTH_SECRET`: String acak untuk mengenkripsi cookie sesi. Jangan pernah share ke siapapun.
- `AUTH_URL`: URL dasar aplikasi. Auth.js gunakan ini untuk membuat link callback.
- `AUTH_TRUST_HOST`: Mengizinkan Auth.js berjalan di localhost tanpa HTTPS.
- `GOOGLE_CLIENT_ID/SECRET`: Dari Google Cloud Console, untuk fitur "Login dengan Google".
- `RESEND_API_KEY` / `AUTH_RESEND_KEY`: Kunci API Resend untuk mengirim email.
- `EMAIL_FROM`: Alamat pengirim. Saat trial Resend, WAJIB `onboarding@resend.dev`.

---

## 🗃️ Database Schema (Prisma)

### 📄 `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"   // Generate Prisma Client dalam bahasa JavaScript
}

datasource db {
  provider = "postgresql"          // Tipe database: PostgreSQL
}
```
**Penjelasan**: Dua blok ini wajib ada. `generator` menentukan bahasa output, `datasource` menentukan tipe database.

```prisma
model User {
  id            String    @id @default(uuid())   // Primary key, otomatis UUID
  name          String                            // Nama lengkap user
  email         String    @unique                 // Email unik, tidak boleh duplikat
  emailVerified DateTime?                         // Null = belum verifikasi, ada isi = sudah
  image         String?                           // URL foto profil (opsional, dari Google)
  password      String                            // Password yang sudah di-hash bcrypt
  role          Role      @default(USER)          // Enum: USER atau ADMIN
  loans         Loan[]                            // Relasi: satu user punya banyak peminjaman
  accounts      Account[]                         // Relasi: akun sosial (Google)
  sessions      Session[]                         // Relasi: sesi login aktif
  createdAt     DateTime  @default(now())         // Waktu pendaftaran
}
```
**Penjelasan**: Tanda `?` artinya opsional (boleh null). `@unique` mencegah email sama. `@default(uuid())` otomatis bikin ID acak.

```prisma
model Item {
  id          String   @id @default(uuid())
  name        String                  // Nama barang (misal: "Laptop Asus")
  description String                  // Deskripsi barang
  stock       Int                     // Jumlah stok tersedia
  image       String?                 // URL gambar barang (opsional)
  loans       Loan[]                  // Relasi: satu barang bisa dipinjam banyak kali
  createdAt   DateTime @default(now())
}
```

```prisma
model Loan {
  id         String     @id @default(uuid())
  userId     String                        // Foreign key ke User
  itemId     String                        // Foreign key ke Item
  quantity   Int                           // Jumlah barang yang dipinjam
  status     LoanStatus @default(PENDING)  // Status peminjaman
  borrowDate DateTime   @default(now())    // Tanggal pinjam
  returnDate DateTime?                     // Tanggal kembali (null jika belum)

  user User @relation(fields: [userId], references: [id])  // Koneksi ke tabel User
  item Item @relation(fields: [itemId], references: [id])  // Koneksi ke tabel Item
}
```
**Penjelasan**: `@relation` menghubungkan dua tabel. `fields` = kolom di tabel ini, `references` = kolom di tabel tujuan.

```prisma
model Account {        // Tabel untuk menyimpan data login Google/SSO
  id                 String  @id @default(cuid())
  userId             String
  type               String  // "oauth" untuk Google
  provider           String  // "google"
  providerAccountId  String  // ID unik dari Google
  refresh_token      String? // Token untuk memperbarui akses
  access_token       String? // Token akses API Google
  expires_at         Int?    // Kapan token kedaluwarsa (Unix timestamp)
  // ... field lainnya untuk OAuth

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])  // Satu provider + satu ID = unik
}

model Session {        // Tabel sesi login (digunakan Auth.js internal)
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {  // Tabel token email verifikasi (magic link)
  identifier String        // Email address
  token      String   @unique  // Token acak yang dikirim ke email
  expires    DateTime      // Kapan token hangus

  @@unique([identifier, token])  // Kombinasi email + token harus unik
}
```
**Penjelasan**: `onDelete: Cascade` artinya jika User dihapus, semua Account dan Session miliknya ikut terhapus otomatis.

```prisma
enum Role {        // Tipe enum untuk peran user
  ADMIN            // Administrator
  USER             // Pengguna biasa
}

enum LoanStatus {  // Tipe enum untuk status peminjaman
  PENDING          // Menunggu persetujuan
  APPROVED         // Disetujui
  REJECTED         // Ditolak
  RETURNED         // Sudah dikembalikan
}
```

---

## 🧠 Library Inti (_lib)

### 📄 `app/_lib/prisma.ts`
```typescript
import { Pool } from 'pg'                    // Baris 1: Import Pool dari library pg
import { PrismaPg } from '@prisma/adapter-pg' // Baris 2: Import adapter Prisma untuk PostgreSQL
import { PrismaClient } from '@prisma/client'  // Baris 3: Import Prisma Client
import 'dotenv/config'                         // Baris 4: Muat variabel .env ke process.env

// Baris 6-8: Membuat variabel global agar Prisma Client bisa di-reuse
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Baris 10: Ambil URL database dari environment variable
const connectionString = `${process.env.DATABASE_URL}`

// Baris 11: Buat Pool koneksi - mengelola banyak koneksi sekaligus
const pool = new Pool({ connectionString })

// Baris 12: Buat adapter - jembatan antara Prisma dan driver pg
const adapter = new PrismaPg(pool)

// Baris 14-16: Singleton Pattern
// Jika sudah ada instance Prisma di global, pakai itu
// Jika belum ada, buat instance baru
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

// Baris 18-19: Di development mode, simpan instance ke global
// Ini mencegah pembuatan koneksi baru setiap kali Next.js hot-reload
if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma
```

### 📄 `app/_lib/auth.ts`
```typescript
// === IMPORT ===
import NextAuth, { type DefaultSession } from "next-auth"  // Core Auth.js
import Credentials from "next-auth/providers/credentials"   // Provider login manual
import Google from "next-auth/providers/google"              // Provider Google SSO
import Resend from "next-auth/providers/resend"              // Provider magic link email
import { PrismaAdapter } from "@auth/prisma-adapter"         // Adapter DB untuk Auth.js
import { prisma } from "./prisma"                            // Instance Prisma Client
import bcrypt from "bcrypt"                                  // Library hash password

// === TYPE AUGMENTATION ===
// Menambah field 'role' ke type User dan Session bawaan Auth.js
declare module "next-auth" {
  interface User { role?: string }
  interface Session {
    user: { role?: string } & DefaultSession["user"]
  }
}

// === KONFIGURASI UTAMA ===
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,                    // Izinkan localhost
  adapter: PrismaAdapter(prisma),     // Simpan data auth ke database
  session: { strategy: "jwt" },       // Gunakan JWT (token) bukan database session
  debug: true,                        // Tampilkan log debug di terminal
  pages: { signIn: "/login" },        // Custom halaman login (bukan default Auth.js)

  providers: [
    // --- GOOGLE SSO ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // --- RESEND (MAGIC LINK EMAIL) ---
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
      // Fungsi kustom untuk mengirim email dengan desain HTML
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url)  // Ambil hostname dari URL callback
        // Kirim email via Resend API
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: email,
            subject: `Verify your email for ${host}`,
            html: `... template HTML email ...`, // Berisi tombol CTA + link URL
          }),
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(JSON.stringify(error))  // Lempar error jika gagal
        }
      },
    }),

    // --- CREDENTIALS (EMAIL + PASSWORD) ---
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        // Validasi input
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }
        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) throw new Error("User not found")

        // Bandingkan password yang diinput dengan hash di database
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) throw new Error("Wrong password")

        // Return data user (akan disimpan ke token JWT)
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],

  callbacks: {
    // --- CALLBACK signIn: Dijalankan SEBELUM user benar-benar masuk ---
    async signIn({ user, account }) {
      if (account?.provider === "google") return true   // Google = langsung izinkan
      if (account?.provider === "resend") return true    // Resend = izinkan (itu verifikasi)
      if (account?.provider === "credentials") {
        // Untuk login manual, cek apakah email sudah diverifikasi
        const dbUser = (await prisma.user.findUnique({
          where: { id: user.id },
        })) as any
        if (!dbUser?.emailVerified) {
          throw new Error("Email belum diverifikasi. Silakan cek email Anda.")
        }
      }
      return true
    },

    // --- CALLBACK jwt: Menambah data kustom ke token ---
    async jwt({ token, user }) {
      if (user) token.role = user.role  // Simpan role ke dalam JWT
      return token
    },

    // --- CALLBACK session: Menambah data kustom ke session ---
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string  // Ambil role dari JWT
        if (token.sub) session.user.id = token.sub  // Ambil ID dari JWT
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,  // Kunci enkripsi JWT
})
```

### 📄 `app/_lib/api.ts`
```typescript
import axios from "axios"

// Buat instance Axios dengan baseURL = "/api"
// Jadi axios.post("/register") sebenarnya POST ke /api/register
const api = axios.create({
  baseURL: "/api",
})

// Interceptor: "Penyadap" respons sebelum sampai ke kode Anda
api.interceptors.response.use(
  res => res,  // Jika sukses, teruskan respons apa adanya
  error => {
    // Jika error, ambil pesan error dari server dan lempar
    return Promise.reject(
      error.response?.data?.message || "Terjadi kesalahan"
    )
  }
)

export default api
```

### 📄 `app/_lib/rate-limit.ts`
```typescript
const map = new Map()  // Penyimpanan sementara (in-memory) per IP

export function rateLimit(ip: string) {
  const now = Date.now()
  const window = 60 * 1000  // Jendela waktu: 1 menit (60.000 ms)

  const record = map.get(ip)  // Ambil catatan IP ini

  // Jika belum ada catatan, atau sudah lewat 1 menit → reset
  if (!record || now - record.time > window) {
    map.set(ip, { count: 1, time: now })
    return true  // Izinkan akses
  }

  // Jika sudah lebih dari 5 kali dalam 1 menit → blokir
  if (record.count > 5) return false

  record.count++  // Tambah hitungan
  return true     // Masih diizinkan
}
```

---

## ✅ Validasi Input (_schemas)

### 📄 `app/_schemas/login-schema.ts`
```typescript
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),     // Harus format email yang benar
  password: z.string().min(6, "Minimal 6 karakter"), // Minimal 6 karakter
})

export type LoginSchema = z.infer<typeof loginSchema>
// z.infer menghasilkan TypeScript type dari schema Zod:
// type LoginSchema = { email: string; password: string }
```

### 📄 `app/_schemas/register-schema.ts`
```typescript
import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"), // Nama wajib ≥ 3 huruf
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
})

export type RegisterSchema = z.infer<typeof registerSchema>
// type RegisterSchema = { name: string; email: string; password: string }
```

---

## 🔄 Providers (Context React)

### 📄 `app/_providers/auth-provider.tsx`
```typescript
'use client'  // WAJIB: SessionProvider butuh interaksi browser

import { SessionProvider } from "next-auth/react"

// Komponen pembungkus yang menyediakan data session ke seluruh aplikasi
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>  {/* Semua child bisa akses useSession() */}
            {children}
        </SessionProvider>
    )
}
```

### 📄 `app/_providers/query-provider.tsx`
```typescript
"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()  // Instance tunggal untuk mengelola cache data

export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>  {/* Semua child bisa pakai useQuery() */}
      {children}
    </QueryClientProvider>
  )
}
```

---

## 🪝 Hooks Kustom (_hooks)

### 📄 `app/_hooks/use-auth.ts`
```typescript
"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()  // Ambil data session dari context

  return {
    user: session?.user,                          // Data user (nama, email, role)
    role: session?.user?.role,                    // Role saat ini
    isAdmin: session?.user?.role === "ADMIN",     // Boolean: apakah admin?
    isUser: session?.user?.role === "USER",       // Boolean: apakah user biasa?
    loading: status === "loading",                // Boolean: sedang memuat?
  }
}
```
**Cara pakai di komponen:**
```typescript
const { isAdmin, user, loading } = useAuth()
if (loading) return <p>Loading...</p>
if (isAdmin) return <AdminPanel />
```

---

## ⚡ API Backend

### 📄 `app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from "@/app/_lib/auth"

export const { GET, POST } = handlers
```
**Penjelasan**: File ini sangat pendek tapi sangat kuat. `[...nextauth]` adalah "catch-all route". Artinya url seperti `/api/auth/signin`, `/api/auth/signout`, `/api/auth/callback/google` SEMUA ditangani oleh satu file ini. `handlers` dari Auth.js otomatis menangani semuanya.

### 📄 `app/api/register/route.ts`
```typescript
import { prisma } from "@/app/_lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()  // Ambil data dari body request

    // Validasi: pastikan semua field ada
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ message: "Field tidak lengkap" }, { status: 400 })
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 })
    }

    // Hash password: 10 = jumlah salt rounds (standar industri)
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Simpan user baru ke database
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "USER",  // Semua user baru = USER (bukan ADMIN)
      },
    })

    return NextResponse.json(user)  // Return data user yang baru dibuat
  } catch (error: any) {
    console.error("REGISTRATION_ERROR:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", error: error.message },
      { status: 500 }
    )
  }
}
```

---

## 🎨 Halaman Publik

### 📄 `app/layout.tsx` (Root Layout)
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";  // Font modern dari Google
import { Toaster } from "sonner";                        // Toast notification
import QueryProvider from "./_providers/query-provider";  // React Query context
import AuthProvider from "./_providers/auth-provider";    // Auth session context
import "./globals.css";                                   // Styling global

// Definisikan font dengan CSS Variable
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Metadata SEO (judul tab browser, deskripsi Google)
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// Layout utama yang membungkus SELURUH aplikasi
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>        {/* Layer 1: Session tersedia di mana saja */}
          <QueryProvider>     {/* Layer 2: React Query tersedia di mana saja */}
            {children}        {/* Konten halaman aktual */}
          </QueryProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" />  {/* Toast muncul di kanan atas */}
      </body>
    </html>
  );
}
```

### 📄 `app/login/page.tsx`
```typescript
"use client"  // Client Component: butuh interaksi browser

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginSchema } from "@/app/_schemas/login-schema"
import { signIn } from "next-auth/react"       // Fungsi login Auth.js (client-side)
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Setup form dengan validasi Zod
    const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    })

    // Fungsi yang dipanggil saat form di-submit
    const onSubmit = async (data: LoginSchema) => {
        setLoading(true)
        // Panggil Auth.js credentials provider
        const res = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,  // Jangan redirect otomatis, kita handle sendiri
        })
        setLoading(false)

        if (res?.error) {
            toast.error("Login Gagal!")  // Tampilkan notifikasi error
            return
        }
        toast.success("Login Berhasil!")
        router.push("/dashboard")  // Pindah ke dashboard
    }

    // ... JSX: Form dengan input email, password, tombol Login, dan tombol Google SSO
    // Tombol Google: onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
}
```

### 📄 `app/register/page.tsx`
```typescript
"use client"

// ... import sama seperti login, ditambah axios

export default function RegisterPage() {
    const onSubmit = async (data: RegisterSchema) => {
        try {
            setLoading(true)
            await axios.post("/api/register", data)  // Step 1: Buat akun di database

            // Step 2: Kirim email verifikasi via Resend
            const res = await signIn("resend", {
                email: data.email,
                callbackUrl: "/dashboard",
                redirect: false
            })

            if (res?.error) {
                alert("Akun dibuat, tapi gagal mengirim email verifikasi: " + res.error)
            } else {
                alert("Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.")
            }

            router.push("/login")
        } catch (error: any) {
            alert("Register gagal: " + (error.response?.data?.message || error.message))
        } finally {
            setLoading(false)
        }
    }

    // ... JSX: Form dengan input nama, email, password, tombol Create Account, Google SSO
}
```

---

## 📊 Dashboard

### 📄 `app/dashboard/page.tsx` (Router/Redirector)
```typescript
import { auth } from "@/app/_lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()          // Ambil session di server

  if (!session) redirect("/login")      // Belum login → ke login

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin")        // Admin → halaman admin
  }

  redirect("/dashboard/user")           // User biasa → halaman user
}
```
**Penjelasan**: File ini TIDAK menampilkan apa-apa. Ia hanya berfungsi sebagai "router" yang mengarahkan user ke halaman yang tepat berdasarkan role mereka.

### 📄 `app/dashboard/layout.tsx` (Template Dashboard)
```typescript
// Server Component: mengambil session di server
export default async function DashboardLayout({ children }) {
    const session = await auth()
    if (!session) redirect("/api/auth/signin")

    const role = session.user.role

    // Menu navigasi yang berubah sesuai role
    const navItems = [
        {
            name: "Dashboard",
            href: role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user",
        },
        // Jika ADMIN: tampilkan "Kelola Barang"
        // Jika USER: tampilkan "Cari Barang"
        ...(role === "ADMIN"
            ? [{ name: "Kelola Barang", href: "/dashboard/admin/items" }]
            : [{ name: "Cari Barang", href: "/dashboard/user/items" }]
        )
    ]

    // JSX: Sidebar (desktop) + Mobile Header + Main Content area
    // Sidebar menampilkan: Logo, Menu navigasi, Info user, Tombol Logout
}
```

### 📄 `app/dashboard/_components/LogoutButton.tsx`
```typescript
'use client'  // Butuh onClick (interaksi browser)

import { signOut } from "next-auth/react"

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
            // signOut() menghapus session, lalu redirect ke halaman login
        >
            Keluar
        </button>
    )
}
```

### 📄 `app/dashboard/admin/page.tsx`
Halaman admin menampilkan 4 stat card (Total Barang, Request Baru, Barang Keluar, User Aktif) dan 2 panel: Request Menunggu dan Inventaris Terpopuler.

### 📄 `app/dashboard/user/page.tsx`
Halaman user menampilkan 3 stat card (Peminjaman Aktif, Menunggu Approval, Total Pinjaman) dan panel Peminjaman Terakhir.

---

## 🛡️ Middleware

### 📄 `proxy.ts`
```typescript
import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware yang dibungkus auth(): otomatis memeriksa session
export default auth((req: any) => {
    const isLoggedIn = !!req.auth  // Konversi session → boolean

    if (!isLoggedIn) {
        // Belum login? Redirect paksa ke halaman login!
        return NextResponse.redirect(new URL("/login", req.url))
    }
    // Jika sudah login, lanjutkan ke halaman tujuan (tidak return apa-apa)
})

// PENTING: matcher menentukan di mana middleware ini aktif
export const config = {
    matcher: ["/dashboard/:path*"]  // HANYA aktif untuk /dashboard dan semua sub-path
}
```

---

## 🔧 Skrip Utilitas

### 📄 `check-db.ts`
```typescript
import { prisma } from "./app/_lib/prisma"

async function checkSync() {
    try {
        const userCount = await prisma.user.count()       // Hitung jumlah user
        const accountCount = await prisma.account.count() // Hitung jumlah akun SSO
        const sessionCount = await prisma.session.count() // Hitung jumlah sesi aktif

        console.log("TABLE_STATUS: OK")
        console.log(`User count: ${userCount}`)
        // ... tampilkan semua hitungan
    } catch (error) {
        console.error("TABLE_STATUS: ERROR")
    } finally {
        await prisma.$disconnect()  // WAJIB: tutup koneksi setelah selesai
    }
}
checkSync()  // Jalankan langsung saat dieksekusi
```
**Cara pakai**: `npx tsx check-db.ts`

### 📄 `test-resend.ts`
```typescript
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    const data = await resend.emails.send({
        from: 'onboarding@resend.dev',     // Pengirim (trial)
        to: 'delivered@resend.dev',        // Penerima (tes Resend)
        subject: 'Test Email Verification',
        html: '<strong>It works!</strong>',
    });
    console.log("SUCCESS:", data);
}
testEmail();
```
**Cara pakai**: `npx tsx test-resend.ts`

---

## 🎨 Styling (CSS)

### 📄 `app/globals.css`
```css
@import "tailwindcss";    /* Mengaktifkan semua utility class Tailwind */

:root {
  --background: #ffffff;  /* Warna latar: putih */
  --foreground: #171717;  /* Warna teks: hitam gelap */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);  /* Font utama dari Google */
  --font-mono: var(--font-geist-mono);  /* Font kode dari Google */
}

/* Dark mode: otomatis aktif berdasarkan preferensi OS */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;  /* Latar gelap */
    --foreground: #ededed;  /* Teks terang */
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

---

## 🔁 ALUR KERJA LENGKAP

```
1. User buka /register
2. Isi form → Zod validasi input
3. Klik "Create Account" → POST /api/register
4. Server hash password → simpan ke DB
5. Client panggil signIn("resend") → Auth.js kirim email
6. User klik link di email → Auth.js verifikasi token
7. emailVerified di DB ter-update → User bisa login
8. User buka /login → isi form → signIn("credentials")
9. Auth.js cek password + emailVerified
10. Jika valid → JWT dibuat → redirect ke /dashboard
11. Middleware proxy.ts cek session → izinkan akses
12. Dashboard render berdasarkan role (ADMIN/USER)
```

---

> **Catatan Akhir**: Semua file di folder `app/generated/prisma/` adalah file yang di-generate otomatis oleh perintah `npx prisma generate`. Anda TIDAK PERLU mengedit file-file tersebut secara manual. Jika Anda mengubah `schema.prisma`, jalankan ulang `npx prisma generate` untuk memperbarui file-file tersebut.
