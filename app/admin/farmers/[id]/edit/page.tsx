"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Farmer {
  id: string
  name: string
  email: string
  phone_number: string
  address: string
}

export default function EditFarmerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Farmer>({
    id: "",
    name: "",
    email: "",
    phone_number: "",
    address: "",
  })

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const { data: farmer, error } = await supabase
          .from("farmers")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) throw error
        setFormData(farmer)
      } catch (error) {
        console.error("Error fetching farmer:", error)
        toast({
          title: "Error",
          description: "Failed to load farmer details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFarmer()
  }, [params.id, supabase])

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

      const { error } = await supabase
        .from("farmers")
        .update({
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          address: formData.address,
        })
        .eq("id", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Farmer updated successfully",
      })

      router.push(`/admin/farmers/${params.id}`)
    } catch (error) {
      console.error("Error updating farmer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update farmer",
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

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href={`/admin/farmers/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmer Details
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Edit Farmer</h1>
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
                onClick={() => router.push(`/admin/farmers/${params.id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 