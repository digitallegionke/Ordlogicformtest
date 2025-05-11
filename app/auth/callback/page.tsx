"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          // User is confirmed and logged in
          router.push("/admin")
        } else {
          // No session, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Error in email confirmation:", error)
        router.push("/login")
      }
    }

    handleEmailConfirmation()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
      <div className="text-center">
        <h2 className="text-2xl font-medium mb-2">Confirming your email...</h2>
        <p className="text-gray-600">Please wait while we verify your email address.</p>
      </div>
    </div>
  )
} 