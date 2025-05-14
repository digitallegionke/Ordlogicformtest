import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, RefreshCw, Package2, ArrowUpDown } from "lucide-react"
import OrdersTable from "@/components/admin/orders-table"
import type { Order, OrderStatus } from "@/types/orders"
import { revalidatePath } from "next/cache"
import StatusBadge from "@/components/admin/status-badge"
import Link from "next/link"
import type { Database, Produce } from "@/types/database"

type DeliverySchedule = Database["public"]["Tables"]["delivery_schedules"]["Row"]

// Add refresh action with dynamic revalidation
async function refresh() {
  'use server'
  
  // Revalidate the orders page and related paths
  revalidatePath('/admin/orders')
  revalidatePath('/admin')  // Revalidate dashboard which shows recent orders
  revalidatePath('/admin/clients') // Revalidate clients page which shows client orders
  revalidatePath('/admin/farmers') // Revalidate farmers page which shows farmer orders
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  try {
    // Fetch all active produce types
    const { data: produceTypes, error: produceError } = await supabase
      .from('produce')
      .select('*')
      .eq('status', 'active')
      .order('name')

    if (produceError) {
      console.error('Error fetching produce types:', produceError)
      throw new Error('Failed to fetch produce types')
    }

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
        produce_id,
        produce:produce(*),
        produce_type,
        produce_nature,
        expected_quantity,
        unit,
        expected_quality_grade,
        dropoff_location,
        status,
        special_notes,
        clients:clients(
          id,
          name,
          email
        ),
        farmers:farmers(
          id,
          name,
          phone_number
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
        `produce.name.ilike.%${search}%,clients.name.ilike.%${search}%,farmers.name.ilike.%${search}%`
      )
    }

    // Apply sorting with nulls last
    const isAscending = sortOrder === "asc"
    query = query.order(sortBy, { ascending: isAscending, nullsFirst: false })

    // Apply pagination
    const itemsPerPage = 10
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Execute query with error handling
    const { data, count, error: queryError } = await query.range(from, to)

    if (queryError) {
      console.error('Supabase query error:', {
        message: queryError.message,
        hint: queryError.hint,
        details: queryError.details,
        code: queryError.code
      })
      throw new Error('Failed to fetch orders')
    }

    // Transform the data to match the Order interface
    const orders: Order[] = data?.map((order: any) => ({
      ...order,
      clients: order.clients?.[0] || { id: '', name: 'Unknown Client', email: '' },
      farmers: order.farmers?.[0] || { id: '', name: 'Unknown Farmer', phone_number: '' },
      produce: order.produce || null,
      expected_quantity: Number(order.expected_quantity) || 0,
      status: order.status as OrderStatus
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
            <form action={refresh}>
              <Button variant="outline" type="submit">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </form>
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
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select defaultValue={searchParams.produce_id as string || "all"}>
                  <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
                    <SelectValue placeholder="Filter by produce" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Produce</SelectItem>
                    {produceTypes?.map((produce: Produce) => (
                      <SelectItem key={produce.id} value={produce.id}>
                        {produce.name}
                      </SelectItem>
                    ))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-[#2D3047]">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-[#2D3047]">
                {orders.filter((order) => order.status === "in_progress" || order.status === "assigned").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-[#2D3047]">
                {orders.filter((order) => order.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-[#2D3047]">
                {orders.filter((order) => order.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E4E0]">
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">
                      <div className="flex items-center gap-2">
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Farmer</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Produce</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Quantity</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-[#5C6073]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#E8E4E0] hover:bg-[#F8F5F2]">
                      <td className="px-4 py-3 font-medium text-[#2D3047]">{order.id.substring(0, 8)}</td>
                      <td className="px-4 py-3">
                        {new Date(order.scheduled_delivery_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">{order.farmers?.name}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-[#2D3047]">{order.produce?.name || 'Unknown'}</div>
                          <div className="text-xs text-[#5C6073]">
                            {order.produce_nature}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{order.expected_quantity} {order.unit}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/orders/${order.id}`}>View Order</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error: any) {
    console.error('Error in OrdersPage:', error)
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading orders. Please try again later.</p>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
} 