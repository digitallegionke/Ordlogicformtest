import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import StatusBadge from "@/components/admin/status-badge"

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  // Parse query parameters
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined

  // Build query
  let query = supabase.from("clients").select(
    `
    id,
    name,
    email,
    phone_number,
    created_at,
    delivery_schedules (
      id,
      status,
      scheduled_delivery_date
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
  const { data: clients, count } = await query.range(from, to).order("name")

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Clients</h1>
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
          <CardTitle>Search Clients</CardTitle>
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
        {clients?.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-[#2D3047]">{client.name}</h3>
                  <p className="text-[#5C6073]">{client.email}</p>
                  {client.phone_number && (
                    <p className="text-sm text-[#5C6073]">{client.phone_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-[#5C6073]">
                    <p>
                      Total Orders:{" "}
                      <span className="font-medium text-[#2D3047]">
                        {client.delivery_schedules.length}
                      </span>
                    </p>
                    <p>
                      Active Orders:{" "}
                      <span className="font-medium text-[#2D3047]">
                        {
                          client.delivery_schedules.filter(
                            (order) => order.status !== "delivered" && order.status !== "cancelled"
                          ).length
                        }
                      </span>
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/admin/clients/${client.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>

              {client.delivery_schedules.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-[#5C6073] mb-3">Recent Orders</h4>
                  <div className="grid gap-2">
                    {client.delivery_schedules
                      .sort(
                        (a, b) =>
                          new Date(b.scheduled_delivery_date).getTime() -
                          new Date(a.scheduled_delivery_date).getTime()
                      )
                      .slice(0, 3)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between py-2 px-3 bg-[#F8F5F2] rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <span className="text-sm text-[#2D3047]">
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
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#5C6073]">
            Showing {Math.min((page - 1) * itemsPerPage + 1, count || 0)} to{" "}
            {Math.min(page * itemsPerPage, count || 0)} of {count} clients
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