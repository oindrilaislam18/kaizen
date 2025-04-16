"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TaskList } from "@/components/task-list"
import Link from "next/link"

export default function ProfilePage() {
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile and tasks on component mount
  useEffect(() => {
    fetchUserProfile()
    fetchUserTasks()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      setUser(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user profile",
        variant: "destructive",
      })
    }
  }

  const fetchUserTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/tasks")

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)

      // Calculate stats
      const completedTasks = data.filter((task) => task.status === "completed").length
      const inProgressTasks = data.filter((task) => task.status === "in-progress").length
      const pendingTasks = data.filter((task) => task.status === "todo").length

      setStats({
        totalTasks: data.length,
        completedTasks,
        inProgressTasks,
        pendingTasks,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))

    // Update stats
    const updatedTasks = tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    const completedTasks = updatedTasks.filter((task) => task.status === "completed").length
    const inProgressTasks = updatedTasks.filter((task) => task.status === "in-progress").length
    const pendingTasks = updatedTasks.filter((task) => task.status === "todo").length

    setStats({
      totalTasks: updatedTasks.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
    })
  }

  const handleTaskDeleted = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))

    // Update stats
    const updatedTasks = tasks.filter((task) => task._id !== taskId)
    const completedTasks = updatedTasks.filter((task) => task.status === "completed").length
    const inProgressTasks = updatedTasks.filter((task) => task.status === "in-progress").length
    const pendingTasks = updatedTasks.filter((task) => task.status === "todo").length

    setStats({
      totalTasks: updatedTasks.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
    })
  }

  if (!user) {
    return (
      <div className="container py-6">
        <div className="flex justify-center p-8">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=80&width=80"} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/settings">
            <Button className="gap-1">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>View and manage your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList className="mb-4">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="recent">
                <TaskList
                  tasks={tasks.slice(0, 5)}
                  emptyMessage="No recent tasks found"
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              </TabsContent>
              <TabsContent value="todo">
                <TaskList
                  tasks={tasks.filter((task) => task.status === "todo")}
                  emptyMessage="No to-do tasks found"
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              </TabsContent>
              <TabsContent value="in-progress">
                <TaskList
                  tasks={tasks.filter((task) => task.status === "in-progress")}
                  emptyMessage="No in-progress tasks found"
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              </TabsContent>
              <TabsContent value="completed">
                <TaskList
                  tasks={tasks.filter((task) => task.status === "completed")}
                  emptyMessage="No completed tasks found"
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
