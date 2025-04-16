"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Filter, Plus, Search } from "lucide-react"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function TasksPage() {
  const { toast } = useToast()
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/tasks")

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
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

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks])
  }

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
  }

  const handleTaskDeleted = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "high") return matchesSearch && task.priority === "high"
    if (filter === "medium") return matchesSearch && task.priority === "medium"
    if (filter === "low") return matchesSearch && task.priority === "low"
    if (filter === "work") return matchesSearch && task.category === "Work"
    if (filter === "personal") return matchesSearch && task.category === "Personal"
    if (filter === "study") return matchesSearch && task.category === "Study"

    return matchesSearch
  })

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <Button onClick={() => setIsCreateTaskOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          <div>
          <Link href="/dashboard/analytics">
            <Button size="lg" className="gap-1.5">
              View Analytics
            </Button>
          </Link>
        </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>All Tasks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("high")}>High Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("medium")}>Medium Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("low")}>Low Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("work")}>Work</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("personal")}>Personal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("study")}>Study</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : (
              <Tabs defaultValue="todo">
                <TabsList className="mb-4">
                  <TabsTrigger value="todo">To Do</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="todo">
                  <TaskList
                    tasks={filteredTasks.filter((task) => task.status === "todo")}
                    emptyMessage="No to-do tasks found"
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                  />
                </TabsContent>
                <TabsContent value="in-progress">
                  <TaskList
                    tasks={filteredTasks.filter((task) => task.status === "in-progress")}
                    emptyMessage="No in-progress tasks found"
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                  />
                </TabsContent>
                <TabsContent value="completed">
                  <TaskList
                    tasks={filteredTasks.filter((task) => task.status === "completed")}
                    emptyMessage="No completed tasks found"
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                  />
                </TabsContent>
                <TabsContent value="all">
                  <TaskList
                    tasks={filteredTasks}
                    emptyMessage="No tasks found"
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} onTaskCreated={handleTaskCreated} />
    </div>
  )
}
