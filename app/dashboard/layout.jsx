"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, CheckCircle, Clock, Home, Settings, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { AuthCheck } from "@/components/auth-check"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      name: "My Tasks",
      path: "/dashboard/tasks",
      icon: CheckCircle,
    },
    {
      name: "Team Tasks",
      path: "/dashboard/team",
      icon: Users,
    },
    {
      name: "Calendar",
      path: "/dashboard/calendar",
      icon: Clock,
    },
    {
      name: "Analytics",
      path: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const handleTaskCreated = (newTask) => {
    toast({
      title: "Task Created",
      description: "Your task has been created successfully",
    })
    // Redirect to tasks page if not already there
    if (pathname !== "/dashboard/tasks") {
      router.push("/dashboard/tasks")
    }
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold hidden md:inline-block">Kaizen</span>
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Logout
              </button>
            </form>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </div>
    </AuthCheck>
  )
}
