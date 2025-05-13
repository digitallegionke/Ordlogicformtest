"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import StepNavigation from "@/components/receiving/StepNavigation"
import { Card, CardContent } from "@/components/ui/card"

interface GradedItem {
  id: number
  name: string
  receivedQuantity: number
  gradeA: number
  gradeB: number
  gradeC: number
  notes: string
}

export default function Step4SortingGrading() {
  const [items, setItems] = useState<GradedItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load order data from previous steps
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    if (orderData.items) {
      setItems(orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        receivedQuantity: item.receivedQuantity || 0,
        gradeA: item.gradeA || 0,
        gradeB: item.gradeB || 0,
        gradeC: item.gradeC || 0,
        notes: item.gradingNotes || ""
      })))
    }
  }, [])

  const handleGradeChange = (id: number, grade: 'gradeA' | 'gradeB' | 'gradeC', value: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [grade]: value }
        return newItem
      }
      return item
    }))
  }

  const handleNotesChange = (id: number, value: string) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, notes: value }
        : item
    ))
  }

  const getTotalGraded = (item: GradedItem) => {
    return item.gradeA + item.gradeB + item.gradeC
  }

  const handleNext = async () => {
    // Validate that graded quantities match received quantities
    const invalidItems = items.filter(item => {
      const totalGraded = getTotalGraded(item)
      return totalGraded !== item.receivedQuantity
    })

    if (invalidItems.length > 0) {
      alert(`Please ensure graded quantities match received quantities for: ${invalidItems.map(item => item.name).join(", ")}`)
      return false
    }

    // Get existing order data
    const orderData = JSON.parse(localStorage.getItem("receiving_order") || "{}")
    
    // Update with grading information
    localStorage.setItem("receiving_order", JSON.stringify({
      ...orderData,
      items: items.map(item => ({
        ...item,
        gradeA: item.gradeA,
        gradeB: item.gradeB,
        gradeC: item.gradeC,
        gradingNotes: item.notes
      }))
    }))

    return true
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#2D3047]">Sorting & Grading</h1>
          <p className="text-[#5C6073]">Sort the produce into quality grades.</p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-[#2D3047]">{item.name}</h3>
                  <span className="text-sm text-[#5C6073]">Received: {item.receivedQuantity}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2D3047]">Grade A</label>
                    <Input
                      type="number"
                      value={item.gradeA}
                      onChange={(e) => handleGradeChange(item.id, 'gradeA', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2D3047]">Grade B</label>
                    <Input
                      type="number"
                      value={item.gradeB}
                      onChange={(e) => handleGradeChange(item.id, 'gradeB', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2D3047]">Grade C</label>
                    <Input
                      type="number"
                      value={item.gradeC}
                      onChange={(e) => handleGradeChange(item.id, 'gradeC', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="text-sm">
                  <span className={getTotalGraded(item) === item.receivedQuantity ? "text-[#97B980]" : "text-red-600"}>
                    Total Graded: {getTotalGraded(item)} / {item.receivedQuantity}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3047]">Notes (Optional)</label>
                  <Textarea
                    value={item.notes}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Add any notes about grading..."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StepNavigation
        currentStep={4}
        totalSteps={6}
        onNext={handleNext}
        isSubmitting={isLoading}
      />
    </div>
  )
} 