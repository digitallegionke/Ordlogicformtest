import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ClientOrderForm from "@/components/client-order-form"
import { createClient } from "@/utils/supabase/server"

export default async function OrderPage() {
  const supabase = createClient()

  // Fetch farmers for the dropdown
  const { data: farmers } = await supabase.from("farmers").select("id, name").order("name")

  // Fetch dropoff locations for the dropdown
  const { data: locations } = await supabase.from("drop_off_locations").select("name").order("name")
  const dropoffLocations = locations ? locations.map((loc) => loc.name) : undefined

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-3xl font-serif font-medium text-[#2D3047] mb-2">Place Your Order</h1>
          <p className="text-[#5C6073]">Fill out the form below to schedule produce deliveries</p>
        </div>

        <ClientOrderForm farmers={farmers || []} dropoffLocations={dropoffLocations} />
      </div>
    </div>
  )
}
