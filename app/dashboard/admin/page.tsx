import { auth } from "@/app/_lib/auth"
import { prisma } from "@/app/_lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const session = await auth()

  // Fetch real counts from database
  const [itemCount, userCount, loanStats] = await Promise.all([
    prisma.item.count(),
    prisma.user.count(),
    prisma.loan.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  const pendingCount = loanStats.find((s) => s.status === "PENDING")?._count || 0
  const approvedCount = loanStats.find((s) => s.status === "APPROVED")?._count || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Pantau dan kelola seluruh aktivitas peminjaman barang.
          </p>
        </div>
        <Link
          href="/dashboard/admin/items"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          Kelola Barang
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Barang", value: String(itemCount), icon: "📊", color: "blue" },
          { label: "Request Baru", value: String(pendingCount), icon: "🔔", color: "rose" },
          { label: "Barang Keluar", value: String(approvedCount), icon: "📤", color: "indigo" },
          { label: "User Aktif", value: String(userCount), icon: "👥", color: "emerald" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-2xl mb-3">{stat.icon}</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Request Menunggu</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-full">{pendingCount} Baru</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {pendingCount === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Tidak ada request menunggu.</div>
            ) : (
              [1, 2, 3].slice(0, Math.min(pendingCount, 3)).map((i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">User {i}</p>
                      <p className="text-xs text-slate-500">Meminta Barang</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                    <button className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Inventaris Terpopuler</h2>
            <Link href="/dashboard/admin/items" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="p-6">
            {itemCount === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">Belum ada barang. <Link href="/dashboard/admin/items" className="text-blue-600 hover:underline">Tambah sekarang</Link></p>
            ) : (
              <div className="space-y-4">
                {['Macbook Pro M2', 'iPad Pro', 'Sony A7IV'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${80 - (idx * 15)}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">{12 - idx}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}