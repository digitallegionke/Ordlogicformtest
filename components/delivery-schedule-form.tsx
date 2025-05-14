"use client"

import type React from "react"
import type { Database } from "@/types/supabase"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import OrderStatusModal from "@/components/ui/order-status-modal"

type Tables = Database['public']['Tables']
type ClientRow = Tables['clients']['Row']
type FarmerRow = Tables['farmers']['Row']
type ProduceRow = Tables['produce']['Row']
type DeliveryScheduleInsert = Tables['delivery_schedules']['Insert']

interface DeliveryEntry {
  id: number
  farmerId: string
  produceId: string
  produceNature: string
  expectedQuantity: number
  expectedQualityGrade: string
  dropoffLocation: string
  scheduledDeliveryDate: string
  specialNotes: string
  contactPerson: string
  contactPhone: string
}

interface DeliveryScheduleFormProps {
  clients: ClientRow[]
  farmers: FarmerRow[]
}

export default function DeliveryScheduleForm({ clients, farmers }: DeliveryScheduleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [clientId, setClientId] = useState<string>("")
  const [produceItems, setProduceItems] = useState<ProduceRow[]>([])
  const [entries, setEntries] = useState<DeliveryEntry[]>([{
    id: 1,
    farmerId: "",
    produceId: "",
    produceNature: "",
    expectedQuantity: 0,
    expectedQualityGrade: "",
    dropoffLocation: "",
    scheduledDeliveryDate: "",
    specialNotes: "",
    contactPerson: "",
    contactPhone: ""
  }])
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Fetch produce items on component mount
  useEffect(() => {
    const fetchProduceItems = async () => {
      console.log("Fetching produce items...")
      const { data, error } = await supabase
        .from("produce")
        .select("*")
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error fetching produce items:", error)
        toast({
          title: "Error",
          description: "Failed to load produce items. Please refresh the page.",
          variant: "destructive",
        })
      } else if (data) {
        console.log("Fetched produce items:", data)
        setProduceItems(data)
      }
    }

    fetchProduceItems()
  }, [])

  // Add debug log for produce items state
  useEffect(() => {
    console.log("Current produce items state:", produceItems)
  }, [produceItems])

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: entries.length + 1,
        farmerId: "",
        produceId: "",
        produceNature: "",
        expectedQuantity: 0,
        expectedQualityGrade: "",
        dropoffLocation: "",
        scheduledDeliveryDate: "",
        specialNotes: "",
        contactPerson: "",
        contactPhone: ""
      }
    ])
  }

  const handleEntryChange = (id: number, field: keyof DeliveryEntry, value: string | number) => {
    setEntries(entries.map((entry) => 
      entry.id === id 
        ? { ...entry, [field]: field === 'expectedQuantity' ? Number(value) : value }
        : entry
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!clientId) {
        throw new Error("Please select a client")
      }

      // Check for missing fields in each entry
      const missingFields: string[] = []
      entries.forEach((entry, index) => {
        if (!entry.farmerId) missingFields.push(`Entry ${index + 1}: Farmer`)
        if (!entry.produceId) missingFields.push(`Entry ${index + 1}: Produce`)
        if (!entry.expectedQuantity) missingFields.push(`Entry ${index + 1}: Expected Quantity`)
        if (!entry.scheduledDeliveryDate) missingFields.push(`Entry ${index + 1}: Scheduled Delivery Date`)
      })

      if (missingFields.length > 0) {
        throw new Error(`Please complete the following required fields:\n${missingFields.join('\n')}`)
      }

      const schedules: DeliveryScheduleInsert[] = entries
        .filter(entry => entry.farmerId && entry.produceId && entry.expectedQuantity && entry.scheduledDeliveryDate)
        .map(entry => {
          const selectedProduce = produceItems.find(p => p.id === entry.produceId)
          return {
            client_id: clientId,
            farmer_id: entry.farmerId,
            produce_id: entry.produceId,
            produce_type: selectedProduce?.name || "",
            produce_nature: entry.produceNature,
            expected_quantity: entry.expectedQuantity,
            expected_quality_grade: entry.expectedQualityGrade,
            dropoff_location: entry.dropoffLocation,
            scheduled_delivery_date: entry.scheduledDeliveryDate,
            special_notes: entry.specialNotes,
            contact_person: entry.contactPerson,
            contact_phone: entry.contactPhone,
            status: "pending"
          }
        })

      if (schedules.length > 0) {
        const { error: schedulesError } = await supabase
          .from("delivery_schedules")
          .insert(schedules)

        if (schedulesError) {
          console.error('Delivery schedules error:', schedulesError)
          throw new Error(`Failed to create delivery schedules: ${schedulesError.message}`)
        }
      }

      toast({
        title: "Success!",
        description: "Delivery schedules have been created.",
      })

      setModalState({
        isOpen: true,
        status: "success",
        title: "Schedules Created Successfully!",
        message: "The delivery schedules have been created and notifications will be sent to the relevant parties.",
      })

      setClientId("")
      setEntries([{
        id: 1,
        farmerId: "",
        produceId: "",
        produceNature: "",
        expectedQuantity: 0,
        expectedQualityGrade: "",
        dropoffLocation: "",
        scheduledDeliveryDate: "",
        specialNotes: "",
        contactPerson: "",
        contactPhone: ""
      }])

      router.refresh()
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery schedules.",
        variant: "destructive",
      })

      setModalState({
        isOpen: true,
        status: "error",
        title: "Schedule Creation Failed",
        message: error.message || "There was a problem creating the delivery schedules. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
                          <label className="text-sm font-medium text-[#5C6073]">Produce</label>
                          <Select
                            value={entry.produceId}
                            onValueChange={(value) => {
                              console.log("Selected produce value:", value)
                              handleEntryChange(entry.id, "produceId", value)
                            }}
                          >
                            <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                              <SelectValue placeholder="Select produce" />
                            </SelectTrigger>
                            <SelectContent>
                              {produceItems.length === 0 ? (
                                <SelectItem value="" disabled>No produce items available</SelectItem>
                              ) : (
                                produceItems.map((item) => {
                                  console.log("Rendering produce item:", item)
                                  return (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} ({item.unit})
                                    </SelectItem>
                                  )
                                })
                              )}
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
                          <label className="text-sm font-medium text-[#5C6073]">Expected Quantity</label>
                          <Input
                            type="number"
                            value={entry.expectedQuantity}
                            onChange={(e) => handleEntryChange(entry.id, "expectedQuantity", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter quantity"
                          />
                          {entry.produceId && (
                            <span className="text-sm text-[#5C6073]">
                              Unit: {produceItems.find(p => p.id === entry.produceId)?.unit || 'kg'}
                            </span>
                          )}
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
                              {["A", "B", "C"].map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  Grade {grade}
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

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#5C6073]">Contact Person</label>
                          <Input
                            type="text"
                            value={entry.contactPerson}
                            onChange={(e) => handleEntryChange(entry.id, "contactPerson", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter contact name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#5C6073]">Contact Phone</label>
                          <Input
                            type="tel"
                            value={entry.contactPhone}
                            onChange={(e) => handleEntryChange(entry.id, "contactPhone", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-[#5C6073]">Dropoff Location</label>
                          <Input
                            type="text"
                            value={entry.dropoffLocation}
                            onChange={(e) => handleEntryChange(entry.id, "dropoffLocation", e.target.value)}
                            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                            placeholder="Enter delivery address"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-[#5C6073]">Special Notes</label>
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
                {isSubmitting ? "Creating..." : "Create Schedule"}
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
