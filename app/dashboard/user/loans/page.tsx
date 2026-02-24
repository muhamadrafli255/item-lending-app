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
    item: { id: string; name: string; image: string | null; stock: number }
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", icon: "⏳" },
    APPROVED: { label: "Disetujui", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400", icon: "✅" },
    REJECTED: { label: "Ditolak", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400", icon: "❌" },
    RETURNED: { label: "Dikembalikan", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400", icon: "📦" },
}

export default function UserLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("")
    const [returning, setReturning] = useState<string | null>(null)

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

    const handleReturn = async (loanId: string) => {
        setReturning(loanId)
        try {
            const res = await fetch(`/api/loans/${loanId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "return" }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }
            toast.success("Barang berhasil dikembalikan!")
            fetchLoans()
        } catch (err: any) {
            toast.error(err.message || "Gagal mengembalikan barang")
        } finally {
            setReturning(null)
        }
    }

    const filters = [
        { value: "", label: "Semua" },
        { value: "PENDING", label: "Menunggu" },
        { value: "APPROVED", label: "Disetujui" },
        { value: "RETURNED", label: "Dikembalikan" },
        { value: "REJECTED", label: "Ditolak" },
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Peminjaman Saya</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Riwayat dan status peminjaman barang Anda.</p>
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
                    <p className="text-slate-500 font-medium">Belum ada peminjaman{filter ? ` dengan status "${filters.find(f => f.value === filter)?.label}"` : ""}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {loans.map((loan) => {
                        const status = statusConfig[loan.status] || statusConfig.PENDING
                        return (
                            <div key={loan.id} className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Item info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {loan.item.image ? (
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                                <Image src={loan.item.image} alt={loan.item.name} fill className="object-cover" sizes="56px" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">{loan.item.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {loan.quantity} unit · {new Date(loan.borrowDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                            {loan.returnDate && (
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Dikembalikan {new Date(loan.returnDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status + Action */}
                                    <div className="flex items-center gap-3 sm:flex-shrink-0">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                                            {status.icon} {status.label}
                                        </span>
                                        {loan.status === "APPROVED" && (
                                            <button
                                                onClick={() => handleReturn(loan.id)}
                                                disabled={returning === loan.id}
                                                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                            >
                                                {returning === loan.id ? "Proses..." : "Kembalikan"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
