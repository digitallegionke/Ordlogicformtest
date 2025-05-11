"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw, Star } from "lucide-react"
import Link from "next/link"
import StatusBadge from "@/components/admin/status-badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Helper function to build query object
function buildQuery(baseParams: { [key: string]: string | undefined }, updates: { [key: string]: string | number }) {
  const query: { [key: string]: string | number } = {}
  
  // Only include search if it exists
  if (baseParams.search) {
    query.search = baseParams.search
  }
  
  // Add all updates
  Object.assign(query, updates)
  
  return query
}

export default function FarmersPage() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // State for farmers and loading
  const [farmers, setFarmers] = useState<any[]>([])
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse query parameters
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  const search = searchParams.get('search') || undefined
  const tab = searchParams.get('tab') || "all"

  // Calculate pagination values
  const itemsPerPage = 10
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const fetchFarmers = async () => {
    try {
      setError(null)
      console.log('Starting farmer fetch...')
      
      // Build query
      let query = supabase.from("farmers").select(
        `
        id,
        name,
        phone_number,
        created_at,
        is_active,
        delivery_schedules!inner (
          id,
          status,
          scheduled_delivery_date,
          produce_type,
          expected_quantity
        )
      `,
        { count: "exact" }
      )

      if (search) {
        query = query.or(`name.ilike.%${search}%`)
      }

      // Filter by active status based on tab
      if (tab === "active") {
        query = query.eq("is_active", true)
      } else if (tab === "inactive") {
        query = query.eq("is_active", false)
      }

      console.log('Query built, executing...')

      // First, let's try a simple query to check if the table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from("farmers")
        .select("id")
        .limit(1)

      if (tableError) {
        console.error('Table check error:', tableError)
        throw new Error(`Table check failed: ${tableError.message}`)
      }

      console.log('Table check passed:', tableCheck)

      // Now execute the full query
      const { data, count: totalCount, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          hint: error.hint,
          details: error.details,
          code: error.code
        })
        throw new Error(error.message || 'Failed to fetch farmers')
      }

      console.log('Query successful:', {
        dataCount: data?.length || 0,
        totalCount,
        firstRecord: data?.[0]
      })

      setFarmers(data || [])
      setCount(totalCount || 0)
    } catch (error: any) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        error
      })
      setError(error?.message || "An error occurred while fetching farmers")
      toast({
        title: "Error",
        description: error?.message || "Failed to load farmers",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchFarmers().finally(() => setIsLoading(false))
  }, [supabase, search, tab, page, from, to])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchFarmers()
    setIsRefreshing(false)
  }

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0

  // Calculate farmer statistics
  const calculateFarmerStats = (farmer: any) => {
    const completedDeliveries = farmer.delivery_schedules.filter(
      (order: any) => order.status === "delivered"
    ).length
    const totalDeliveries = farmer.delivery_schedules.length
    const deliveryRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0

    return {
      deliveryRate: Math.round(deliveryRate),
      averageQuality: "-",
      totalVolume: farmer.delivery_schedules.reduce(
        (sum: number, order: any) => sum + (order.expected_quantity || 0),
        0
      ),
    }
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading farmers: {error}
      </div>
    )
  }

  if (isLoading) {
    return <div className="p-4">Loading farmers...</div>
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
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
          <form
            className="flex gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const searchQuery = formData.get('search')?.toString() || ''
              window.location.href = `/admin/farmers?${new URLSearchParams({
                search: searchQuery,
                tab: tab,
                page: '1'
              })}`
            }}
          >
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={search}
                className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              />
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
          <TabsTrigger 
            value="all" 
            className="flex-1 max-w-[200px]"
            asChild
          >
            <Link 
              href={{
                pathname: "/admin/farmers",
                query: buildQuery({ search }, { tab: "all", page: 1 })
              }}
            >
              All Farmers
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="flex-1 max-w-[200px]"
            asChild
          >
            <Link 
              href={{
                pathname: "/admin/farmers",
                query: buildQuery({ search }, { tab: "active", page: 1 })
              }}
            >
              Active Farmers
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="inactive" 
            className="flex-1 max-w-[200px]"
            asChild
          >
            <Link 
              href={{
                pathname: "/admin/farmers",
                query: buildQuery({ search }, { tab: "inactive", page: 1 })
              }}
            >
              Inactive Farmers
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {farmers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No farmers found. {search ? 'Try a different search term or ' : ''} 
                <Link href="/admin/farmers/new" className="text-primary hover:underline">
                  add a new farmer
                </Link>.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {farmers.map((farmer) => {
                const stats = calculateFarmerStats(farmer)
                return (
                  <Card key={farmer.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-[#2D3047]">{farmer.name}</h3>
                            <StatusBadge status={farmer.is_active ? "active" : "inactive"} />
                          </div>
                          <p className="text-[#5C6073]">{farmer.phone_number}</p>
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
                                {stats.averageQuality !== "-" && <Star className="h-4 w-4 ml-1 text-amber-500" />}
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
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-[#5C6073]">
                Showing {Math.min((page - 1) * itemsPerPage + 1, count)} to{" "}
                {Math.min(page * itemsPerPage, count)} of {count} farmers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  asChild
                >
                  <Link
                    href={{
                      pathname: "/admin/farmers",
                      query: buildQuery(
                        { search },
                        { ...(tab !== "all" ? { tab } : {}), page: page - 1 }
                      )
                    }}
                  >
                    Previous
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  asChild
                >
                  <Link
                    href={{
                      pathname: "/admin/farmers",
                      query: buildQuery(
                        { search },
                        { ...(tab !== "all" ? { tab } : {}), page: page + 1 }
                      )
                    }}
                  >
                    Next
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 