"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import Image from "next/image"

type Loan = {
    id: string
    quantity: number
    status: string
    borrowDate: string
    returnDate: string | null
    item: { id: string; name: string; image: string | null }
    user: { id: string; name: string; email: string }
}

const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
    APPROVED: { label: "Disetujui", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    REJECTED: { label: "Ditolak", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400" },
    RETURNED: { label: "Dikembalikan", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
}

export default function AdminLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("PENDING")
    const [processing, setProcessing] = useState<string | null>(null)

    const fetchLoans = useCallback(async () => {
        try {
            const url = filter ? `/api/loans?status=${filter}` : "/api/loans"
            const res = await fetch(url)
            const data = await res.json()
            setLoans(data)
        } catch {
            toast.error("Gagal memuat data peminjaman")
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => { fetchLoans() }, [fetchLoans])

    const handleAction = async (loanId: string, action: "approve" | "reject") => {
        setProcessing(loanId)
        try {
            const res = await fetch(`/api/loans/${loanId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }
            toast.success(action === "approve" ? "Peminjaman disetujui!" : "Peminjaman ditolak.")
            fetchLoans()
        } catch (err: any) {
            toast.error(err.message || "Gagal memproses peminjaman")
        } finally {
            setProcessing(null)
        }
    }

    const filters = [
        { value: "PENDING", label: "Menunggu", count: 0 },
        { value: "APPROVED", label: "Dipinjam" },
        { value: "RETURNED", label: "Dikembalikan" },
        { value: "REJECTED", label: "Ditolak" },
        { value: "", label: "Semua" },
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kelola Peminjaman</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Setujui, tolak, atau pantau semua peminjaman.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => { setFilter(f.value); setLoading(true) }}
                        className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${filter === f.value
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Loans List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            ) : loans.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">📋</div>
                    <p className="text-slate-500 font-medium">Tidak ada peminjaman{filter ? ` dengan status "${filters.find(f => f.value === filter)?.label}"` : ""}</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                                    <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Peminjam</th>
                                    <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Barang</th>
                                    <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Jumlah</th>
                                    <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Tanggal</th>
                                    <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="text-right p-4 font-semibold text-slate-600 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loans.map((loan) => {
                                    const status = statusConfig[loan.status] || statusConfig.PENDING
                                    return (
                                        <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                                                        {loan.user.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{loan.user.name}</p>
                                                        <p className="text-xs text-slate-500">{loan.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {loan.item.image ? (
                                                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                                            <Image src={loan.item.image} alt={loan.item.name} fill className="object-cover" sizes="32px" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">📦</div>
                                                    )}
                                                    <span className="text-slate-700 dark:text-slate-300">{loan.item.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-slate-700 dark:text-slate-300">{loan.quantity}</td>
                                            <td className="p-4 text-center text-slate-500 text-xs">
                                                {new Date(loan.borrowDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {loan.status === "PENDING" ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleAction(loan.id, "approve")}
                                                            disabled={processing === loan.id}
                                                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(loan.id, "reject")}
                                                            disabled={processing === loan.id}
                                                            className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {loans.map((loan) => {
                            const status = statusConfig[loan.status] || statusConfig.PENDING
                            return (
                                <div key={loan.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-xs font-semibold">
                                                {loan.user.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{loan.user.name}</p>
                                                <p className="text-xs text-slate-500">{loan.user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span>📦 {loan.item.name}</span>
                                        <span>·</span>
                                        <span>{loan.quantity} unit</span>
                                        <span>·</span>
                                        <span>{new Date(loan.borrowDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                                    </div>
                                    {loan.status === "PENDING" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(loan.id, "approve")}
                                                disabled={processing === loan.id}
                                                className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => handleAction(loan.id, "reject")}
                                                disabled={processing === loan.id}
                                                className="flex-1 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
