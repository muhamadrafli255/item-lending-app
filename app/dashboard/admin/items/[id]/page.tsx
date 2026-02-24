"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Loan = {
    id: string
    quantity: number
    status: string
    borrowDate: string
    returnDate: string | null
    user: { id: string; name: string; email: string }
}

type ItemDetail = {
    id: string
    name: string
    description: string
    stock: number
    image: string | null
    createdAt: string
    _count: { loans: number }
    loans: Loan[]
}

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
    RETURNED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
}

export default function ItemDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [item, setItem] = useState<ItemDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchItem() {
            try {
                const res = await fetch(`/api/items/${params.id}`)
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.message)
                }
                const data = await res.json()
                setItem(data)
            } catch (err: any) {
                setError(err.message || "Gagal memuat detail barang")
            } finally {
                setLoading(false)
            }
        }
        if (params.id) fetchItem()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (error || !item) {
        return (
            <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 mx-auto bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-2xl">❌</div>
                <p className="text-slate-500">{error || "Barang tidak ditemukan"}</p>
                <Link href="/dashboard/admin/items" className="text-blue-600 hover:underline text-sm">← Kembali ke daftar</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Back Button */}
            <Link href="/dashboard/admin/items" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                Kembali ke Daftar Barang
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Image & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Image */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {item.image ? (
                            <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                        ) : (
                            <div className="aspect-square w-full bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-3">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl">📦</div>
                                <p className="text-sm text-slate-400">Tidak ada gambar</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Informasi</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Stok Tersedia</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"}`}>
                                    {item.stock} unit
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Total Peminjaman</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{item._count.loans} kali</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Dibuat Pada</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details & Loan History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Description */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{item.name}</h1>
                                <p className="text-sm text-slate-500 mt-1">ID: {item.id}</p>
                            </div>
                            <Link
                                href="/dashboard/admin/items"
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                Edit
                            </Link>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Deskripsi</h3>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                        </div>
                    </div>

                    {/* Loan History */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Riwayat Peminjaman</h2>
                            <p className="text-sm text-slate-500 mt-0.5">10 peminjaman terakhir untuk barang ini</p>
                        </div>
                        {item.loans.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-xl">📋</div>
                                <p className="text-sm text-slate-400">Belum ada riwayat peminjaman</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {item.loans.map((loan) => (
                                    <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                                                {loan.user.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{loan.user.name}</p>
                                                <p className="text-xs text-slate-500">{new Date(loan.borrowDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {loan.quantity} unit</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[loan.status] || "bg-slate-100 text-slate-600"}`}>
                                            {loan.status}
                                        </span>
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
