import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RecentOrdersTable from "@/components/admin/recent-orders-table"
import DashboardOverview from "@/components/admin/dashboard-overview"

export default async function AdminDashboard() {
  const supabase = createClient()

  // Fetch recent orders for the dashboard
  const { data: recentOrders } = await supabase
    .from("delivery_schedules")
    .select(`
      id,
      scheduled_delivery_date,
      produce_type,
      expected_quantity,
      status,
      clients (
        name
      ),
      farmers (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/orders">View All Orders</Link>
        </Button>
      </div>

      <DashboardOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <StatusCount status="pending" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Confirmed</span>
                </div>
                <StatusCount status="confirmed" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">Shipped</span>
                </div>
                <StatusCount status="shipped" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Delivered</span>
                </div>
                <StatusCount status="delivered" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
                <StatusCount status="cancelled" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function StatusCount({ status }: { status: string }) {
  const supabase = createClient()

  const { count } = await supabase
    .from("delivery_schedules")
    .select("*", { count: "exact", head: true })
    .eq("status", status)

  return <span className="font-medium">{count || 0}</span>
}
