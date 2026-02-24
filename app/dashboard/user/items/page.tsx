"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"

type Item = {
    id: string
    name: string
    description: string
    stock: number
    image: string | null
}

export default function UserItemsPage() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [borrowModal, setBorrowModal] = useState<Item | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetch("/api/items")
            .then((res) => res.json())
            .then(setItems)
            .catch(() => toast.error("Gagal memuat barang"))
            .finally(() => setLoading(false))
    }, [])

    const handleBorrow = async () => {
        if (!borrowModal) return
        setSubmitting(true)
        try {
            const res = await fetch("/api/loans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: borrowModal.id, quantity }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }
            toast.success(`Berhasil mengajukan peminjaman ${borrowModal.name}!`)
            setBorrowModal(null)
            setQuantity(1)
            // Refresh items
            const updated = await fetch("/api/items").then(r => r.json())
            setItems(updated)
        } catch (err: any) {
            toast.error(err.message || "Gagal mengajukan peminjaman")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cari Barang</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Pilih barang yang ingin Anda pinjam.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">📦</div>
                    <p className="text-slate-500 font-medium">Belum ada barang tersedia</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl">📦</div>
                                )}
                            </div>
                            {/* Content */}
                            <div className="p-5 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{item.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"}`}>
                                        {item.stock > 0 ? `Stok: ${item.stock}` : "Habis"}
                                    </span>
                                    <button
                                        onClick={() => { setBorrowModal(item); setQuantity(1) }}
                                        disabled={item.stock === 0}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Pinjam
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Borrow Modal */}
            {borrowModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBorrowModal(null)} />
                    <div className="relative bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ajukan Peminjaman</h2>
                            <button onClick={() => setBorrowModal(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            {borrowModal.image ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image src={borrowModal.image} alt={borrowModal.name} fill className="object-cover" sizes="64px" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                            )}
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{borrowModal.name}</p>
                                <p className="text-sm text-slate-500">Stok tersedia: {borrowModal.stock}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Jumlah yang dipinjam</label>
                            <input
                                type="number"
                                min={1}
                                max={borrowModal.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.min(Number(e.target.value), borrowModal.stock))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                            <p className="text-sm text-amber-700 dark:text-amber-400">⏳ Peminjaman akan menunggu persetujuan admin sebelum diproses.</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setBorrowModal(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Batal
                            </button>
                            <button onClick={handleBorrow} disabled={submitting || quantity < 1} className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                                {submitting ? "Mengajukan..." : "Ajukan Pinjam"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
