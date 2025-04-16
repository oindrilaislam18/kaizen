"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/context/auth-context"

export function AuthSessionProvider({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  )
}
