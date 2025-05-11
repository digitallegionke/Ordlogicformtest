"use client"

import type React from "react"

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

interface OrderEntry {
  id: number
  farmerId: string
  produceType: string
  produceNature: string
  expectedQuantity: string
  expectedQualityGrade: string
  dropoffLocation: string
  scheduledDeliveryDate: string
  specialNotes: string
  packagingType: string
  storageRequirements: string
  transportationMode: string
  pricePerUnit: string
  paymentTerms: string
  certifications: string
  inspectionRequirements: string
  deliveryFrequency: string
  contractDuration: string
}

interface ClientOrderFormProps {
  farmers: { id: string; name: string }[]
  dropoffLocations?: string[]
}

export default function ClientOrderForm({
  farmers = [],
  dropoffLocations = ["Warehouse A", "Warehouse B", "Market Center", "Distribution Hub"],
}: ClientOrderFormProps) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    organization: "",
  })
  const [entries, setEntries] = useState<OrderEntry[]>([
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
      packagingType: "",
      storageRequirements: "",
      transportationMode: "",
      pricePerUnit: "",
      paymentTerms: "",
      certifications: "",
      inspectionRequirements: "",
      deliveryFrequency: "",
      contractDuration: "",
    },
  ])

  const handleClientInfoChange = (field: string, value: string) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }))
  }

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
        packagingType: "",
        storageRequirements: "",
        transportationMode: "",
        pricePerUnit: "",
        paymentTerms: "",
        certifications: "",
        inspectionRequirements: "",
        deliveryFrequency: "",
        contractDuration: "",
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
      // Validate client info
      if (!clientInfo.name || !clientInfo.email) {
        throw new Error("Please provide your name and email address")
      }

      // Validate at least one complete entry
      const hasCompleteEntry = entries.some(
        (entry) => entry.farmerId && entry.produceType && entry.expectedQuantity && entry.scheduledDeliveryDate,
      )

      if (!hasCompleteEntry) {
        throw new Error("Please complete at least one order entry")
      }

      // Check if client exists or create new client
      let clientId: string

      // Look up client by email
      const { data: existingClients } = await supabase
        .from("clients")
        .select("id")
        .eq("email", clientInfo.email)
        .limit(1)

      if (existingClients && existingClients.length > 0) {
        // Use existing client
        clientId = existingClients[0].id

        // Update client info if needed
        await supabase.from("clients").update({ name: clientInfo.name }).eq("id", clientId)
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            name: clientInfo.name,
            email: clientInfo.email,
            phone_number: "", // Optional field
          })
          .select("id")
          .single()

        if (clientError) throw clientError
        clientId = newClient.id
      }

      // Create delivery schedules for each entry
      for (const entry of entries) {
        // Skip incomplete entries
        if (!entry.farmerId || !entry.produceType || !entry.expectedQuantity || !entry.scheduledDeliveryDate) {
          continue
        }

        await supabase.from("delivery_schedules").insert({
          client_id: clientId,
          farmer_id: entry.farmerId,
          produce_type: entry.produceType,
          produce_nature: entry.produceNature,
          expected_quantity: Number.parseFloat(entry.expectedQuantity),
          expected_quality_grade: entry.expectedQualityGrade,
          dropoff_location: entry.dropoffLocation,
          scheduled_delivery_date: entry.scheduledDeliveryDate,
          special_notes: entry.specialNotes,
          packaging_type: entry.packagingType,
          storage_requirements: entry.storageRequirements,
          transportation_mode: entry.transportationMode,
          price_per_unit: entry.pricePerUnit ? Number.parseFloat(entry.pricePerUnit) : null,
          payment_terms: entry.paymentTerms,
          certifications: entry.certifications,
          inspection_requirements: entry.inspectionRequirements,
          delivery_frequency: entry.deliveryFrequency,
          contract_duration: entry.contractDuration,
          status: "pending",
        })
      }

      toast({
        title: "Orders submitted successfully",
        description: "Your orders have been scheduled. You will receive a confirmation email shortly.",
      })

      // Reset form
      setClientInfo({
        name: "",
        email: "",
        organization: "",
      })
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
          packagingType: "",
          storageRequirements: "",
          transportationMode: "",
          pricePerUnit: "",
          paymentTerms: "",
          certifications: "",
          inspectionRequirements: "",
          deliveryFrequency: "",
          contractDuration: "",
        },
      ])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
                <Label htmlFor="clientOrganization">Organization</Label>
                <Input
                  id="clientOrganization"
                  value={clientInfo.organization}
                  onChange={(e) => handleClientInfoChange("organization", e.target.value)}
                  placeholder="Your organization (optional)"
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
                          value={entry.expectedQuantity}
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

                      <div className="space-y-2 md:col-span-2">
                        <Label>Special Notes</Label>
                        <Textarea
                          value={entry.specialNotes}
                          onChange={(e) => handleEntryChange(entry.id, "specialNotes", e.target.value)}
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                          placeholder="Enter any special requirements or notes"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Packaging Type</Label>
                        <Select
                          value={entry.packagingType}
                          onValueChange={(value) => handleEntryChange(entry.id, "packagingType", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select packaging" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Crates", "Boxes", "Bags", "Bulk", "Custom"].map((type) => (
                              <SelectItem key={type} value={type.toLowerCase()}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Storage Requirements</Label>
                        <Select
                          value={entry.storageRequirements}
                          onValueChange={(value) => handleEntryChange(entry.id, "storageRequirements", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select storage type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Cold Storage", "Room Temperature", "Refrigerated", "Frozen"].map((type) => (
                              <SelectItem key={type} value={type.toLowerCase()}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Transportation Mode</Label>
                        <Select
                          value={entry.transportationMode}
                          onValueChange={(value) => handleEntryChange(entry.id, "transportationMode", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select transport" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Refrigerated Truck", "Regular Truck", "Van", "Third Party"].map((mode) => (
                              <SelectItem key={mode} value={mode.toLowerCase()}>
                                {mode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Price per Unit (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.pricePerUnit}
                          onChange={(e) => handleEntryChange(entry.id, "pricePerUnit", e.target.value)}
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                          placeholder="Enter price per kg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Payment Terms</Label>
                        <Select
                          value={entry.paymentTerms}
                          onValueChange={(value) => handleEntryChange(entry.id, "paymentTerms", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Net 30", "Net 60", "COD", "Advance Payment"].map((terms) => (
                              <SelectItem key={terms} value={terms.toLowerCase()}>
                                {terms}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Certifications Required</Label>
                        <Input
                          type="text"
                          value={entry.certifications}
                          onChange={(e) => handleEntryChange(entry.id, "certifications", e.target.value)}
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                          placeholder="e.g. Organic, GAP, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Inspection Requirements</Label>
                        <Textarea
                          value={entry.inspectionRequirements}
                          onChange={(e) => handleEntryChange(entry.id, "inspectionRequirements", e.target.value)}
                          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                          placeholder="Enter inspection details"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Delivery Frequency</Label>
                        <Select
                          value={entry.deliveryFrequency}
                          onValueChange={(value) => handleEntryChange(entry.id, "deliveryFrequency", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            {["One-time", "Weekly", "Bi-weekly", "Monthly"].map((freq) => (
                              <SelectItem key={freq} value={freq.toLowerCase()}>
                                {freq}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Contract Duration</Label>
                        <Select
                          value={entry.contractDuration}
                          onValueChange={(value) => handleEntryChange(entry.id, "contractDuration", value)}
                        >
                          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {["One-time", "3 months", "6 months", "1 year"].map((duration) => (
                              <SelectItem key={duration} value={duration.toLowerCase()}>
                                {duration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
  )
}
