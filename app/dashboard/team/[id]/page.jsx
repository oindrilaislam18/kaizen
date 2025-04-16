"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, UserPlus, Settings, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { AddTeamMemberDialog } from "@/components/add-team-member-dialog"
import { TeamSettingsDialog } from "@/components/team-settings-dialog"
import Link from "next/link"

export default function TeamDetailsPage() {
  const { toast } = useToast()
  const params = useParams()
  const teamId = params.id

  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch team and tasks on component mount
  useEffect(() => {
    if (teamId) {
      fetchTeam()
      fetchTeamTasks()
    }
  }, [teamId])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch team")
      }

      const data = await response.json()
      setTeam(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch team",
        variant: "destructive",
      })
    }
  }

  const fetchTeamTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/teams/${teamId}/tasks`)

      if (!response.ok) {
        throw new Error("Failed to fetch team tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch team tasks",
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

  const handleTeamUpdated = (updatedTeam) => {
    setTeam(updatedTeam)
  }

  const handleMemberAdded = (newMember) => {
    setTeam((prevTeam) => ({
      ...prevTeam,
      members: [...prevTeam.members, newMember],
    }))
  }

  const handleMemberRemoved = (memberId) => {
    setTeam((prevTeam) => ({
      ...prevTeam,
      members: prevTeam.members.filter((member) => member.id !== memberId),
    }))
  }

  const isOwner = team?.ownerId === "user123"

  if (!team) {
    return (
      <div className="container py-6">
        <div className="flex justify-center p-8">
          <p>Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/team">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground">{team.description}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{team.members.length + 1} members</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <Button onClick={() => setIsAddMemberOpen(true)} variant="outline" className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
                <Button onClick={() => setIsSettingsOpen(true)} variant="outline" className="gap-1">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </>
            )}
            <Button onClick={() => setIsCreateTaskOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Owner */}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Owner" />
                  <AvatarFallback>O</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium">You</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>

              {/* Members */}
              {team.members.map((member) => (
                <div key={member.id} className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar || "/placeholder.svg?height=64&width=64"} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <TaskList
                  tasks={tasks}
                  emptyMessage="No team tasks found"
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

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onTaskCreated={handleTaskCreated}
        teamId={teamId}
        teamMembers={[
          { id: "user123", name: "You (Owner)" },
          ...team.members.map((member) => ({ id: member.id, name: member.name })),
        ]}
      />

      {isOwner && (
        <>
          <AddTeamMemberDialog
            open={isAddMemberOpen}
            onOpenChange={setIsAddMemberOpen}
            teamId={teamId}
            onMemberAdded={handleMemberAdded}
          />
          <TeamSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            team={team}
            onTeamUpdated={handleTeamUpdated}
            onMemberRemoved={handleMemberRemoved}
          />
        </>
      )}
    </div>
  )
}
