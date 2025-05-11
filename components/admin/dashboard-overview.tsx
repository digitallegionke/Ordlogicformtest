"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Users, Truck, TrendingUp } from "lucide-react"

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    ordersCount: 0,
    clientsCount: 0,
    farmersCount: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts
        const { count: ordersCount } = await supabase
          .from("delivery_schedules")
          .select("*", { count: "exact", head: true })

        const { count: clientsCount } = await supabase.from("clients").select("*", { count: "exact", head: true })

        const { count: farmersCount } = await supabase.from("farmers").select("*", { count: "exact", head: true })

        // Fetch pending orders
        const { count: pendingOrders } = await supabase
          .from("delivery_schedules")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        // Fetch completed orders
        const { count: completedOrders } = await supabase
          .from("delivery_schedules")
          .select("*", { count: "exact", head: true })
          .eq("status", "delivered")

        setStats({
          ordersCount: ordersCount || 0,
          clientsCount: clientsCount || 0,
          farmersCount: farmersCount || 0,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  // Calculate completion rate
  const completionRate = stats.ordersCount > 0 ? Math.round((stats.completedOrders / stats.ordersCount) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#5C6073]">Total Orders</p>
            <p className="text-3xl font-bold text-[#2D3047]">{stats.ordersCount}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Package className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#5C6073]">Total Clients</p>
            <p className="text-3xl font-bold text-[#2D3047]">{stats.clientsCount}</p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Users className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#5C6073]">Total Farmers</p>
            <p className="text-3xl font-bold text-[#2D3047]">{stats.farmersCount}</p>
          </div>
          <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <Truck className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#5C6073]">Completion Rate</p>
            <p className="text-3xl font-bold text-[#2D3047]">{completionRate}%</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
