import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import StatusBadge from "@/components/admin/status-badge"

interface RecentOrdersTableProps {
  orders: any[]
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return <p className="text-center py-4 text-[#5C6073]">No recent orders found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E8E4E0]">
            <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Order ID</th>
            <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Client</th>
            <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Delivery Date</th>
            <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Status</th>
            <th className="px-4 py-3 text-right font-medium text-[#5C6073]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-[#E8E4E0] hover:bg-[#F8F5F2]">
              <td className="px-4 py-3 font-medium text-[#2D3047]">{order.id.substring(0, 8)}</td>
              <td className="px-4 py-3">{order.clients?.name || "Unknown"}</td>
              <td className="px-4 py-3">{formatDate(order.scheduled_delivery_date)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status || "pending"} />
              </td>
              <td className="px-4 py-3 text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatDate(dateString: string): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    return "Invalid Date"
  }
}
