"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function NewFarmerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      if (!formData.name || !formData.email) {
        throw new Error("Name and email are required")
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      const { error } = await supabase.from("farmers").insert([
        {
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          address: formData.address,
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Farmer added successfully",
      })

      router.push("/admin/farmers")
    } catch (error) {
      console.error("Error adding farmer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add farmer",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/admin/farmers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Add New Farmer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farmer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter farmer's name"
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter farmer's email"
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter farmer's phone number"
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter farmer's address"
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/farmers")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Farmer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 