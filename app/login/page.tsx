"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginSchema } from "@/app/_schemas/login-schema"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginSchema) => {
        setLoading(true)

        const res = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        })

        setLoading(false)

        if (res?.error) {
            toast.error("Login Gagal!")
            return
        }

        toast.success("Login Berhasil!")
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white dark:bg-zinc-800 
               p-8 rounded-2xl shadow-xl border border-gray-100 
               dark:border-zinc-700 space-y-6 transition-all"
            >
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Login to continue 🚀
                    </p>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <input
                        {...register("email")}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 
                   dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700
                   focus:outline-none focus:ring-2 focus:ring-black 
                   dark:focus:ring-white transition"
                    />
                    <p className="text-red-500 text-xs">{errors.email?.message}</p>
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <input
                        type="password"
                        {...register("password")}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 
                   dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700
                   focus:outline-none focus:ring-2 focus:ring-black 
                   dark:focus:ring-white transition"
                    />
                    <p className="text-red-500 text-xs">{errors.password?.message}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <input type="checkbox" className="rounded border-gray-300" />
                        Remember me
                    </label>
                    <span className="text-black dark:text-white font-medium cursor-pointer hover:underline">
                        Forgot password?
                    </span>
                </div>

                <button
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-black text-white 
                 hover:opacity-90 active:scale-[0.98] 
                 transition-all duration-200 font-medium"
                >
                    {loading ? "Loading..." : "Login"}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100 dark:border-zinc-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-800 px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        type="button"
                        className="w-full inline-flex justify-center py-3 px-4 rounded-xl
                     border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700
                     hover:bg-gray-50 dark:hover:bg-zinc-600 transition-all font-medium text-sm"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>
                </div>

                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                    Don't have an account?
                    <Link href="/register">
                        <span className="ml-1 font-medium text-black dark:text-white cursor-pointer hover:underline">
                            Register
                        </span>
                    </Link>
                </p>
            </form>
        </div>
    )
}