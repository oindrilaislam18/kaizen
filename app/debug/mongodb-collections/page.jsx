"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function MongoDBCollectionsPage() {
  const { toast } = useToast()
  const [collections, setCollections] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchCollections() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/debug/mongodb-collections")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setCollections(data.collections || [])
      setUsers(data.users || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      toast({
        title: "Error",
        description: `Failed to fetch collections: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">MongoDB Collections Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Available collections in your MongoDB database</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading collections...</div>
            ) : error ? (
              <div className="text-destructive">Error: {error}</div>
            ) : collections.length === 0 ? (
              <div>No collections found in the database.</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {collections.map((collection, index) => (
                  <li key={index}>{collection}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users Collection</CardTitle>
            <CardDescription>Users stored in your database</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading users...</div>
            ) : error ? (
              <div className="text-destructive">Error: {error}</div>
            ) : users.length === 0 ? (
              <div>No users found in the database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">ID</th>
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="py-2 px-4">{user._id}</td>
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">
                          {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={fetchCollections} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Collections"}
        </Button>
      </div>
    </div>
  )
}
