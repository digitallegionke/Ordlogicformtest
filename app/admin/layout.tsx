import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#F8F5F2]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
