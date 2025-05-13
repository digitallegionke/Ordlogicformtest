"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import StepNavigation from "@/components/receiving/StepNavigation"

export default function Step2ConfirmDrop() {
  const [isDropped, setIsDropped] = useState(false)
  const [dropTime, setDropTime] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Set current time when isDropped is switched to true
  useEffect(() => {
    if (isDropped && !dropTime) {
      const now = new Date()
      setDropTime(now.toISOString().slice(0, 16)) // Format: YYYY-MM-DDThh:mm
    }
  }, [isDropped])

  const handleNext = async () => {
    if (isDropped && !dropTime) {
      alert("Please specify the drop-off time")
      return false
    }

    // Get existing order data
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    
    // Update with drop information
    localStorage.setItem("receiving_order", JSON.stringify({
      ...orderData,
      isDropped,
      dropTime,
      dropNotes: notes
    }))

    return true
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#2D3047]">Confirm Order Drop</h1>
          <p className="text-[#5C6073]">Has this order been dropped to the client?</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2D3047]">Order Dropped</label>
            <Switch
              checked={isDropped}
              onCheckedChange={setIsDropped}
            />
          </div>

          {isDropped && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3047]">Drop-off Time</label>
                <Input
                  type="datetime-local"
                  value={dropTime}
                  onChange={(e) => setDropTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3047]">Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the delivery..."
                  className="resize-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <StepNavigation
        currentStep={2}
        totalSteps={6}
        onNext={handleNext}
        isSubmitting={isLoading}
      />
    </div>
  )
} 