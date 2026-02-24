import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse delay-700"></div>

      <main className="z-10 flex flex-col items-center gap-12 px-6 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium tracking-wider text-zinc-400 uppercase backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Platform Aktif
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="text-zinc-400 block mb-2 font-medium text-3xl sm:text-4xl lg:text-5xl">
              Welcome to
            </span>
            <span className="bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-transparent">
              LendGo
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-zinc-500 sm:text-xl font-light leading-relaxed">
            Sistem Peminjaman Barang Modern.
            <br className="hidden sm:block" /> Pinjam apa yang Anda butuhkan, pinjamkan yang tidak Anda gunakan.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/login"
            className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-10 font-bold text-black transition-all hover:bg-zinc-200 active:scale-95 sm:w-52"
          >
            Masuk
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/register"
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-10 font-bold text-white backdrop-blur-xl transition-all hover:bg-white/10 active:scale-95 sm:w-52"
          >
            Daftar Akun
          </Link>
        </div>

        <div className="flex flex-col items-center gap-8 mt-4">
          <div className="flex -space-x-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#050505] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500"
              >
                USER
              </div>
            ))}
            <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-[#050505] bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-400">
              +10k
            </div>
          </div>
          <p className="text-sm text-zinc-500">Bergabung dengan ribuan peminjam lainnya.</p>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="absolute bottom-10 w-full px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium tracking-widest text-zinc-600 uppercase">
        <div>&copy; {new Date().getFullYear()} LendGo. Indonesia</div>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <span className="hover:text-zinc-400 cursor-pointer transition-colors text-zinc-700 font-bold">PREMIUM EDITION</span>
        </div>
      </footer>
    </div>
  );
}
