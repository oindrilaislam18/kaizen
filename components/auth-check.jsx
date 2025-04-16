"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function AuthCheck({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
      })
      router.push("/login")
    }
  }, [status, router, toast])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return children
}
