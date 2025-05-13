"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StepNavigation from "@/components/receiving/StepNavigation"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderItem {
  id: number
  produceId: string
  name: string
  quantity: number
}

interface Client {
  id: string
  name: string
}

interface ProduceItem {
  id: string
  name: string
  category: string | null
  unit: string
}

export default function Step1ClientInfo() {
  const router = useRouter()
  const supabase = createClient()
  const [clientId, setClientId] = useState("")
  const [orderDate, setOrderDate] = useState("")
  const [items, setItems] = useState<OrderItem[]>([{
    id: 1,
    produceId: "",
    name: "",
    quantity: 0
  }])
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [produceItems, setProduceItems] = useState<ProduceItem[]>([])

  // Fetch clients and produce items on component mount
  useEffect(() => {
    const fetchData = async () => {
      const [clientsResponse, produceResponse] = await Promise.all([
        supabase.from("clients").select("id,name"),
        supabase.from("produce").select("id,name,category,unit").order("name")
      ])

      if (clientsResponse.data) setClients(clientsResponse.data)
      if (produceResponse.data) setProduceItems(produceResponse.data)
    }
    fetchData()
  }, [])

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        produceId: "",
        name: "",
        quantity: 0
      }
    ])
  }

  const handleItemChange = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === "produceId") {
          const selectedProduce = produceItems.find(p => p.id === value)
          return {
            ...item,
            produceId: value as string,
            name: selectedProduce?.name || ""
          }
        }
        return { ...item, [field]: field === "quantity" ? Number(value) : value }
      }
      return item
    }))
  }

  const handleNext = async () => {
    if (!clientId || !orderDate || items.some(item => !item.produceId || !item.quantity)) {
      alert("Please fill in all required fields")
      return false
    }

    // Store the order data in localStorage
    localStorage.setItem("receiving_order", JSON.stringify({
      clientId,
      orderDate,
      items: items.map(item => ({
        ...item,
        unit: produceItems.find(p => p.id === item.produceId)?.unit
      }))
    }))

    return true
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#2D3047]">Client Order Intake</h1>
          <p className="text-[#5C6073]">Who placed the order and what was requested?</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3047]">Select Client</label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3047]">Order Date</label>
            <Input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-[#2D3047]">Order Items</label>
            {items.map((item) => (
              <div key={item.id} className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3047]">Select Item</label>
                  <Select value={item.produceId} onValueChange={(value) => handleItemChange(item.id, "produceId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {produceItems.map((produce) => (
                        <SelectItem key={produce.id} value={produce.id}>
                          {produce.name} ({produce.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3047]">Quantity</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                    placeholder="Enter quantity"
                  />
                  {item.produceId && (
                    <span className="text-sm text-[#5C6073]">
                      Unit: {produceItems.find(p => p.id === item.produceId)?.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full hover:bg-[#F8F5F2]"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Item
            </Button>
          </div>
        </div>
      </div>

      <StepNavigation
        currentStep={1}
        totalSteps={6}
        onNext={handleNext}
        isSubmitting={isLoading}
      />
    </div>
  )
} 