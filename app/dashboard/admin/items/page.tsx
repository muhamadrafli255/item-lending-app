"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

type Item = {
    id: string
    name: string
    description: string
    stock: number
    image: string | null
    createdAt: string
    _count?: { loans: number }
}

export default function AdminItemsPage() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<Item | null>(null)

    // Form state
    const [form, setForm] = useState({ name: "", description: "", stock: 0, image: "" })
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch("/api/items")
            const data = await res.json()
            setItems(data)
        } catch {
            toast.error("Gagal memuat data barang")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    const openAddModal = () => {
        setEditingItem(null)
        setForm({ name: "", description: "", stock: 0, image: "" })
        setImagePreview(null)
        setModalOpen(true)
    }

    const openEditModal = (item: Item) => {
        setEditingItem(item)
        setForm({
            name: item.name,
            description: item.description,
            stock: item.stock,
            image: item.image || "",
        })
        setImagePreview(item.image)
        setModalOpen(true)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onload = (ev) => setImagePreview(ev.target?.result as string)
        reader.readAsDataURL(file)

        // Upload
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("/api/upload", { method: "POST", body: formData })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }
            const data = await res.json()
            setForm((prev) => ({ ...prev, image: data.url }))
            toast.success("Gambar berhasil diupload!")
        } catch (err: any) {
            toast.error(err.message || "Gagal mengupload gambar")
            setImagePreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.description) {
            toast.error("Nama dan deskripsi wajib diisi")
            return
        }
        setSubmitting(true)
        try {
            const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items"
            const method = editingItem ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, stock: Number(form.stock) }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }
            toast.success(editingItem ? "Barang berhasil diupdate!" : "Barang berhasil ditambahkan!")
            setModalOpen(false)
            fetchItems()
        } catch (err: any) {
            toast.error(err.message || "Terjadi kesalahan")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const res = await fetch(`/api/items/${deleteId}`, { method: "DELETE" })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }
            toast.success("Barang berhasil dihapus!")
            setDeleteId(null)
            fetchItems()
        } catch (err: any) {
            toast.error(err.message || "Gagal menghapus")
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kelola Barang</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Tambah, edit, dan hapus inventaris barang.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Tambah Barang
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Barang</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Stok</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.reduce((a, b) => a + b.stock, 0)}</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Stok Habis</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{items.filter(i => i.stock === 0).length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                        Memuat data...
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">📦</div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada barang</p>
                        <p className="text-sm text-slate-400 mt-1">Klik tombol &quot;Tambah Barang&quot; untuk mulai.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                                        <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Barang</th>
                                        <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-300">Deskripsi</th>
                                        <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Stok</th>
                                        <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300">Dipinjam</th>
                                        <th className="text-right p-4 font-semibold text-slate-600 dark:text-slate-300">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {item.image ? (
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">📦</div>
                                                    )}
                                                    <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{item.description}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"}`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-slate-500">{item._count?.loans || 0}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/dashboard/admin/items/${item.id}`} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Detail">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </Link>
                                                    <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                                                    </button>
                                                    <button onClick={() => setDeleteId(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Hapus">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {items.map((item) => (
                                <div key={item.id} className="p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        {item.image ? (
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.description}</p>
                                            <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${item.stock > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"}`}>
                                                Stok: {item.stock}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/admin/items/${item.id}`} className="flex-1 py-2 text-sm font-medium text-center text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-100 transition-colors">Detail</Link>
                                        <button onClick={() => openEditModal(item)} className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                                        <button onClick={() => setDeleteId(item.id)} className="flex-1 py-2 text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg hover:bg-rose-100 transition-colors">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gambar Barang</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                                >
                                    {imagePreview || form.image ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <Image
                                                src={imagePreview || form.image}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                sizes="400px"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">Ganti Gambar</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6">
                                            <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" /><line x1="16" x2="22" y1="5" y2="5" /><line x1="19" x2="19" y1="2" y2="8" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                            <p className="text-sm text-slate-500">Klik untuk upload gambar</p>
                                            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF (Max 5MB)</p>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-xl flex items-center justify-center">
                                            <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                {form.image && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setForm({ ...form, image: "" })
                                            setImagePreview(null)
                                        }}
                                        className="mt-2 text-xs text-rose-500 hover:underline"
                                    >
                                        Hapus gambar
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Barang</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Laptop Asus"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Deskripsi singkat barang..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Jumlah Stok</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={submitting || uploading} className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                                    {submitting ? "Menyimpan..." : editingItem ? "Update" : "Tambah"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 mx-auto bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hapus Barang?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tindakan ini tidak bisa dibatalkan.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Batal
                            </button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
