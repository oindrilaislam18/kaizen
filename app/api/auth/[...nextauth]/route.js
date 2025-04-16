import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { comparePasswords } from "@/lib/auth-utils"

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials:", { email: !!credentials?.email, password: !!credentials?.password })
          return null
        }

        try {
          console.log("Login attempt:", credentials.email)

          // Get MongoDB client
          const client = await clientPromise
          const db = client.db("kaizen")

          // Get user from database
          const user = await db.collection("users").findOne({ email: credentials.email })

          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }

          console.log("User found:", user._id.toString())

          // Check password
          const isPasswordValid = await comparePasswords(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email)
            return null
          }

          console.log("Login successful for user:", credentials.email)

          // Return user object without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
