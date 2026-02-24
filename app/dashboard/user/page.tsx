import { auth } from "@/app/_lib/auth"

export default async function UserDashboard() {
  const session = await auth()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Selamat datang, {session?.user.name}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Apa yang ingin Anda pinjam hari ini?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Peminjaman Aktif", value: "2", icon: "📦", color: "blue" },
          { label: "Menunggu Approval", value: "1", icon: "⏳", color: "amber" },
          { label: "Total Pinjaman", value: "12", icon: "📚", color: "emerald" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center text-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/10 rounded-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Peminjaman Terakhir</h2>
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Lihat Semua</button>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada riwayat peminjaman</p>
          </div>
        </div>
      </div>
    </div>
  )
}