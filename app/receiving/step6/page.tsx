"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import StepNavigation from "@/components/receiving/StepNavigation"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ReviewItem {
  id: number
  name: string
  quantity: number
  receivedQuantity: number
  gradeA: number
  gradeB: number
  gradeC: number
  returnedQuantity: number
  remaining: number
}

export default function Step6ReviewSubmit() {
  const router = useRouter()
  const supabase = createClient()
  const [orderData, setOrderData] = useState<any>(null)
  const [items, setItems] = useState<ReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load all order data
    const data = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    setOrderData(data)

    if (data.items) {
      setItems(data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        receivedQuantity: item.receivedQuantity || 0,
        gradeA: item.gradeA || 0,
        gradeB: item.gradeB || 0,
        gradeC: item.gradeC || 0,
        returnedQuantity: item.returnedQuantity || 0,
        remaining: (item.receivedQuantity || 0) - (item.returnedQuantity || 0)
      })))
    }
  }, [])

  const handleSubmit = async () => {
    if (isLoading) return false
    setIsLoading(true)

    try {
      // Log the data being submitted
      console.log("Submitting receiving record:", {
        clientId: orderData?.clientId,
        orderDate: orderData?.orderDate,
        isDropped: orderData?.isDropped,
        dropTime: orderData?.dropTime,
        dropNotes: orderData?.dropNotes,
        hasReturns: orderData?.hasReturns,
        itemCount: items?.length
      })

      // Enhanced validation
      if (!orderData) {
        throw new Error("No order data found")
      }

      if (!orderData.clientId) {
        throw new Error("Client information is missing")
      }

      if (!orderData.orderDate) {
        throw new Error("Order date is missing")
      }

      if (!items?.length) {
        throw new Error("No items to submit")
      }

      // Validate each item
      const invalidItems = items.filter(item => {
        const totalGraded = (item.gradeA || 0) + (item.gradeB || 0) + (item.gradeC || 0)
        return !item.name || 
               item.receivedQuantity === undefined || 
               item.quantity === undefined ||
               totalGraded !== item.receivedQuantity
      })

      if (invalidItems.length > 0) {
        throw new Error(`Invalid items found: ${invalidItems.map(item => item.name || 'Unnamed item').join(', ')}`)
      }

      // Create the receiving record
      const { data: receiving, error: receivingError } = await supabase
        .from("receiving_records")
        .insert({
          client_id: orderData.clientId,
          order_date: orderData.orderDate,
          is_dropped: orderData.isDropped,
          drop_time: orderData.dropTime,
          drop_notes: orderData.dropNotes,
          has_returns: orderData.hasReturns
        })
        .select()
        .single()

      if (receivingError) {
        console.error("Error creating receiving record:", receivingError)
        throw new Error(`Failed to create receiving record: ${receivingError.message}`)
      }

      if (!receiving) {
        throw new Error("No receiving record was created")
      }

      console.log("Created receiving record:", receiving)

      // Create item records
      const itemRecords = items.map(item => ({
        receiving_id: receiving.id,
        produce_id: orderData.items.find((i: any) => i.id === item.id)?.produceId || null,
        name: item.name,
        ordered_quantity: item.quantity,
        received_quantity: item.receivedQuantity,
        grade_a: item.gradeA || 0,
        grade_b: item.gradeB || 0,
        grade_c: item.gradeC || 0,
        returned_quantity: item.returnedQuantity || 0,
        return_reason: orderData.items.find((i: any) => i.id === item.id)?.returnReason || null,
        return_notes: orderData.items.find((i: any) => i.id === item.id)?.returnNotes || null,
        grading_notes: orderData.items.find((i: any) => i.id === item.id)?.gradingNotes || null
      }))

      console.log("Creating item records:", itemRecords)

      const { error: itemsError } = await supabase
        .from("receiving_items")
        .insert(itemRecords)

      if (itemsError) {
        console.error("Error creating item records:", itemsError)
        throw new Error(`Failed to create item records: ${itemsError.message}`)
      }

      console.log("Successfully created all records")

      // Clear the localStorage data
      localStorage.removeItem("receiving_order")

      toast({
        title: "Receiving Record Submitted",
        description: (
          <div className="mt-2 space-y-2">
            <p>Successfully processed {items.length} item{items.length > 1 ? 's' : ''} for receiving.</p>
            <Button 
              className="w-full bg-[#97B980] hover:bg-[#7A9968] text-white mt-2"
              onClick={() => router.push("/receiving/dashboard")}
            >
              View Dashboard
            </Button>
          </div>
        ),
        variant: "default",
        className: "bg-white border-green-600 border text-[#2D3047]",
        duration: 10000,
      })

      // Wait a moment before redirecting to allow user to see the toast
      setTimeout(() => {
        router.push("/receiving/dashboard")
      }, 3000)

      return true
    } catch (error: any) {
      console.error("Submission error:", error)
      
      // Determine a more specific error message
      let errorMessage = "Failed to submit receiving record."
      if (error.message.includes("foreign key")) {
        errorMessage = "Invalid reference to client or produce item. Please check your selections."
      } else if (error.message.includes("not_found")) {
        errorMessage = "Could not find the specified client or produce item."
      } else if (error.message.includes("invalid_input")) {
        errorMessage = "Invalid input data. Please check all fields and try again."
      }

      toast({
        title: "Submission Error",
        description: (
          <div className="mt-2 space-y-2">
            <p>{errorMessage}</p>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => handleSubmit()}
              >
                Try Again
              </Button>
              <Button 
                className="flex-1 bg-[#97B980] hover:bg-[#7A9968] text-white"
                onClick={() => router.push("/receiving/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        ),
        variant: "destructive",
        className: "border-red-600",
        duration: 0, // Won't auto-dismiss
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  if (!orderData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#2D3047]">Review & Submit</h1>
          <p className="text-[#5C6073]">Review all information before submitting.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Order Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order Date:</span>
                  <span className="ml-2">{new Date(orderData.orderDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium">Drop Status:</span>
                  <span className="ml-2">{orderData.isDropped ? "Dropped" : "Not Dropped"}</span>
                </div>
                {orderData.isDropped && (
                  <div>
                    <span className="font-medium">Drop Time:</span>
                    <span className="ml-2">{new Date(orderData.dropTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#2D3047]">Items Summary</h2>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-[#2D3047]">{item.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-[#2D3047]">Ordered:</span>
                      <span className="ml-2 text-[#5C6073]">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2D3047]">Received:</span>
                      <span className="ml-2 text-[#5C6073]">{item.receivedQuantity}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2D3047]">Grade A:</span>
                      <span className="ml-2 text-[#5C6073]">{item.gradeA}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2D3047]">Grade B:</span>
                      <span className="ml-2 text-[#5C6073]">{item.gradeB}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2D3047]">Grade C:</span>
                      <span className="ml-2 text-[#5C6073]">{item.gradeC}</span>
                    </div>
                    {orderData.hasReturns && (
                      <>
                        <div>
                          <span className="font-medium text-[#2D3047]">Returned:</span>
                          <span className="ml-2 text-[#5C6073]">{item.returnedQuantity}</span>
                        </div>
                        <div>
                          <span className="font-medium text-[#2D3047]">Remaining:</span>
                          <span className="ml-2 text-[#5C6073]">{item.remaining}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StepNavigation
        currentStep={6}
        totalSteps={6}
        onNext={handleSubmit}
        isSubmitting={isLoading}
        submitText="Submit Receiving"
      />
    </div>
  )
} 