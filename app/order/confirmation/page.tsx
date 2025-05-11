import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft } from "lucide-react"

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl font-serif text-[#2D3047]">
              Order Submitted Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#5C6073]">
              Your order has been received and is being processed. You will receive a confirmation email shortly with the order details.
            </p>
            <p className="text-[#5C6073]">
              Our team will review your order and coordinate with the farmers for delivery scheduling.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button asChild variant="outline">
                <Link href="/order">Place Another Order</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">View Your Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 