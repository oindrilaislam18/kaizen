"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { Moon, Sun, Laptop } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch user profile and settings on component mount
  useEffect(() => {
    fetchUserProfile()
    fetchUserSettings()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      setUser(data)
      setProfileForm({
        name: data.name || "",
        email: data.email || "",
        avatar: data.avatar || "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user profile",
        variant: "destructive",
      })
    }
  }

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/settings")

      if (!response.ok) {
        throw new Error("Failed to fetch user settings")
      }

      const data = await response.json()
      setSettings(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSettingChange = (key, value) => {
    setSettings((prev) => {
      if (key.includes(".")) {
        const [section, setting] = key.split(".")
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [setting]: value,
          },
        }
      }
      return { ...prev, [key]: value }
    })
  }

  const saveProfile = async (e) => {
    e.preventDefault()

    if (!profileForm.name || !profileForm.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      // In a real app, you would make an API call to change the password
      // For now, we'll just simulate a successful password change

      setTimeout(() => {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        toast({
          title: "Success",
          description: "Password changed successfully",
        })

        setIsSaving(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      await response.json()

      // Update theme if it was changed
      if (settings.theme !== theme) {
        setTheme(settings.theme)
      }

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="container py-6">
        <div className="flex justify-center p-8">
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <form onSubmit={saveProfile}>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={profileForm.avatar || "/placeholder.svg?height=96&width=96"}
                        alt={profileForm.name}
                      />
                      <AvatarFallback>{profileForm.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <Input
                        id="avatar"
                        name="avatar"
                        placeholder="URL to your profile picture"
                        value={profileForm.avatar}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <form onSubmit={savePassword}>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Changing Password..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange("notifications.email", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange("notifications.push", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskReminders">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive reminders for upcoming tasks</p>
                  </div>
                  <Switch
                    id="taskReminders"
                    checked={settings.notifications.taskReminders}
                    onCheckedChange={(checked) => handleSettingChange("notifications.taskReminders", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="teamUpdates">Team Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for team activities</p>
                  </div>
                  <Switch
                    id="teamUpdates"
                    checked={settings.notifications.teamUpdates}
                    onCheckedChange={(checked) => handleSettingChange("notifications.teamUpdates", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize your display preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactView">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                  </div>
                  <Switch
                    id="compactView"
                    checked={settings.display.compactView}
                    onCheckedChange={(checked) => handleSettingChange("display.compactView", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showCompletedTasks">Show Completed Tasks</Label>
                    <p className="text-sm text-muted-foreground">Display completed tasks in task lists</p>
                  </div>
                  <Switch
                    id="showCompletedTasks"
                    checked={settings.display.showCompletedTasks}
                    onCheckedChange={(checked) => handleSettingChange("display.showCompletedTasks", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
