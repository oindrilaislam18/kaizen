"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("thisMonth")
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/analytics")

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch analytics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format data for charts
  const formatTasksByStatus = () => {
    if (!stats) return []

    return stats.tasksByStatus.map((item) => ({
      name:
        item.name === "todo"
          ? "To Do"
          : item.name === "in-progress"
            ? "In Progress"
            : item.name === "completed"
              ? "Completed"
              : item.name,
      value: item.value,
    }))
  }

  const formatTasksByPriority = () => {
    if (!stats) return []

    return stats.tasksByPriority.map((item) => ({
      name: item.name === "high" ? "High" : item.name === "medium" ? "Medium" : item.name === "low" ? "Low" : item.name,
      value: item.value,
    }))
  }

  const formatTasksByCategory = () => {
    if (!stats) return []

    return stats.tasksByCategory.map((item) => ({
      name: item.name || "Uncategorized",
      value: item.value,
    }))
  }

  const formatTaskCompletionData = () => {
    if (!stats) return []

    // Get the last 7 days
    const dates = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    // Format data for chart
    return dates.map((date) => {
      const created = stats.tasksCreatedPerDay.find((item) => item.name === date)?.value || 0
      const completed = stats.tasksCompletedPerDay.find((item) => item.name === date)?.value || 0

      return {
        name: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        created,
        completed,
      }
    })
  }

  const formatProductivityTrend = () => {
    if (!stats) return []

    // Get the last 4 weeks
    const weeks = []
    for (let i = 3; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i * 7)
      weeks.push(`Week ${4 - i}`)
    }

    // Calculate completed tasks per week (mock data for now)
    return weeks.map((week, index) => ({
      name: week,
      value: 5 + Math.floor(Math.random() * 10), // Mock data
    }))
  }

  if (isLoading || !stats) {
    return (
      <div className="container py-6">
        <div className="flex justify-center p-8">
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Link href="/dashboard/tasks">
              <Button size="lg" className="gap-1.5">
                Manage Tasks
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tasksByStatus.find((item) => item.name === "completed")?.value || 0} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTasks > 0
                  ? Math.round(
                    ((stats.tasksByStatus.find((item) => item.name === "completed")?.value || 0) / stats.totalTasks) *
                    100,
                  )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Based on total tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasksByCategory.length}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tasksByCategory
                  .slice(0, 2)
                  .map((item) => item.name)
                  .join(", ")}
                {stats.tasksByCategory.length > 2 ? ", ..." : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Status</CardTitle>
                  <CardDescription>Distribution of tasks by their current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart data={formatTasksByStatus()} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Priority</CardTitle>
                  <CardDescription>Distribution of tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart data={formatTasksByPriority()} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="productivity">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Task Completion Trend</CardTitle>
                  <CardDescription>Tasks created vs completed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart data={formatTaskCompletionData()} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Trend</CardTitle>
                  <CardDescription>Number of tasks completed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart data={formatProductivityTrend()} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                  <CardDescription>Percentage of tasks completed on time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart
                      data={[
                        { name: "On Time", value: 7 },
                        { name: "Late", value: 3 },
                        { name: "Very Late", value: 2 },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="categories">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Category</CardTitle>
                  <CardDescription>Distribution of tasks by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart data={formatTasksByCategory()} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Category Completion Rate</CardTitle>
                  <CardDescription>Completion rate by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart
                      data={formatTasksByCategory().map((item) => ({
                        name: item.name,
                        value: Math.round(Math.random() * 100), // Mock data for completion rate
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
