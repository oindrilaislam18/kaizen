"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash } from "lucide-react"
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

export function TeamSettingsDialog({ open, onOpenChange, team, onTeamUpdated, onMemberRemoved }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [formData, setFormData] = useState({
    name: team?.name || "",
    description: team?.description || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          members: team.members,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update team")
      }

      const updatedTeam = await response.json()

      toast({
        title: "Success",
        description: "Team updated successfully",
      })

      // Close dialog and notify parent
      onOpenChange(false)
      if (onTeamUpdated) {
        onTeamUpdated(updatedTeam)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = (member) => {
    setMemberToRemove(member)
    setIsRemoveMemberDialogOpen(true)
  }

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/teams/${team._id}/members?memberId=${memberToRemove.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove team member")
      }

      toast({
        title: "Success",
        description: "Team member removed successfully",
      })

      if (onMemberRemoved) {
        onMemberRemoved(memberToRemove.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRemoveMemberDialogOpen(false)
      setMemberToRemove(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Team Settings</DialogTitle>
              <DialogDescription>Update your team settings and manage members.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter team description"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Owner" />
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">You</p>
                        <p className="text-xs text-muted-foreground">Owner</p>
                      </div>
                    </div>
                  </div>
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg?height=32&width=32"} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member)}
                        title="Remove member"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember} disabled={isLoading}>
              {isLoading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
