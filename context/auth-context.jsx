"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Update user state when session changes
  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
    } else {
      setLoading(false)
      setUser(session?.user || null)
    }
  }, [session, status])

  // Logout function
  const logout = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: "Success",
        description: "Logged out successfully",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    }
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
