import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  // Define status styles
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    // Default style if status doesn't match any of the above
    default: "bg-gray-100 text-gray-800 border-gray-200",
  }

  // Get the appropriate style based on status, or use default if not found
  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.default

  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", style, className)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
