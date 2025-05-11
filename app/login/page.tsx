"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    // Check if Supabase is configured
    const checkSupabaseConfig = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Supabase session error:", error)
          setDebugInfo("Supabase configuration error: " + error.message)
        } else if (data.session) {
          console.log("User already logged in")
          router.push("/admin")
        }
      } catch (error) {
        console.error("Supabase check error:", error)
        setDebugInfo("Failed to check Supabase configuration")
      }
    }
    checkSupabaseConfig()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo("Attempting login...")

    try {
      console.log("Login attempt with email:", email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Login response:", { data, error })

      if (error) {
        throw error
      }

      if (!data.session) {
        throw new Error("No session created")
      }

      setDebugInfo("Login successful, redirecting...")
      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)
      setDebugInfo(`Login failed: ${error.message}`)
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif font-medium text-[#2D3047]">Ordlogic</CardTitle>
          <CardDescription>Admin Dashboard Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            {debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
                {debugInfo}
              </div>
            )}
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#97B980] hover:underline">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
