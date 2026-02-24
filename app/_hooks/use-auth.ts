"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    role: session?.user?.role,
    isAdmin: session?.user?.role === "ADMIN",
    isUser: session?.user?.role === "USER",
    loading: status === "loading",
  }
}