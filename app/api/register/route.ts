import { prisma } from "@/app/_lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ message: "Field tidak lengkap" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "USER",
        emailVerified: new Date(),
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("REGISTRATION_ERROR:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", error: error.message },
      { status: 500 }
    )
  }
}