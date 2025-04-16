import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthSessionProvider } from "@/components/auth-session-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Kaizen - Task Management",
  description: "Efficiently organize, track, and manage your daily tasks",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="container mx-auto">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
