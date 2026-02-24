import { prisma } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

// GET: Ambil data profile user yang sedang login
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mengambil data profil", error: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update data profile
export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, image, currentPassword, newPassword } = body

        // Validasi nama
        if (name !== undefined && (!name || name.trim().length < 2)) {
            return NextResponse.json({ message: "Nama minimal 2 karakter" }, { status: 400 })
        }

        const updateData: any = {}

        if (name) updateData.name = name.trim()
        if (image !== undefined) updateData.image = image

        // Jika user ingin ganti password
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ message: "Password lama wajib diisi" }, { status: 400 })
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ message: "Password baru minimal 6 karakter" }, { status: 400 })
            }

            // Verifikasi password lama
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { password: true },
            })

            if (!user?.password) {
                return NextResponse.json({ message: "Akun ini tidak menggunakan password (login via Google)" }, { status: 400 })
            }

            const isValid = await bcrypt.compare(currentPassword, user.password)
            if (!isValid) {
                return NextResponse.json({ message: "Password lama tidak sesuai" }, { status: 400 })
            }

            updateData.password = await bcrypt.hash(newPassword, 10)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "Tidak ada data yang diubah" }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.error("UPDATE_PROFILE_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal mengupdate profil", error: error.message },
            { status: 500 }
        )
    }
}
