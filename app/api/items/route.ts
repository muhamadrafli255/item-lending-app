import { prisma } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"

// GET: Ambil semua barang
export async function GET() {
    try {
        const items = await prisma.item.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { loans: true } },
            },
        })
        return NextResponse.json(items)
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mengambil data barang", error: error.message },
            { status: 500 }
        )
    }
}

// POST: Tambah barang baru (admin only)
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const body = await req.json()

        if (!body.name || !body.description || body.stock === undefined) {
            return NextResponse.json({ message: "Field tidak lengkap" }, { status: 400 })
        }

        const item = await prisma.item.create({
            data: {
                name: body.name,
                description: body.description,
                stock: Number(body.stock),
                image: body.image || null,
            },
        })

        return NextResponse.json(item, { status: 201 })
    } catch (error: any) {
        console.error("CREATE_ITEM_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal menambah barang", error: error.message },
            { status: 500 }
        )
    }
}
