// lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { connectDB } from "./db"
import { User } from "./models"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        console.log("password match", user)
        if (!user) return null

        console.log("not using bcrypt in development")
        const passwordMatch = credentials.password === "demo123" || user.password_hash === credentials.password

      if (!passwordMatch) return null;
        
        // if (process.env.NODE_ENV_TEST !== "production") {
        //   console.log("not using bcrypt in development")
        //   const passwordMatch = credentials.password === "demo123" || user.password_hash === credentials.password

        // if (!passwordMatch) return null;
        // } else if (process.env.NODE_ENV === "production") {
        //   if (!user.password_hash) return null
        //   const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash)
        //   if (!passwordMatch) return null
        // }
        

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production",
}
