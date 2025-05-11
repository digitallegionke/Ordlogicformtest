"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  status: "success" | "error"
  title: string
  message: string
}

export default function OrderStatusModal({
  isOpen,
  onClose,
  status,
  title,
  message,
}: OrderStatusModalProps) {
  const router = useRouter()

  const handleClose = () => {
    onClose()
    if (status === "success") {
      router.push("/order/confirmation")
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant={status === "success" ? "default" : "secondary"}
            onClick={handleClose}
          >
            {status === "success" ? "View Order" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 