import { prisma } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"

// PUT: Update status loan (approve/reject/return)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { action } = body  // "approve" | "reject" | "return"

        const loan = await prisma.loan.findUnique({
            where: { id },
            include: { item: true },
        })

        if (!loan) {
            return NextResponse.json({ message: "Peminjaman tidak ditemukan" }, { status: 404 })
        }

        // === APPROVE (admin only) ===
        if (action === "approve") {
            if (session.user.role !== "ADMIN") {
                return NextResponse.json({ message: "Hanya admin yang bisa approve" }, { status: 403 })
            }
            if (loan.status !== "PENDING") {
                return NextResponse.json({ message: "Hanya loan PENDING yang bisa di-approve" }, { status: 400 })
            }
            // Cek stok masih cukup
            if (loan.item.stock < loan.quantity) {
                return NextResponse.json({ message: `Stok tidak cukup. Tersedia: ${loan.item.stock}` }, { status: 400 })
            }

            // Kurangi stok & update status dalam satu transaksi
            const [updatedLoan] = await prisma.$transaction([
                prisma.loan.update({
                    where: { id },
                    data: { status: "APPROVED" },
                }),
                prisma.item.update({
                    where: { id: loan.itemId },
                    data: { stock: { decrement: loan.quantity } },
                }),
            ])

            return NextResponse.json(updatedLoan)
        }

        // === REJECT (admin only) ===
        if (action === "reject") {
            if (session.user.role !== "ADMIN") {
                return NextResponse.json({ message: "Hanya admin yang bisa reject" }, { status: 403 })
            }
            if (loan.status !== "PENDING") {
                return NextResponse.json({ message: "Hanya loan PENDING yang bisa di-reject" }, { status: 400 })
            }

            const updatedLoan = await prisma.loan.update({
                where: { id },
                data: { status: "REJECTED" },
            })

            return NextResponse.json(updatedLoan)
        }

        // === RETURN (user yang meminjam) ===
        if (action === "return") {
            if (loan.userId !== session.user.id && session.user.role !== "ADMIN") {
                return NextResponse.json({ message: "Anda tidak bisa mengembalikan peminjaman orang lain" }, { status: 403 })
            }
            if (loan.status !== "APPROVED") {
                return NextResponse.json({ message: "Hanya loan APPROVED yang bisa dikembalikan" }, { status: 400 })
            }

            // Kembalikan stok & update status + returnDate
            const [updatedLoan] = await prisma.$transaction([
                prisma.loan.update({
                    where: { id },
                    data: { status: "RETURNED", returnDate: new Date() },
                }),
                prisma.item.update({
                    where: { id: loan.itemId },
                    data: { stock: { increment: loan.quantity } },
                }),
            ])

            return NextResponse.json(updatedLoan)
        }

        return NextResponse.json({ message: "Action tidak valid. Gunakan: approve, reject, atau return" }, { status: 400 })
    } catch (error: any) {
        console.error("UPDATE_LOAN_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal mengupdate peminjaman", error: error.message },
            { status: 500 }
        )
    }
}
