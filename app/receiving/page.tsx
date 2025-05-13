"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface ReceivingRecord {
  id: string
  client_id: string
  order_date: string
  created_at: string
  is_dropped: boolean
  has_returns: boolean
  client: {
    name: string
  }
  receiving_items: {
    name: string
    ordered_quantity: number
    received_quantity: number
  }[]
}

export default function ReceivingList() {
  const router = useRouter()
  const supabase = createClient()
  const [records, setRecords] = useState<ReceivingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("receiving_records")
        .select(`
          *,
          client:clients(name),
          receiving_items(name, ordered_quantity, received_quantity)
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      if (data) {
        setRecords(data as ReceivingRecord[])
      }
      setIsLoading(false)
    }

    fetchRecords()
  }, [])

  const startNewReceiving = () => {
    router.push("/receiving/step1")
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Receiving Records</h1>
          <p className="text-gray-600">Manage and track produce receiving.</p>
        </div>
        <Button onClick={startNewReceiving}>
          Start New Receiving
        </Button>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No receiving records found. Start by creating a new one.
            </CardContent>
          </Card>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{record.client?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {record.is_dropped && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Dropped
                      </span>
                    )}
                    {record.has_returns && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        Has Returns
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {record.receiving_items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>{item.name}</span>
                      <span>
                        {item.received_quantity} / {item.ordered_quantity} received
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 