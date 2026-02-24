"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useSession } from "next-auth/react"

type Profile = {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    createdAt: string
}

export default function ProfileSettingsPage() {
    const { update: updateSession } = useSession()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Form fields
    const [name, setName] = useState("")
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPasswordSection, setShowPasswordSection] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => {
                setProfile(data)
                setName(data.name || "")
                setImageUrl(data.image)
                setImagePreview(data.image)
            })
            .catch(() => toast.error("Gagal memuat profil"))
            .finally(() => setLoading(false))
    }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => setImagePreview(ev.target?.result as string)
        reader.readAsDataURL(file)

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
            setImageUrl(data.url)
            toast.success("Foto berhasil diupload!")
        } catch (err: any) {
            toast.error(err.message || "Gagal upload foto")
            setImagePreview(profile?.image || null)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!name.trim() || name.trim().length < 2) {
            toast.error("Nama minimal 2 karakter")
            return
        }

        if (showPasswordSection && newPassword) {
            if (newPassword.length < 6) {
                toast.error("Password baru minimal 6 karakter")
                return
            }
            if (newPassword !== confirmPassword) {
                toast.error("Konfirmasi password tidak cocok")
                return
            }
            if (!currentPassword) {
                toast.error("Password lama wajib diisi")
                return
            }
        }

        setSaving(true)
        try {
            const body: any = { name: name.trim(), image: imageUrl }
            if (showPasswordSection && newPassword) {
                body.currentPassword = currentPassword
                body.newPassword = newPassword
            }

            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message)
            }

            const updated = await res.json()
            setProfile({ ...profile!, ...updated })
            toast.success("Profil berhasil diupdate!")

            // Update session supaya sidebar langsung berubah
            await updateSession({ name: updated.name, image: updated.image })

            // Reset password fields
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setShowPasswordSection(false)
        } catch (err: any) {
            toast.error(err.message || "Gagal mengupdate profil")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pengaturan Profil</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Cover / Photo Section */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600">
                    <div className="absolute -bottom-12 left-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-24 h-24 rounded-2xl border-4 border-white dark:border-[#0f172a] overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group shadow-lg"
                        >
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Profile" fill className="object-cover" sizes="96px" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                                    {name?.charAt(0) || "U"}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
                                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
                    </div>
                </div>

                <div className="pt-16 px-6 pb-6 space-y-6">
                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                            {profile?.role === "ADMIN" ? "Administrator" : "User"}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Bergabung {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                        </span>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                placeholder="Nama Anda"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                            <input
                                value={profile?.email || ""}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed text-sm"
                            />
                            <p className="text-xs text-slate-400 mt-1.5">Email tidak dapat diubah.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ubah Password</p>
                            <p className="text-xs text-slate-500">Perbarui kata sandi akun Anda</p>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${showPasswordSection ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                </button>

                {showPasswordSection && (
                    <div className="px-6 pb-6 space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password Lama</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                placeholder="Masukkan password lama"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                placeholder="Minimal 6 karakter"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                placeholder="Ulangi password baru"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="px-8 py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
    )
}
