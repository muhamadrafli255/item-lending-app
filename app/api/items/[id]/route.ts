import { prisma } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"

// GET: Ambil detail satu barang by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                loans: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { borrowDate: "desc" },
                    take: 10,
                },
                _count: { select: { loans: true } },
            },
        })

        if (!item) {
            return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 })
        }

        return NextResponse.json(item)
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mengambil detail barang", error: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update barang (admin only)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()

        const existing = await prisma.item.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 })
        }

        const item = await prisma.item.update({
            where: { id },
            data: {
                name: body.name ?? existing.name,
                description: body.description ?? existing.description,
                stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
                image: body.image !== undefined ? body.image : existing.image,
            },
        })

        return NextResponse.json(item)
    } catch (error: any) {
        console.error("UPDATE_ITEM_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal mengupdate barang", error: error.message },
            { status: 500 }
        )
    }
}

// DELETE: Hapus barang (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const { id } = await params

        const existing = await prisma.item.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 })
        }

        await prisma.item.delete({ where: { id } })

        return NextResponse.json({ message: "Barang berhasil dihapus" })
    } catch (error: any) {
        console.error("DELETE_ITEM_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal menghapus barang", error: error.message },
            { status: 500 }
        )
    }
}
