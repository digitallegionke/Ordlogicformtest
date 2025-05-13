"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ClipboardList, PackageCheck, PackageX, Plus } from "lucide-react"

interface ReceivingRecord {
  id: string
  client: { name: string }
  order_date: string
  is_dropped: boolean
  has_returns: boolean
}

export default function ReceivingDashboard() {
  const supabase = createClient()
  const [records, setRecords] = useState<ReceivingRecord[]>([])
  const [stats, setStats] = useState({
    total: 0,
    dropped: 0,
    withReturns: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch records with client information
        const { data, error } = await supabase
          .from("receiving_records")
          .select(`
            id,
            client:clients(name),
            order_date,
            is_dropped,
            has_returns
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error

        if (data) {
          // Transform the data to match the ReceivingRecord type
          const transformedData = data.map(record => ({
            id: record.id,
            client: { name: record.client[0]?.name || 'Unknown Client' },
            order_date: record.order_date,
            is_dropped: record.is_dropped,
            has_returns: record.has_returns
          }))

          setRecords(transformedData)
          setStats({
            total: transformedData.length,
            dropped: transformedData.filter(r => r.is_dropped).length,
            withReturns: transformedData.filter(r => r.has_returns).length
          })
        }
      } catch (error) {
        console.error('Error fetching records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2D3047]">Receiving Dashboard</h1>
        <Button asChild className="bg-[#97B980] hover:bg-[#7A9968] text-white">
          <Link href="/receiving/step1">
            <Plus className="mr-2 h-4 w-4" />
            New Receiving
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-[#5C6073]">Total Records</p>
              <h2 className={`text-4xl font-bold ${stats.total === 0 ? 'text-gray-300' : 'text-[#2D3047]'}`}>
                {stats.total}
              </h2>
            </div>
            <div className={`h-12 w-12 rounded-full ${stats.total === 0 ? 'bg-gray-100' : 'bg-blue-100'} flex items-center justify-center`}>
              <ClipboardList className={`h-6 w-6 ${stats.total === 0 ? 'text-gray-400' : 'text-blue-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-[#5C6073]">Dropped Orders</p>
              <h2 className={`text-4xl font-bold ${stats.dropped === 0 ? 'text-gray-300' : 'text-[#2D3047]'}`}>
                {stats.dropped}
              </h2>
            </div>
            <div className={`h-12 w-12 rounded-full ${stats.dropped === 0 ? 'bg-gray-100' : 'bg-green-100'} flex items-center justify-center`}>
              <PackageCheck className={`h-6 w-6 ${stats.dropped === 0 ? 'text-gray-400' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-[#5C6073]">With Returns</p>
              <h2 className={`text-4xl font-bold ${stats.withReturns === 0 ? 'text-gray-300' : 'text-[#2D3047]'}`}>
                {stats.withReturns}
              </h2>
            </div>
            <div className={`h-12 w-12 rounded-full ${stats.withReturns === 0 ? 'bg-gray-100' : 'bg-orange-100'} flex items-center justify-center`}>
              <PackageX className={`h-6 w-6 ${stats.withReturns === 0 ? 'text-gray-400' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-[#2D3047] mb-6">Recent Receiving Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-[#5C6073] font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-[#5C6073] font-medium">Client</th>
                  <th className="text-left py-3 px-4 text-[#5C6073] font-medium">Order Date</th>
                  <th className="text-left py-3 px-4 text-[#5C6073] font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-[#5C6073] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="py-3 px-4 text-sm">{record.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-sm">{record.client.name}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(record.order_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="secondary" 
                        className={`${record.is_dropped ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {record.is_dropped ? 'Dropped' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" asChild>
                        <Link href={`/receiving/${record.id}`}>
                          View Details
                        </Link>
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
} 