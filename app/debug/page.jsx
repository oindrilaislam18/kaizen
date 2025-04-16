"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function DebugPage() {
  const { toast } = useToast()
  const [sessionData, setSessionData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchSessionData() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      setSessionData(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setSessionData(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function clearCookies() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: "Cookies Cleared",
        description: "All authentication cookies have been cleared",
      })
      fetchSessionData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear cookies: " + err.message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchSessionData()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading session data...</div>
            ) : error ? (
              <div className="text-destructive">Error: {error}</div>
            ) : (
              <div>
                <div className="mb-4">
                  <strong>Authenticated:</strong> {sessionData?.user ? "Yes" : "No"}
                </div>

                {sessionData?.user ? (
                  <div className="space-y-2">
                    <div>
                      <strong>User ID:</strong> {sessionData.user.id}
                    </div>
                    <div>
                      <strong>Name:</strong> {sessionData.user.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {sessionData.user.email}
                    </div>
                  </div>
                ) : (
                  <div>Not logged in</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4">
          <Button onClick={fetchSessionData} disabled={isLoading}>
            Refresh Session Data
          </Button>

          <Button variant="destructive" onClick={clearCookies}>
            Clear Auth Cookies
          </Button>

          <Button variant="outline" onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>

          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
