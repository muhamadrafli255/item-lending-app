import { auth } from "@/app/_lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import LogoutButton from "./_components/LogoutButton"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) redirect("/api/auth/signin")

    const role = session.user.role

    const navItems = [
        {
            name: "Dashboard",
            href: role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            )
        },
        ...(role === "ADMIN" ? [
            {
                name: "Kelola Barang",
                href: "/dashboard/admin/items", // Assuming this will exist
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
            }
        ] : [
            {
                name: "Cari Barang",
                href: "/dashboard/user/items", // Assuming this will exist
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            }
        ])
    ]

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617]">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        LendIt
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                        >
                            <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs text-uppercase">
                            {session.user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{session.user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.user.role}</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400">
                        LendIt
                    </Link>
                    <div className="flex items-center gap-4">
                        <LogoutButton />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
