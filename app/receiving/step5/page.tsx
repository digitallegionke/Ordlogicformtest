"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import StepNavigation from "@/components/receiving/StepNavigation"
import { Card, CardContent } from "@/components/ui/card"

interface ReturnItem {
  id: number
  name: string
  receivedQuantity: number
  returnedQuantity: number
  returnReason: string
  notes: string
}

const RETURN_REASONS = [
  "Damaged",
  "Over-delivered",
  "Wrong item",
  "Quality issues",
  "Other"
]

export default function Step5Returns() {
  const [hasReturns, setHasReturns] = useState(false)
  const [items, setItems] = useState<ReturnItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load order data from previous steps
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    if (orderData.items) {
      setItems(orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        receivedQuantity: item.receivedQuantity || 0,
        returnedQuantity: item.returnedQuantity || 0,
        returnReason: item.returnReason || "",
        notes: item.returnNotes || ""
      })))
      setHasReturns(orderData.hasReturns || false)
    }
  }, [])

  const handleReturnQuantityChange = (id: number, value: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          returnedQuantity: Math.min(value, item.receivedQuantity) // Cannot return more than received
        }
      }
      return item
    }))
  }

  const handleReasonChange = (id: number, value: string) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, returnReason: value }
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
    if (hasReturns) {
      const invalidReturns = items.filter(item => 
        item.returnedQuantity > 0 && !item.returnReason
      )

      if (invalidReturns.length > 0) {
        alert("Please specify return reasons for all returned items")
        return false
      }
    }

    // Get existing order data
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    
    // Update with returns information
    localStorage.setItem("receiving_order", JSON.stringify({
      ...orderData,
      hasReturns,
      items: items.map(item => ({
        ...item,
        returnedQuantity: hasReturns ? item.returnedQuantity : 0,
        returnReason: hasReturns ? item.returnReason : "",
        returnNotes: hasReturns ? item.notes : ""
      }))
    }))

    return true
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#2D3047]">Returns & Adjustments</h1>
          <p className="text-[#5C6073]">Record any returns or adjustments needed.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D3047]">Has Returns</label>
            <Switch
              checked={hasReturns}
              onCheckedChange={setHasReturns}
            />
          </div>

          {hasReturns && (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-[#2D3047]">{item.name}</h3>
                      <span className="text-sm text-[#5C6073]">Received: {item.receivedQuantity}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2D3047]">Return Quantity</label>
                      <Input
                        type="number"
                        value={item.returnedQuantity}
                        onChange={(e) => handleReturnQuantityChange(item.id, Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2D3047]">Return Reason</label>
                      <Select value={item.returnReason} onValueChange={(value) => handleReasonChange(item.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {RETURN_REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2D3047]">Notes (Optional)</label>
                      <Textarea
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        placeholder="Add any notes about the return..."
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <StepNavigation
        currentStep={5}
        totalSteps={6}
        onNext={handleNext}
        isSubmitting={isLoading}
      />
    </div>
  )
} 