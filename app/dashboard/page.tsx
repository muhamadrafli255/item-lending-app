import { auth } from "@/app/_lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()

  if (!session) redirect("/login")

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin")
  }

  redirect("/dashboard/user")
}