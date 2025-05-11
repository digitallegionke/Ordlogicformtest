import { Badge } from "@/components/ui/badge"
import type { DeliveryScheduleStatus } from "@/types/database"

interface StatusBadgeProps {
  status: DeliveryScheduleStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: DeliveryScheduleStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "assigned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "in_progress":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Badge variant="secondary" className={getStatusColor(status)}>
      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </Badge>
  )
}
