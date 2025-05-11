"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebugInfo("Starting registration process...")

    if (password !== confirmPassword) {
      setDebugInfo("Password mismatch")
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      setDebugInfo("Password too short")
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      setDebugInfo("Sending registration request to Supabase...")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: 'admin'
          }
        }
      })

      console.log("Registration response:", { data, error })

      if (error) {
        throw error
      }

      if (data?.user?.identities?.length === 0) {
        setDebugInfo("Email already registered")
        toast({
          title: "Email already registered",
          description: "Please try logging in instead.",
          variant: "destructive",
        })
        return
      }

      setDebugInfo("Registration successful! Please check your email.")
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account. Check your spam folder if you don't see it.",
      })

      // Wait for 5 seconds before redirecting to login
      setTimeout(() => {
        router.push("/login")
      }, 5000)
    } catch (error: any) {
      console.error("Registration error:", error)
      setDebugInfo(`Registration failed: ${error.message}`)
      toast({
        title: "Registration failed",
        description: error.message || "Please check your details and try again.",
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
          <CardDescription>Create an admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
            {debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
                {debugInfo}
              </div>
            )}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#97B980] hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
