"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Client {
  id: string
  name: string
}

interface Farmer {
  id: string
  name: string
}

interface DeliveryScheduleFormProps {
  clients: Client[]
  farmers: Farmer[]
}

export default function DeliveryScheduleForm({ clients, farmers }: DeliveryScheduleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [clientId, setClientId] = useState<string>("")
  const [entries, setEntries] = useState([
    {
      id: 1,
      farmerId: "",
      produceType: "",
      produceNature: "",
      expectedQuantity: "",
      expectedQualityGrade: "",
      dropoffLocation: "",
      scheduledDeliveryDate: "",
      specialNotes: "",
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: entries.length + 1,
        farmerId: "",
        produceType: "",
        produceNature: "",
        expectedQuantity: "",
        expectedQualityGrade: "",
        dropoffLocation: "",
        scheduledDeliveryDate: "",
        specialNotes: "",
      },
    ])
  }

  const handleEntryChange = (id: number, field: string, value: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!clientId) {
        throw new Error("Please select a client")
      }

      // Validate at least one complete entry
      const hasCompleteEntry = entries.some(
        (entry) => entry.farmerId && entry.produceType && entry.expectedQuantity && entry.scheduledDeliveryDate,
      )

      if (!hasCompleteEntry) {
        throw new Error("Please complete at least one delivery entry")
      }

      // Create delivery schedules for each entry
      for (const entry of entries) {
        // Skip incomplete entries
        if (!entry.farmerId || !entry.produceType || !entry.expectedQuantity || !entry.scheduledDeliveryDate) {
          continue
        }

        const { error } = await supabase.from("delivery_schedules").insert({
          client_id: clientId,
          farmer_id: entry.farmerId,
          produce_type: entry.produceType,
          produce_nature: entry.produceNature,
          expected_quantity: Number.parseFloat(entry.expectedQuantity),
          expected_quality_grade: entry.expectedQualityGrade,
          dropoff_location: entry.dropoffLocation,
          scheduled_delivery_date: entry.scheduledDeliveryDate,
          special_notes: entry.specialNotes,
          status: "pending",
        })

        if (error) throw error
      }

      toast({
        title: "Success!",
        description: "Delivery schedule has been created.",
      })

      // Reset form
      setClientId("")
      setEntries([
        {
          id: 1,
          farmerId: "",
          produceType: "",
          produceNature: "",
          expectedQuantity: "",
          expectedQualityGrade: "",
          dropoffLocation: "",
          scheduledDeliveryDate: "",
          specialNotes: "",
        },
      ])

      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery schedule.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-8 border-b border-[#E8E4E0]">
        <h2 className="text-2xl font-serif font-medium text-[#2D3047] mb-2">Produce Delivery Schedule</h2>
        <p className="text-[#5C6073]">Schedule produce deliveries with detailed specifications for each item.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-8">
          {/* Client Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-medium text-[#2D3047]">Client Details</h3>
            <p className="text-[#5C6073] mb-4">Select the client for this delivery schedule.</p>

            <div className="max-w-md">
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Produce Entries */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-medium text-[#2D3047]">Produce Entries</h3>
            <p className="text-[#5C6073] mb-4">Add one or more produce items for delivery.</p>

            <div className="space-y-6">
              {entries.map((entry, index) => (
                <Card key={entry.id} className="border-[#E8E4E0] overflow-hidden">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-medium text-[#2D3047] mb-6">Entry {index + 1}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Farmer</label>
                        <Select
                          value={entry.farmerId}
                          onValueChange={(value) => handleEntryChange(entry.id, "farmerId", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select farmer" />
                          </SelectTrigger>
                          <SelectContent>
                            {farmers.map((farmer) => (
                              <SelectItem key={farmer.id} value={farmer.id}>
                                {farmer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Produce Type</label>
                        <Select
                          value={entry.produceType}
                          onValueChange={(value) => handleEntryChange(entry.id, "produceType", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["potato", "tomato", "carrot", "lettuce", "cucumber", "onion"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Produce Nature</label>
                        <Select
                          value={entry.produceNature}
                          onValueChange={(value) => handleEntryChange(entry.id, "produceNature", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select nature" />
                          </SelectTrigger>
                          <SelectContent>
                            {["organic", "conventional", "hydroponic", "biodynamic"].map((nature) => (
                              <SelectItem key={nature} value={nature}>
                                {nature.charAt(0).toUpperCase() + nature.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Expected Quantity (kg)</label>
                        <Input
                          type="number"
                          value={entry.expectedQuantity}
                          onChange={(e) => handleEntryChange(entry.id, "expectedQuantity", e.target.value)}
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Expected Quality Grade</label>
                        <Select
                          value={entry.expectedQualityGrade}
                          onValueChange={(value) => handleEntryChange(entry.id, "expectedQualityGrade", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Grade A", "Grade B", "Grade C", "Premium"].map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Drop-off Location</label>
                        <Select
                          value={entry.dropoffLocation}
                          onValueChange={(value) => handleEntryChange(entry.id, "dropoffLocation", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Warehouse A", "Warehouse B", "Market Center", "Distribution Hub"].map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5C6073]">Scheduled Delivery Date</label>
                        <Input
                          type="date"
                          value={entry.scheduledDeliveryDate}
                          onChange={(e) => handleEntryChange(entry.id, "scheduledDeliveryDate", e.target.value)}
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-[#5C6073]">Special Notes</label>
                        <Textarea
                          value={entry.specialNotes}
                          onChange={(e) => handleEntryChange(entry.id, "specialNotes", e.target.value)}
                          placeholder="Add any special notes or requirements..."
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                onClick={handleAddEntry}
                variant="outline"
                className="w-full border-dashed border-[#E8E4E0] hover:border-[#97B980] hover:bg-[#F8F5F2] text-[#5C6073]"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E8E4E0]">
          <Button
            type="submit"
            disabled={isSubmitting || !clientId || entries.some((e) => !e.farmerId)}
            className="px-8 py-6 bg-[#97B980] hover:bg-[#7A9968] text-white font-medium"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Delivery"}
          </Button>
        </div>
      </form>
    </div>
  )
}
