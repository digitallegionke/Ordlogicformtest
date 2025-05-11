"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { getCachedData } from "@/utils/supabase/cache"
import { PostgrestResponse, PostgrestError } from "@supabase/supabase-js"
import { Database } from "@/types/database"

type DeliverySchedule = Database["public"]["Tables"]["delivery_schedules"]["Row"] & {
  certifications?: string[]
  packaging_type?: string | null
  payment_terms?: string | null
  delivery_frequency?: string | null
  contract_duration?: string | null
}

export default function OrderHistory() {
  const supabase = createClient()
  const [orders, setOrders] = useState<DeliverySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError("Please log in to view your orders")
          setLoading(false)
          return
        }

        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("email", user.email)
          .single()

        if (!client) {
          setError("No client profile found")
          setLoading(false)
          return
        }

        const { data, error: queryError } = await supabase
          .from("delivery_schedules")
          .select("*")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false })

        if (queryError) {
          throw queryError
        }

        setOrders(data || [])
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase])

  const getStatusColor = (status: DeliverySchedule["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-serif font-medium text-[#2D3047] mb-6">Your Orders</h1>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">No orders found</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {order.produce_type.charAt(0).toUpperCase() + order.produce_type.slice(1)}
                    </CardTitle>
                    <CardDescription>
                      Scheduled for {format(new Date(order.scheduled_delivery_date), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                    <p>{order.expected_quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quality Grade</p>
                    <p>Grade {order.expected_quality_grade}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Drop-off Location</p>
                    <p>{order.dropoff_location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nature</p>
                    <p>{order.produce_nature.charAt(0).toUpperCase() + order.produce_nature.slice(1)}</p>
                  </div>
                  {order.packaging_type && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Packaging</p>
                      <p>{order.packaging_type}</p>
                    </div>
                  )}
                  {order.payment_terms && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Terms</p>
                      <p>{order.payment_terms}</p>
                    </div>
                  )}
                  {order.delivery_frequency && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Delivery Frequency</p>
                      <p>{order.delivery_frequency}</p>
                    </div>
                  )}
                  {order.contract_duration && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contract Duration</p>
                      <p>{order.contract_duration}</p>
                    </div>
                  )}
                </div>
                {order.special_notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Special Notes</p>
                    <p className="text-sm mt-1">{order.special_notes}</p>
                  </div>
                )}
                {order.certifications && order.certifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {order.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 