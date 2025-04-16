"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { TaskDetailsDialog } from "@/components/task-details-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TaskList({ tasks, emptyMessage = "No tasks found", onTaskUpdated, onTaskDeleted }) {
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [completedTasks, setCompletedTasks] = useState(
    tasks.reduce((acc, task) => {
      acc[task._id] = task.status === "completed"
      return acc
    }, {}),
  )

  // Update completedTasks when tasks prop changes
  useState(() => {
    setCompletedTasks(
      tasks.reduce((acc, task) => {
        acc[task._id] = task.status === "completed"
        return acc
      }, {}),
    )
  }, [tasks])

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-amber-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const handleStatusChange = async (id, checked) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: checked }))

    const taskToUpdate = tasks.find((task) => task._id === id)
    if (!taskToUpdate) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskToUpdate,
          status: checked ? "completed" : "todo",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      const updatedTask = await response.json()

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      })
      // Revert UI state if API call fails
      setCompletedTasks((prev) => ({ ...prev, [id]: !checked }))
    }
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleDeleteClick = (task) => {
    setTaskToDelete(task)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/tasks/${taskToDelete._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      if (onTaskDeleted) {
        onTaskDeleted(taskToDelete._id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md divide-y">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-muted/50",
              completedTasks[task._id] && "bg-muted/30",
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Checkbox
                checked={completedTasks[task._id]}
                onCheckedChange={(checked) => handleStatusChange(task._id, checked)}
                className="mr-2"
              />
              <div className="flex flex-col min-w-0">
                <span className={cn("font-medium truncate", completedTasks[task._id] && "line-through")}>
                  {task.title}
                </span>
                <span className="text-sm text-muted-foreground truncate">{task.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="outline">{task.category || "Uncategorized"}</Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "None"}
                </Badge>
              </div>
              <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignee?.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={task.assignee?.name || "Assignee"}
                />
                <AvatarFallback>{task.assignee?.initials || "?"}</AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(task)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          task={selectedTask}
          onTaskUpdated={onTaskUpdated}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
