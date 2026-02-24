import { auth } from "@/app/_lib/auth"
import { prisma } from "@/app/_lib/prisma"
import Link from "next/link"

export default async function UserDashboard() {
  const session = await auth()

  if (!session?.user?.id) return null

  // Fetch real loan counts
  const loanStats = await prisma.loan.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: true,
  })

  const totalLoans = loanStats.reduce((sum, s) => sum + s._count, 0)
  const activeCount = loanStats.find((s) => s.status === "APPROVED")?._count || 0
  const pendingCount = loanStats.find((s) => s.status === "PENDING")?._count || 0

  // Recent loans
  const recentLoans = await prisma.loan.findMany({
    where: { userId: session.user.id },
    include: { item: { select: { name: true, image: true } } },
    orderBy: { borrowDate: "desc" },
    take: 5,
  })

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    APPROVED: { label: "Dipinjam", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    REJECTED: { label: "Ditolak", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400" },
    RETURNED: { label: "Dikembalikan", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
  }

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
          { label: "Peminjaman Aktif", value: String(activeCount), icon: "📦", color: "blue" },
          { label: "Menunggu Approval", value: String(pendingCount), icon: "⏳", color: "amber" },
          { label: "Total Pinjaman", value: String(totalLoans), icon: "📚", color: "emerald" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center text-2xl bg-slate-50 dark:bg-slate-800/50 rounded-xl">
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

      <div className="flex gap-4">
        <Link href="/dashboard/user/items" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          Cari Barang
        </Link>
        <Link href="/dashboard/user/loans" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
          Lihat Semua Peminjaman
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Peminjaman Terakhir</h2>
          <Link href="/dashboard/user/loans" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Lihat Semua</Link>
        </div>
        {recentLoans.length === 0 ? (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-2xl">📋</div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada riwayat peminjaman</p>
              <Link href="/dashboard/user/items" className="text-sm text-blue-600 hover:underline mt-2">Mulai pinjam barang →</Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentLoans.map((loan) => {
              const status = statusLabels[loan.status] || statusLabels.PENDING
              return (
                <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">📦</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{loan.item.name}</p>
                      <p className="text-xs text-slate-500">{loan.quantity} unit · {new Date(loan.borrowDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}