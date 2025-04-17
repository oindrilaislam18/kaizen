"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Users, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CreateTeamDialog } from "@/components/create-team-dialog"
import { TeamCard } from "@/components/team-card"
import { useSession } from "next-auth/react"

export default function TeamPage() {
  const { toast } = useToast()
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [teams, setTeams] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const userId = session?.user?.id

  // Fetch teams on component mount
  useEffect(() => {
    if (session?.user) {
      fetchTeams()
    }
  }, [session])

  const fetchTeams = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/teams")

      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }

      const data = await response.json()
      setTeams(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch teams",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamCreated = (newTeam) => {
    setTeams((prevTeams) => [newTeam, ...prevTeams])
  }

  const handleTeamUpdated = (updatedTeam) => {
    setTeams((prevTeams) => prevTeams.map((team) => (team._id === updatedTeam._id ? updatedTeam : team)))
  }

  const handleTeamDeleted = (teamId) => {
    setTeams((prevTeams) => prevTeams.filter((team) => team._id !== teamId))
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Tasks</h1>
          <Button onClick={() => setIsCreateTeamOpen(true)} className="gap-1">
            <UserPlus className="h-4 w-4" />
            New Team
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search teams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="myTeams">
          <TabsList className="mb-4">
            <TabsTrigger value="myTeams">My Teams</TabsTrigger>
            <TabsTrigger value="joined">Joined Teams</TabsTrigger>
          </TabsList>
          <TabsContent value="myTeams">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading teams...</p>
              </div>
            ) : filteredTeams.filter((team) => team.ownerId === userId).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No teams found</h3>
                  <p className="text-muted-foreground mb-4">Create your first team to start collaborating</p>
                  <Button onClick={() => setIsCreateTeamOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams
                  .filter((team) => team.ownerId === userId)
                  .map((team) => (
                    <TeamCard
                      key={team._id}
                      team={team}
                      isOwner={true}
                      onTeamUpdated={handleTeamUpdated}
                      onTeamDeleted={handleTeamDeleted}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="joined">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading teams...</p>
              </div>
            ) : filteredTeams.filter((team) => team.ownerId !== userId).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No joined teams</h3>
                  <p className="text-muted-foreground">You haven't joined any teams yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams
                  .filter((team) => team.ownerId !== userId)
                  .map((team) => (
                    <TeamCard
                      key={team._id}
                      team={team}
                      isOwner={false}
                      onTeamUpdated={handleTeamUpdated}
                      onTeamDeleted={handleTeamDeleted}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <CreateTeamDialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen} onTeamCreated={handleTeamCreated} />
    </div>
  )
}
