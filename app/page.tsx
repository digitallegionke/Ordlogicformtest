import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClipboardList, LayoutDashboard, ShoppingCart } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#2D3047] mb-2">Ordlogic</h1>
        <p className="text-[#5C6073] text-lg mb-8">Schedule and manage your fresh produce deliveries</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-[#97B980] hover:bg-[#7A9968] text-white">
            <Link href="/order">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Place Order
            </Link>
          </Button>

          <Button asChild className="bg-[#97B980] hover:bg-[#7A9968] text-white">
            <Link href="/form">
              <ClipboardList className="mr-2 h-4 w-4" />
              Schedule Delivery
            </Link>
          </Button>

          <Button asChild variant="outline" className="bg-white hover:bg-[#F8F5F2]">
            <Link href="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
        </div>
      </header>
    </main>
  )
}
