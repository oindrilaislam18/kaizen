"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/analytics"
  const error = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  // Handle error from URL
  useState(() => {
    if (error) {
      setFormError(error === "CredentialsSignin" ? "Invalid email or password" : `Error: ${error}`)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setIsLoading(true)

    try {
      console.log("Attempting login with:", email)

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      })

      console.log("Login result:", result)

      if (result?.error) {
        setFormError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error)
        toast({
          title: "Error",
          description: result.error === "CredentialsSignin" ? "Invalid email or password" : result.error,
          variant: "destructive",
        })
      } else if (result?.url) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        })
        router.push(result.url)
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setFormError(`An unexpected error occurred: ${error.message}`)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">Kaizen</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
