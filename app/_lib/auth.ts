import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"

declare module "next-auth" {
  interface User {
    role?: string
    image?: string | null
  }
  interface Session {
    user: {
      role?: string
      image?: string | null
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  debug: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider, theme }) {
        const { host } = new URL(url)
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: email,
            subject: `Verify your email for ${host}`,
            html: `
              <body style="background: #f9f9f9; font-family: sans-serif; padding: 40px 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <div style="background: #ffffff; max-width: 500px; width: 100%; border-radius: 20px; padding: 40px; border: 1px solid #eeeeee; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        <h1 style="color: #000; font-size: 24px; font-weight: bold; margin-bottom: 10px; text-align: center;">Verify Your Email</h1>
                        <p style="color: #666; font-size: 16px; line-height: 24px; text-align: center; margin-bottom: 30px;">
                          Welcome to <strong>LendGo</strong>! Please click the button below to secure your account and complete your registration.
                        </p>
                        <div style="text-align: center; margin-bottom: 30px;">
                          <a href="${url}" style="background: #000; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 500; font-size: 16px; display: inline-block;">Verify Email Address</a>
                        </div>
                        <div style="border-top: 1px solid #eeeeee; margin-top: 20px; padding-top: 20px;">
                          <p style="color: #999; font-size: 13px; text-align: center; line-height: 20px;">
                            If the button doesn't work, copy and paste this link into your browser:
                            <br />
                            <a href="${url}" style="color: #000; word-break: break-all;">${url}</a>
                          </p>
                        </div>
                      </div>
                      <p style="color: #ccc; font-size: 12px; text-align: center; margin-top: 20px;">
                        &copy; ${new Date().getFullYear()} LendGo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
            `,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(JSON.stringify(error))
        }
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error("User not found")
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error("Wrong password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow Google SSO without manual verification (Google verifies email)
      if (account?.provider === "google") return true

      // If using Resend (magic link), it's the verification itself
      if (account?.provider === "resend") return true

      /* 
      if (account?.provider === "credentials") {
        const dbUser = (await prisma.user.findUnique({
          where: { id: user.id },
        })) as any

        if (!dbUser?.emailVerified) {
          throw new Error("Email belum diverifikasi. Silakan cek email Anda.")
        }
      }
      */

      return true
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.role = user.role
        token.picture = user.image
      }
      // Re-read image from DB when session is updated (after profile change)
      if (trigger === "update" || trigger === "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { image: true, name: true, role: true },
        })
        if (dbUser) {
          token.picture = dbUser.image
          token.name = dbUser.name
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.image = token.picture as string | null
        if (token.sub) {
          session.user.id = token.sub
        }
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})