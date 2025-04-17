"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Settings, Trash, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { TeamSettingsDialog } from "@/components/team-settings-dialog"
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
import Link from "next/link"
import { useSession } from "next-auth/react"

export function TeamCard({ team, isOwner, onTeamUpdated, onTeamDeleted }) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteTeam = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete team")
      }

      toast({
        title: "Success",
        description: "Team deleted successfully",
      })

      if (onTeamDeleted) {
        onTeamDeleted(team._id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleMemberRemoved = (memberId) => {
    const updatedTeam = {
      ...team,
      members: team.members.filter((member) => member.id !== memberId),
    }

    if (onTeamUpdated) {
      onTeamUpdated(updatedTeam)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{team.name}</CardTitle>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
          <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{team.members.length + 1} members</span>
          </div>
          <div className="mt-2 flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Owner" />
              <AvatarFallback>O</AvatarFallback>
            </Avatar>
            {team.members.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar || "/placeholder.svg?height=32&width=32"} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 3 && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>+{team.members.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <Link href={`/dashboard/team/${team._id}`} className="w-full">
            <Button className="w-full">View Team</Button>
          </Link>
        </CardFooter>
      </Card>

      {isOwner && (
        <>
          <TeamSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            team={team}
            onTeamUpdated={onTeamUpdated}
            onMemberRemoved={handleMemberRemoved}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the team and all associated tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTeam} disabled={isLoading}>
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  )
}
