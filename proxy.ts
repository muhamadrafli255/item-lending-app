import { auth } from "@/app/_lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url))
    }
})

export const config = {
    matcher: ["/dashboard/:path*"],
}
