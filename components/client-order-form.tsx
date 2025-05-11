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
import { useRouter } from "next/navigation"
import OrderStatusModal from "@/components/ui/order-status-modal"

interface ClientInfo {
  name: string
  email: string
  phone_number?: string | null
}

interface OrderEntry {
  id: number
  produceType: string
  produceNature: string
  expectedQuantity: string
  expectedQualityGrade: string
  dropoffLocation: string
  scheduledDeliveryDate: string
  packagingType: string
  paymentTerms: string
  certifications: string
  deliveryFrequency: string
  contractDuration: string
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
      produceType: "",
      produceNature: "",
      expectedQuantity: "",
      expectedQualityGrade: "",
      dropoffLocation: "",
      scheduledDeliveryDate: "",
      packagingType: "",
      paymentTerms: "",
      certifications: "",
      deliveryFrequency: "",
      contractDuration: "",
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
        produceType: "",
        produceNature: "",
        expectedQuantity: "",
        expectedQualityGrade: "",
        dropoffLocation: "",
        scheduledDeliveryDate: "",
        packagingType: "",
        paymentTerms: "",
        certifications: "",
        deliveryFrequency: "",
        contractDuration: "",
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
      // Validate client info
      if (!clientInfo.name || !clientInfo.email) {
        throw new Error("Please provide your name and email address")
      }

      // Validate at least one complete entry
      const hasCompleteEntry = entries.some(
        (entry) => entry.produceType && entry.expectedQuantity && entry.scheduledDeliveryDate,
      )

      if (!hasCompleteEntry) {
        throw new Error("Please complete at least one order entry")
      }

      // Check if client exists or create new client
      let clientId: string

      console.log('Looking up client:', clientInfo.email)
      
      // Look up client by email
      const { data: existingClients, error: clientLookupError } = await supabase
        .from("clients")
        .select("id, name")
        .eq("email", clientInfo.email)
        .limit(1)

      if (clientLookupError) {
        console.error('Client lookup error:', {
          code: clientLookupError.code,
          message: clientLookupError.message,
          details: clientLookupError.details,
          hint: clientLookupError.hint
        })
        throw new Error(`Failed to look up client: ${clientLookupError.message}`)
      }

      console.log('Existing clients result:', existingClients)

      if (existingClients && existingClients.length > 0) {
        // Use existing client
        clientId = existingClients[0].id
        console.log('Using existing client:', clientId)

        // Update client info if needed
        const { error: updateError } = await supabase
          .from("clients")
          .update({
            name: clientInfo.name,
            phone_number: clientInfo.phone_number || null
          })
          .eq("id", clientId)

        if (updateError) {
          console.error('Client update error:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint
          })
          throw new Error(`Failed to update client: ${updateError.message}`)
        }
      } else {
        console.log('Creating new client:', {
          name: clientInfo.name,
          email: clientInfo.email,
          phone_number: clientInfo.phone_number
        })
        
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert([{
            name: clientInfo.name,
            email: clientInfo.email,
            phone_number: clientInfo.phone_number
          }])
          .select("id, name, email")
          .single()

        if (clientError) {
          console.error('Client creation error:', {
            code: clientError.code,
            message: clientError.message,
            details: clientError.details,
            hint: clientError.hint,
            clientInfo,
            rawError: JSON.stringify(clientError, null, 2)
          })

          // Check if it's an RLS error
          if (clientError.message?.includes('new row violates row-level security policy')) {
            throw new Error("Permission denied: Unable to create client. Please try again or contact support.")
          }

          throw new Error(`Failed to create client: ${clientError.message}`)
        }

        if (!newClient) {
          console.error('No client data returned after creation')
          throw new Error("Failed to create client: No client ID returned")
        }

        console.log('New client created:', newClient)
        clientId = newClient.id
      }

      // Create delivery schedules for each entry
      const completedOrders = []
      for (const entry of entries) {
        // Skip incomplete entries
        if (!entry.produceType || !entry.expectedQuantity || !entry.scheduledDeliveryDate) {
          continue
        }

        // Parse certifications into a JSONB array
        let certifications: string[];
        try {
          // Split by comma, clean up whitespace, and filter out empty strings
          const certArray = entry.certifications
            ? entry.certifications
                .split(',')
                .map(cert => cert.trim())
                .filter(cert => cert.length > 0)
            : [];
          
          // If we have valid certifications, use them, otherwise use empty array
          certifications = certArray.length > 0 ? certArray : [];
          
          console.log('Parsed certifications:', certifications);
        } catch (error) {
          console.error('Error parsing certifications:', error);
          certifications = [];
        }

        const deliveryData = {
          client_id: clientId,
          produce_type: entry.produceType,
          produce_nature: entry.produceNature,
          expected_quantity: Number.parseFloat(entry.expectedQuantity),
          expected_quality_grade: entry.expectedQualityGrade,
          dropoff_location: entry.dropoffLocation,
          scheduled_delivery_date: entry.scheduledDeliveryDate,
          special_notes: entry.specialNotes || null,
          packaging_type: entry.packagingType || null,
          payment_terms: entry.paymentTerms || null,
          certifications,
          delivery_frequency: entry.deliveryFrequency || null,
          contract_duration: entry.contractDuration || null,
          status: "pending"
        };

        console.log('Creating delivery schedule with data:', deliveryData);

        try {
          const { data, error: scheduleError } = await supabase
            .from("delivery_schedules")
            .insert([deliveryData])
            .select()
            .single();

          if (scheduleError) {
            console.error('Delivery schedule error:', {
              code: scheduleError.code,
              message: scheduleError.message,
              details: scheduleError.details,
              hint: scheduleError.hint,
              entry,
              certifications,
              deliveryData
            });

            // Check for specific error types
            if (scheduleError.code === '23502') { // not_null_violation
              throw new Error('Missing required fields in delivery schedule');
            } else if (scheduleError.code === '23503') { // foreign_key_violation
              throw new Error('Invalid client or farmer reference');
            } else if (scheduleError.code === '42703') { // undefined_column
              throw new Error('Database schema mismatch. Please contact support.');
            } else {
              throw new Error(`Failed to create delivery schedule: ${scheduleError.message}`);
            }
          }

          console.log('Successfully created delivery schedule:', data);
          completedOrders.push(entry);
        } catch (error) {
          console.error('Unexpected error during delivery schedule creation:', {
            error,
            deliveryData,
            entry
          });
          throw error;
        }
      }

      // Show success modal
      setModalState({
        isOpen: true,
        status: "success",
        title: "Orders Submitted Successfully",
        message: `Successfully scheduled ${completedOrders.length} order(s). You will receive a confirmation email shortly.`,
      })

      // Reset form
      setClientInfo({
        name: "",
        email: "",
        phone_number: null
      })
      setEntries([
        {
          id: 1,
          produceType: "",
          produceNature: "",
          expectedQuantity: "",
          expectedQualityGrade: "",
          dropoffLocation: "",
          scheduledDeliveryDate: "",
          packagingType: "",
          paymentTerms: "",
          certifications: "",
          deliveryFrequency: "",
          contractDuration: "",
          specialNotes: "",
        },
      ])

      // Navigate to confirmation page and force a refresh
      router.push('/order/confirmation')
      router.refresh()
    } catch (error) {
      console.error('Form submission error:', {
        name: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        details: (error as any)?.details || 'No additional details',
        code: (error as any)?.code || 'No error code'
      })
      
      setModalState({
        isOpen: true,
        status: "error",
        title: "Order Submission Failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })

      // Add specific error handling for certification issues
      if (error instanceof Error && error.message.includes('certifications')) {
        throw new Error("Invalid certification format. Please enter comma-separated values.");
      }
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
