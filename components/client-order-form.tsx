"use client"

import type React from "react"
import type { Database } from "@/types/supabase"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import OrderStatusModal from "@/components/ui/order-status-modal"

type Tables = Database['public']['Tables']
type ClientInsert = Tables['clients']['Insert']
type ClientRow = Tables['clients']['Row']
type DeliveryScheduleInsert = Tables['delivery_schedules']['Insert']

interface ClientInfo {
  name: string
  email: string
  phone_number: string | null
}

interface OrderEntry {
  id: number
  farmerId: string
  produceType: string
  produceNature: string
  expectedQuantity: number
  expectedQualityGrade: string
  dropoffLocation: string
  scheduledDeliveryDate: string
  contactPerson: string
  contactPhone: string
  specialNotes: string
}

interface ClientOrderFormProps {
  farmers: { id: string; name: string }[]
  dropoffLocations?: string[]
}

export default function ClientOrderForm({
  farmers = [],
  dropoffLocations = ["Warehouse A", "Warehouse B", "Market Center", "Distribution Hub"],
}: ClientOrderFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone_number: null
  })
  const [entries, setEntries] = useState<OrderEntry[]>([
    {
      id: 1,
      farmerId: "",
      produceType: "",
      produceNature: "",
      expectedQuantity: 0,
      expectedQualityGrade: "",
      dropoffLocation: "",
      scheduledDeliveryDate: "",
      contactPerson: "",
      contactPhone: "",
      specialNotes: "",
    },
  ])
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    status: "success" | "error"
    title: string
    message: string
  }>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  })

  const handleClientInfoChange = (field: keyof ClientInfo, value: string) => {
    setClientInfo((prev) => ({
      ...prev,
      [field]: field === 'phone_number' ? (value || null) : value
    }))
  }

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: entries.length + 1,
        farmerId: "",
        produceType: "",
        produceNature: "",
        expectedQuantity: 0,
        expectedQualityGrade: "",
        dropoffLocation: "",
        scheduledDeliveryDate: "",
        contactPerson: "",
        contactPhone: "",
        specialNotes: "",
      },
    ])
  }

  const handleRemoveEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id))
    }
  }

  const handleEntryChange = (id: number, field: string, value: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!clientInfo.name || !clientInfo.email) {
        throw new Error("Please provide your name and email address")
      }

      const hasCompleteEntry = entries.some(
        (entry) => entry.farmerId && entry.produceType && entry.expectedQuantity && entry.scheduledDeliveryDate
      )

      if (!hasCompleteEntry) {
        throw new Error("Please complete at least one order entry")
      }

      let clientId: string

      // Look up client by email
      const { data: existingClient, error: clientLookupError } = await supabase
        .from("clients")
        .select()
        .eq("email", clientInfo.email)
        .single()

      if (clientLookupError && clientLookupError.code !== 'PGRST116') {
        console.error('Client lookup error:', clientLookupError)
        throw new Error(`Failed to look up client: ${clientLookupError.message}`)
      }

      if (existingClient) {
        clientId = existingClient.id
        console.log('Using existing client:', clientId)

        const { error: updateError } = await supabase
          .from("clients")
          .update({
            name: clientInfo.name,
            phone_number: clientInfo.phone_number
          } as Tables['clients']['Update'])
          .eq("id", clientId)

        if (updateError) {
          console.error('Client update error:', updateError)
          throw new Error(`Failed to update client: ${updateError.message}`)
        }
      } else {
        console.log('Creating new client:', clientInfo)
        
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            name: clientInfo.name,
            email: clientInfo.email,
            phone_number: clientInfo.phone_number
          } as Tables['clients']['Insert'])
          .select()
          .single()

        if (clientError) {
          console.error('Client creation error:', clientError)
          throw new Error(`Failed to create client: ${clientError.message}`)
        }

        if (!newClient) {
          throw new Error("Failed to create client: No client ID returned")
        }

        clientId = newClient.id
      }

      const schedules: Tables['delivery_schedules']['Insert'][] = entries
        .filter(entry => entry.farmerId && entry.produceType && entry.expectedQuantity && entry.scheduledDeliveryDate)
        .map(entry => ({
          client_id: clientId,
          farmer_id: entry.farmerId,
          produce_type: entry.produceType,
          produce_nature: entry.produceNature,
          expected_quantity: entry.expectedQuantity,
          expected_quality_grade: entry.expectedQualityGrade,
          dropoff_location: entry.dropoffLocation,
          scheduled_delivery_date: entry.scheduledDeliveryDate,
          special_notes: entry.specialNotes,
          contact_person: entry.contactPerson,
          contact_phone: entry.contactPhone,
          status: "pending"
        }))

      if (schedules.length > 0) {
        const { error: schedulesError } = await supabase
          .from("delivery_schedules")
          .insert(schedules)

        if (schedulesError) {
          console.error('Delivery schedules error:', schedulesError)
          throw new Error(`Failed to create delivery schedules: ${schedulesError.message}`)
        }
      }

      // Show both toast and modal for success
      toast({
        title: "Success!",
        description: "Your order has been submitted successfully.",
      })

      setModalState({
        isOpen: true,
        status: "success",
        title: "Order Submitted Successfully!",
        message: "Your delivery schedule has been created. You will receive a confirmation email shortly.",
      })

      setClientInfo({
        name: "",
        email: "",
        phone_number: null
      })
      setEntries([{
        id: 1,
        farmerId: "",
        produceType: "",
        produceNature: "",
        expectedQuantity: 0,
        expectedQualityGrade: "",
        dropoffLocation: "",
        scheduledDeliveryDate: "",
        contactPerson: "",
        contactPhone: "",
        specialNotes: ""
      }])

      router.refresh()
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      // Show both toast and modal for error
      toast({
        title: "Error",
        description: error.message || "Failed to submit order.",
        variant: "destructive",
      })

      setModalState({
        isOpen: true,
        status: "error",
        title: "Order Submission Failed",
        message: error.message || "There was a problem submitting your order. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add validation for certification format
  const validateCertifications = (certs: string) => {
    const certArray = certs.split(',').map(cert => cert.trim());
    return certArray.every(cert => cert.length > 0);
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#E8E4E0]">
          <h2 className="text-2xl font-serif font-medium text-[#2D3047] mb-2">Schedule Delivery</h2>
          <p className="text-[#5C6073]">Schedule your produce delivery with detailed specifications.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-medium text-[#2D3047]">Client Information</h3>
              <p className="text-[#5C6073] mb-4">Please provide your contact information.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Name</Label>
                  <Input
                    id="clientName"
                    value={clientInfo.name}
                    onChange={(e) => handleClientInfoChange("name", e.target.value)}
                    placeholder="Your full name"
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => handleClientInfoChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientInfo.phone_number || ""}
                    onChange={(e) => handleClientInfoChange("phone_number", e.target.value)}
                    placeholder="Your phone number"
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                </div>
              </div>
            </div>

            {/* Order Entries */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-medium text-[#2D3047]">Delivery Details</h3>
              <p className="text-[#5C6073] mb-4">Add one or more items to your delivery schedule.</p>

              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <Card key={entry.id} className="border-[#E8E4E0] overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium text-[#2D3047]">Entry {index + 1}</h4>
                        {entries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Farmer</Label>
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
                          <Label>Produce Type</Label>
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
                          <Label>Produce Nature</Label>
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
                          <Label>Expected Quantity (kg)</Label>
                          <Input
                            type="number"
                            value={entry.expectedQuantity.toString()}
                            onChange={(e) => handleEntryChange(entry.id, "expectedQuantity", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter quantity"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expected Quality Grade</Label>
                          <Select
                            value={entry.expectedQualityGrade}
                            onValueChange={(value) => handleEntryChange(entry.id, "expectedQualityGrade", value)}
                          >
                            <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {["A", "B", "C"].map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  Grade {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Drop-off Location</Label>
                          <Select
                            value={entry.dropoffLocation}
                            onValueChange={(value) => handleEntryChange(entry.id, "dropoffLocation", value)}
                          >
                            <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {dropoffLocations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Scheduled Delivery Date</Label>
                          <Input
                            type="date"
                            value={entry.scheduledDeliveryDate}
                            onChange={(e) => handleEntryChange(entry.id, "scheduledDeliveryDate", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Contact Person</Label>
                          <Input
                            value={entry.contactPerson}
                            onChange={(e) => handleEntryChange(entry.id, "contactPerson", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter contact person"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Contact Phone</Label>
                          <Input
                            value={entry.contactPhone}
                            onChange={(e) => handleEntryChange(entry.id, "contactPhone", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter contact phone"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Special Notes</Label>
                          <Textarea
                            value={entry.specialNotes}
                            onChange={(e) => handleEntryChange(entry.id, "specialNotes", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter any special requirements or notes"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddEntry}
                className="w-full border-dashed"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Entry
              </Button>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Schedule"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <OrderStatusModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        status={modalState.status}
        title={modalState.title}
        message={modalState.message}
      />
    </>
  )
}
