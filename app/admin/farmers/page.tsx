import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw, Star } from "lucide-react"
import Link from "next/link"
import StatusBadge from "@/components/admin/status-badge"

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  // Parse query parameters
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined

  // Build query
  let query = supabase.from("farmers").select(
    `
    id,
    name,
    email,
    phone_number,
    created_at,
    delivery_schedules (
      id,
      status,
      scheduled_delivery_date,
      produce_type,
      expected_quantity,
      quality_assessments (
        quality_grade
      )
    )
  `,
    { count: "exact" }
  )

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Apply pagination
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  // Execute query
  const { data: farmers, count } = await query.range(from, to).order("name")

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  // Calculate farmer statistics
  const calculateFarmerStats = (farmer: any) => {
    const completedDeliveries = farmer.delivery_schedules.filter(
      (order: any) => order.status === "delivered"
    ).length
    const totalDeliveries = farmer.delivery_schedules.length
    const deliveryRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0

    const qualityAssessments = farmer.delivery_schedules
      .filter((order: any) => order.quality_assessments?.length > 0)
      .map((order: any) => order.quality_assessments[0].quality_grade)

    const averageQuality =
      qualityAssessments.length > 0
        ? qualityAssessments.reduce((sum: number, grade: string) => sum + parseInt(grade), 0) /
          qualityAssessments.length
        : 0

    return {
      deliveryRate: Math.round(deliveryRate),
      averageQuality: Math.round(averageQuality * 10) / 10,
      totalVolume: farmer.delivery_schedules.reduce(
        (sum: number, order: any) => sum + (order.expected_quantity || 0),
        0
      ),
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Farmers</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Farmers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                defaultValue={search}
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {farmers?.map((farmer) => {
          const stats = calculateFarmerStats(farmer)
          return (
            <Card key={farmer.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-[#2D3047]">{farmer.name}</h3>
                    <p className="text-[#5C6073]">{farmer.email}</p>
                    {farmer.phone_number && (
                      <p className="text-sm text-[#5C6073]">{farmer.phone_number}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-3 gap-4 text-sm text-[#5C6073]">
                      <div>
                        <p className="font-medium text-[#2D3047]">{stats.deliveryRate}%</p>
                        <p>Delivery Rate</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#2D3047] flex items-center">
                          {stats.averageQuality}
                          <Star className="h-4 w-4 ml-1 text-amber-500" />
                        </p>
                        <p>Avg. Quality</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#2D3047]">{stats.totalVolume}kg</p>
                        <p>Total Volume</p>
                      </div>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/admin/farmers/${farmer.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>

                {farmer.delivery_schedules.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-[#5C6073] mb-3">Recent Deliveries</h4>
                    <div className="grid gap-2">
                      {farmer.delivery_schedules
                        .sort(
                          (a: any, b: any) =>
                            new Date(b.scheduled_delivery_date).getTime() -
                            new Date(a.scheduled_delivery_date).getTime()
                        )
                        .slice(0, 3)
                        .map((order: any) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between py-2 px-3 bg-[#F8F5F2] rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <StatusBadge status={order.status} />
                              <div>
                                <span className="text-sm font-medium text-[#2D3047]">
                                  {order.produce_type}
                                </span>
                                <span className="text-sm text-[#5C6073] ml-2">
                                  ({order.expected_quantity}kg)
                                </span>
                              </div>
                              <span className="text-sm text-[#5C6073]">
                                {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                              </span>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/admin/orders/${order.id}`}>View Order</Link>
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#5C6073]">
            Showing {Math.min((page - 1) * itemsPerPage + 1, count || 0)} to{" "}
            {Math.min(page * itemsPerPage, count || 0)} of {count} farmers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search)
                searchParams.set("page", (page - 1).toString())
                window.location.search = searchParams.toString()
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search)
                searchParams.set("page", (page + 1).toString())
                window.location.search = searchParams.toString()
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 