"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import StepNavigation from "@/components/receiving/StepNavigation"
import { Card, CardContent } from "@/components/ui/card"

interface OrderItem {
  id: number
  name: string
  quantity: number
  receivedQuantity?: number
  notes?: string
}

export default function Step3FieldMeasurement() {
  const [items, setItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load order data from previous steps
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    if (orderData.items) {
      setItems(orderData.items.map((item: OrderItem) => ({
        ...item,
        receivedQuantity: item.receivedQuantity || 0,
        notes: item.notes || ""
      })))
    }
  }, [])

  const handleQuantityChange = (id: number, value: number) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, receivedQuantity: value }
        : item
    ))
  }

  const handleNotesChange = (id: number, value: string) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, notes: value }
        : item
    ))
  }

  const handleNext = async () => {
    if (items.some(item => item.receivedQuantity === undefined)) {
      alert("Please enter received quantities for all items")
      return false
    }

    // Get existing order data
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    
    // Update with field measurements
    localStorage.setItem("receiving_order", JSON.stringify({
      ...orderData,
      items: items
    }))

    return true
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#2D3047]">Field Measurement</h1>
          <p className="text-[#5C6073]">Measure the actual quantities received at the client's site.</p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-[#2D3047]">{item.name}</h3>
                  <span className="text-sm text-[#5C6073]">Ordered: {item.quantity}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3047]">Received Quantity</label>
                  <Input
                    type="number"
                    value={item.receivedQuantity || ""}
                    onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                    placeholder="Enter received quantity"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3047]">Notes (Optional)</label>
                  <Textarea
                    value={item.notes}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Add any notes about this item..."
                    className="resize-none"
                  />
                </div>

                {item.receivedQuantity !== undefined && item.quantity !== item.receivedQuantity && (
                  <div className={`text-sm ${item.receivedQuantity > item.quantity ? "text-orange-600" : "text-red-600"}`}>
                    {item.receivedQuantity > item.quantity
                      ? `Over-delivered by ${item.receivedQuantity - item.quantity}`
                      : `Under-delivered by ${item.quantity - item.receivedQuantity}`}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StepNavigation
        currentStep={3}
        totalSteps={6}
        onNext={handleNext}
        isSubmitting={isLoading}
      />
    </div>
  )
} 