import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import StatusBadge from "@/components/admin/status-badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Database } from "@/types/database"

type Farmer = {
  id: string
  created_at: string
  name: string
  email: string | null
  phone_number: string
  address: string | null
  status: string
  delivery_schedules: Array<{
    id: string
    status: string
    scheduled_delivery_date: string
    produce_id: string
    produce: {
      id: string
      name: string
      category: string
      unit: string
      description: string | null
    }
    expected_quantity: number
    unit: string
  }>
}

// Helper function to convert search params to URLSearchParams compatible object
function convertSearchParams(params: { [key: string]: string | string[] | undefined }) {
  const result: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = value
    } else if (Array.isArray(value)) {
      result[key] = value.join(',')
    }
  })
  return result
}

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  // Parse query parameters
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "all"

  // Build query
  let query = supabase.from("farmers").select(
    `
    id,
    name,
    email,
    phone_number,
    address,
    status,
    created_at,
    delivery_schedules!inner (
      id,
      status,
      scheduled_delivery_date,
      produce_id,
      produce!inner (
        id,
        name,
        category,
        unit,
        description
      ),
      expected_quantity,
      unit
    )
  `,
    { count: "exact" }
  )

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (tab !== 'all') {
    query = query.eq('status', tab)
  }

  // Apply pagination
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  // Execute query
  const { data: farmers, count, error } = await query.range(from, to).order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch farmers: ${error.message}`)
  }

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  // Calculate farmer statistics
  const calculateFarmerStats = (farmer: Farmer) => {
    const completedDeliveries = farmer.delivery_schedules.filter(
      (order) => order.status === "delivered"
    ).length
    const totalDeliveries = farmer.delivery_schedules.length
    const deliveryRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0

    return {
      deliveryRate: Math.round(deliveryRate),
      totalVolume: farmer.delivery_schedules.reduce(
        (sum, order) => sum + (order.expected_quantity || 0),
        0
      ),
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Farmers</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/farmers/export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/farmers?${new URLSearchParams(convertSearchParams({ 
              ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== "page"))
            }))}`}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/admin/farmers/new">Add New Farmer</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Farmers</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/admin/farmers" className="flex gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={search}
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              />
              <input type="hidden" name="tab" value={tab} />
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger asChild value="all" className="flex-1 max-w-[200px]">
            <Link href={`/admin/farmers?${new URLSearchParams(convertSearchParams({
              ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== "tab")),
              tab: "all"
            }))}`}>
              All Farmers
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="active" className="flex-1 max-w-[200px]">
            <Link href={`/admin/farmers?${new URLSearchParams(convertSearchParams({
              ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== "tab")),
              tab: "active"
            }))}`}>
              Active
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="inactive" className="flex-1 max-w-[200px]">
            <Link href={`/admin/farmers?${new URLSearchParams(convertSearchParams({
              ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== "tab")),
              tab: "inactive"
            }))}`}>
              Inactive
            </Link>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6">
          {farmers?.map((farmer: any) => {
            const typedFarmer: Farmer = {
              ...farmer,
              delivery_schedules: farmer.delivery_schedules.map((schedule: any) => ({
                ...schedule,
                produce: schedule.produce
              }))
            }
            const stats = calculateFarmerStats(typedFarmer)
            return (
              <Card key={typedFarmer.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-[#2D3047]">{typedFarmer.name}</h3>
                      <p className="text-[#5C6073]">{typedFarmer.email}</p>
                      {typedFarmer.phone_number && (
                        <p className="text-sm text-[#5C6073]">{typedFarmer.phone_number}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[#5C6073]">
                        <p>
                          Delivery Rate:{" "}
                          <span className="font-medium text-[#2D3047]">
                            {stats.deliveryRate}%
                          </span>
                        </p>
                        <p>
                          Total Volume:{" "}
                          <span className="font-medium text-[#2D3047]">
                            {stats.totalVolume}kg
                          </span>
                        </p>
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/admin/farmers/${typedFarmer.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>

                  {typedFarmer.delivery_schedules.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-[#5C6073] mb-3">Recent Deliveries</h4>
                      <div className="grid gap-2">
                        {typedFarmer.delivery_schedules
                          .sort(
                            (a, b) =>
                              new Date(b.scheduled_delivery_date).getTime() -
                              new Date(a.scheduled_delivery_date).getTime()
                          )
                          .slice(0, 3)
                          .map((delivery) => (
                            <div
                              key={delivery.id}
                              className="flex items-center justify-between py-2 px-3 bg-[#F8F5F2] rounded-md"
                            >
                              <div className="flex items-center gap-3">
                                <StatusBadge status={delivery.status} />
                                <div>
                                  <div className="font-medium text-[#2D3047]">
                                    {delivery.produce.name}
                                  </div>
                                  <div className="text-xs text-[#5C6073]">
                                    {delivery.expected_quantity} {delivery.unit} - {new Date(delivery.scheduled_delivery_date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/admin/orders/${delivery.id}`}>View Order</Link>
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
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-[#5C6073]">
              Showing {Math.min((page - 1) * itemsPerPage + 1, count || 0)} to{" "}
              {Math.min(page * itemsPerPage, count || 0)} of {count} farmers
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button asChild variant="outline">
                  <Link
                    href={`/admin/farmers?${new URLSearchParams(convertSearchParams({
                      ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== "page")),
                      page: (page - 1).toString(),
                    }))}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              {page < totalPages && (
                <Button asChild variant="outline">
                  <Link
                    href={`/admin/farmers?${new URLSearchParams(convertSearchParams({
                      ...Object.fromEntries(Object.entries(searchParams).filter(([key]) => key !== "page")),
                      page: (page + 1).toString(),
                    }))}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  )
} 