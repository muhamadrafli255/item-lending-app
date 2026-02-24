import { NextResponse } from "next/server"
import { auth } from "@/app/_lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
                { status: 400 }
            )
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: "Ukuran file maksimal 5MB" },
                { status: 400 }
            )
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads")
        await mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const ext = file.name.split(".").pop()
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const filePath = path.join(uploadsDir, uniqueName)

        // Write file to disk
        const bytes = await file.arrayBuffer()
        await writeFile(filePath, Buffer.from(bytes))

        // Return the public URL path
        const url = `/uploads/${uniqueName}`
        return NextResponse.json({ url, filename: uniqueName })
    } catch (error: any) {
        console.error("UPLOAD_ERROR:", error)
        return NextResponse.json(
            { message: "Gagal mengupload file", error: error.message },
            { status: 500 }
        )
    }
}
