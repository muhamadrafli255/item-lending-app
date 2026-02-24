import { auth } from "@/app/_lib/auth"
import { prisma } from "@/app/_lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function AdminDashboard() {
  const session = await auth()

  // Fetch real counts + pending loans + popular items
  const [itemCount, userCount, loanStats, pendingLoans, popularItems] = await Promise.all([
    prisma.item.count(),
    prisma.user.count(),
    prisma.loan.groupBy({
      by: ["status"],
      _count: true,
    }),
    // Ambil 5 request pending terbaru dengan data user & item
    prisma.loan.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        item: { select: { id: true, name: true, image: true } },
      },
      orderBy: { borrowDate: "desc" },
      take: 5,
    }),
    // Ambil item paling sering dipinjam (top 5)
    prisma.item.findMany({
      include: {
        _count: { select: { loans: true } },
      },
      orderBy: {
        loans: { _count: "desc" },
      },
      take: 5,
    }),
  ])

  const pendingCount = loanStats.find((s) => s.status === "PENDING")?._count || 0
  const approvedCount = loanStats.find((s) => s.status === "APPROVED")?._count || 0
  const maxLoans = popularItems.length > 0 ? Math.max(...popularItems.map(i => i._count.loans), 1) : 1

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
          { label: "Total Barang", value: String(itemCount), icon: "📊" },
          { label: "Request Baru", value: String(pendingCount), icon: "🔔" },
          { label: "Barang Keluar", value: String(approvedCount), icon: "📤" },
          { label: "User Aktif", value: String(userCount), icon: "👥" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-2xl mb-3">{stat.icon}</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Menunggu - REAL DATA */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Request Menunggu</h2>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-full">{pendingCount} Baru</span>
              )}
              <Link href="/dashboard/admin/loans" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Kelola</Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingLoans.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Tidak ada request menunggu. 🎉</div>
            ) : (
              pendingLoans.map((loan) => (
                <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    {loan.user.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={loan.user.image} alt={loan.user.name || ""} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm flex-shrink-0">
                        {loan.user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{loan.user.name || "User"}</p>
                      <p className="text-xs text-slate-500 truncate">
                        Meminta <span className="font-medium text-slate-700 dark:text-slate-300">{loan.item.name}</span> · {loan.quantity} unit
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/admin/loans"
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex-shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inventaris Terpopuler - REAL DATA */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Inventaris Terpopuler</h2>
            <Link href="/dashboard/admin/items" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="p-6">
            {popularItems.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">Belum ada barang. <Link href="/dashboard/admin/items" className="text-blue-600 hover:underline">Tambah sekarang</Link></p>
            ) : (
              <div className="space-y-4">
                {popularItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {/* Item Image */}
                    {item.image ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm flex-shrink-0">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                        <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{item._count.loans}x dipinjam</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item._count.loans / maxLoans) * 100}%` }}
                        />
                      </div>
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