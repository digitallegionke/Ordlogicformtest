import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, RefreshCw } from "lucide-react"
import OrdersTable from "@/components/admin/orders-table"

interface Order {
  id: string
  created_at: string
  scheduled_delivery_date: string
  produce_type: string
  produce_nature: string
  expected_quantity: number
  expected_quality_grade: string
  dropoff_location: string
  status: string
  special_notes: string
  clients: {
    id: string
    name: string
    email: string
  }
  farmers: {
    id: string
    name: string
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  // Parse query parameters
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "created_at"
  const sortOrder = typeof searchParams.sortOrder === "string" ? searchParams.sortOrder : "desc"

  // Build query
  let query = supabase
    .from("delivery_schedules")
    .select(
      `
      id,
      created_at,
      scheduled_delivery_date,
      produce_type,
      produce_nature,
      expected_quantity,
      expected_quality_grade,
      dropoff_location,
      status,
      special_notes,
      clients!inner (
        id,
        name,
        email
      ),
      farmers!inner (
        id,
        name
      )
    `,
      { count: "exact" }
    )

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq("status", status)
  }

  if (search) {
    query = query.or(
      `produce_type.ilike.%${search}%,clients.name.ilike.%${search}%,farmers.name.ilike.%${search}%`
    )
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  // Execute query
  const { data: rawOrders, count } = await query.range(from, to)

  // Transform the data to match the Order interface
  const orders: Order[] = rawOrders?.map((order: any) => ({
    ...order,
    clients: order.clients[0] || { id: '', name: '', email: '' },
    farmers: order.farmers[0] || { id: '', name: '' },
    expected_quantity: Number(order.expected_quantity)
  })) || []

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Orders</h1>
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
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                defaultValue={search}
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              />
            </div>
            <div className="w-full md:w-48">
              <Select defaultValue={status || "all"}>
                <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <OrdersTable
        orders={orders}
        currentPage={page}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={count || 0}
      />
    </div>
  )
} 