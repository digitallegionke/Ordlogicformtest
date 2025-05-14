"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Eye, MoreVertical, CheckCircle, Truck, XCircle } from "lucide-react"
import StatusBadge from "@/components/admin/status-badge"
import type { Order, OrderStatus } from "@/types/orders"

interface OrdersTableProps {
  orders: Order[]
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
}

export default function OrdersTable({
  orders,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
}: OrdersTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId)

    try {
      const { error } = await supabase
        .from("delivery_schedules")
        .update({ status: newStatus })
        .eq("id", orderId)

      if (error) {
        console.error('Status update error:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        throw error
      }

      toast({
        title: "Status updated",
        description: `Order status has been updated to ${newStatus.replace('_', ' ')}`,
      })

      // Single refresh call with a small delay to ensure the update is processed
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center text-[#5C6073]">
        <p>No orders found matching the current filters.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E4E0]">
              <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Order ID</th>
              <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Client</th>
              <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Farmer</th>
              <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Produce</th>
              <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Delivery Date</th>
              <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Status</th>
              <th className="px-4 py-3 text-right font-medium text-[#5C6073]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#E8E4E0] hover:bg-[#F8F5F2]">
                <td className="px-4 py-3 font-medium text-[#2D3047]">{order.id.substring(0, 8)}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-[#2D3047]">{order.clients?.name || 'Unknown Client'}</div>
                    <div className="text-xs text-[#5C6073]">{order.clients?.email || 'No email'}</div>
                  </div>
                </td>
                <td className="px-4 py-3">{order.farmers?.name || 'Unknown Farmer'}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-[#2D3047]">{order.produce?.name || 'Unknown'}</div>
                    <div className="text-xs text-[#5C6073]">
                      {order.expected_quantity} {order.unit} - {order.produce_nature}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatDate(order.scheduled_delivery_date)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating === order.id}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/orders/${order.id}`} className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {order.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(order.id, "confirmed")}
                          className="text-blue-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Order
                        </DropdownMenuItem>
                      )}
                      {order.status === "confirmed" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(order.id, "in_transit")}
                          className="text-purple-600"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Mark as In Transit
                        </DropdownMenuItem>
                      )}
                      {(order.status === "pending" || order.status === "confirmed") && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(order.id, "cancelled")}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#5C6073]">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => router.push(`/admin/orders?page=${currentPage - 1}`)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => router.push(`/admin/orders?page=${currentPage + 1}`)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 