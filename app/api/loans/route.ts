import { prisma } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"

// GET: Ambil daftar loan
// Admin = semua loan, User = hanya milik sendiri
export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status")  // filter by status (optional)

        const where: any = {}

        // User biasa hanya lihat milik sendiri
        if (session.user.role !== "ADMIN") {
            where.userId = session.user.id
        }

        if (status) {
            where.status = status
        }

        const loans = await prisma.loan.findMany({
            where,
            include: {
                item: { select: { id: true, name: true, image: true, stock: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { borrowDate: "desc" },
        })

        return NextResponse.json(loans)
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mengambil data peminjaman", error: error.message },
            { status: 500 }
        )
    }
}

// POST: User ajukan peminjaman baru
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        if (!body.itemId || !body.quantity) {
            return NextResponse.json({ message: "itemId dan quantity wajib diisi" }, { status: 400 })
        }

        const quantity = Number(body.quantity)
        if (quantity < 1) {
            return NextResponse.json({ message: "Jumlah minimal 1" }, { status: 400 })
        }

        // Cek stok barang
        const item = await prisma.item.findUnique({ where: { id: body.itemId } })
        if (!item) {
            return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 })
        }
        if (item.stock < quantity) {
            return NextResponse.json({ message: `Stok tidak mencukupi. Tersedia: ${item.stock}` }, { status: 400 })
        }

        const loan = await prisma.loan.create({
            data: {
                userId: session.user.id,
                itemId: body.itemId,
                quantity,
                status: "PENDING",
            },
            include: {
                item: { select: { name: true } },
            },
        })

        return NextResponse.json(loan, { status: 201 })
    } catch (error: any) {
        console.error("CREATE_LOAN_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal mengajukan peminjaman", error: error.message },
            { status: 500 }
        )
    }
}
