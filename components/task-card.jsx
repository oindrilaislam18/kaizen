"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
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

export function TaskCard({ task, onTaskUpdated, onTaskDeleted }) {
  const { toast } = useToast()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(task.status === "completed")
  const [isLoading, setIsLoading] = useState(false)

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

  const handleStatusChange = async (checked) => {
    setIsCompleted(checked)

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...task,
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
      setIsCompleted(!checked)
    }
  }

  const handleDeleteTask = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
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
        onTaskDeleted(task._id)
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
    }
  }

  return (
    <>
      <Card className={cn(isCompleted && "opacity-60")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Checkbox checked={isCompleted} onCheckedChange={handleStatusChange} className="mt-1" />
              <CardTitle className={cn("text-base", isCompleted && "line-through")}>{task.title}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{task.category || "Uncategorized"}</Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "None"}
              </Badge>
            </div>
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={task.assignee?.avatar || "/placeholder.svg?height=32&width=32"}
                alt={task.assignee?.name || "Assignee"}
              />
              <AvatarFallback>{task.assignee?.initials || "?"}</AvatarFallback>
            </Avatar>
          </div>
        </CardFooter>
      </Card>

      <TaskDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={task}
        onTaskUpdated={onTaskUpdated}
      />

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
