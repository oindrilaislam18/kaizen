"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function MongoDBDebugPage() {
  const { toast } = useToast()
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionString, setConnectionString] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function testConnection() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/test-mongodb")
      const data = await res.json()
      setConnectionStatus(data)
    } catch (err) {
      setConnectionStatus({
        status: "error",
        message: "Request failed",
        error: err.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">MongoDB Connection Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current MongoDB connection status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Testing connection...</div>
            ) : connectionStatus ? (
              <div>
                <div className="mb-4">
                  <strong>Status:</strong>{" "}
                  <span className={connectionStatus.status === "success" ? "text-green-500" : "text-red-500"}>
                    {connectionStatus.status}
                  </span>
                </div>

                <div className="mb-4">
                  <strong>Message:</strong> {connectionStatus.message}
                </div>

                {connectionStatus.version && (
                  <div className="mb-4">
                    <strong>MongoDB Version:</strong> {connectionStatus.version}
                  </div>
                )}

                {connectionStatus.connection && (
                  <div className="mb-4">
                    <strong>Connection:</strong> {connectionStatus.connection.host} (
                    {connectionStatus.connection.readPreference})
                  </div>
                )}

                {connectionStatus.details && (
                  <div className="mb-4">
                    <strong>Details:</strong> {connectionStatus.details}
                  </div>
                )}

                {connectionStatus.error && (
                  <div className="mb-4">
                    <strong>Error:</strong> {connectionStatus.error}
                  </div>
                )}
              </div>
            ) : (
              <div>No connection data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Help</CardTitle>
            <CardDescription>
              If you're having trouble connecting to MongoDB, check your connection string in .env.local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2">Your MongoDB connection string should look like this:</p>
                <code className="block p-2 bg-muted rounded-md">
                  mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
                </code>
              </div>

              <div>
                <p className="mb-2">Common issues:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Username or password is incorrect</li>
                  <li>Special characters in password need to be URL encoded</li>
                  <li>IP address is not whitelisted in MongoDB Atlas</li>
                  <li>Database user doesn't have the right permissions</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button onClick={testConnection} disabled={isLoading}>
                  {isLoading ? "Testing..." : "Test Connection Again"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
