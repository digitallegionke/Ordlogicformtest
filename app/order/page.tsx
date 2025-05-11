import { createClient } from "@/utils/supabase/server"
import OrderPageClient from "@/components/order-page-client"

export default async function OrderPage() {
  const supabase = createClient()

  // Fetch farmers for the dropdown
  const { data: farmers } = await supabase.from("farmers").select("id, name").order("name")

  // Fetch dropoff locations for the dropdown
  const { data: locations } = await supabase.from("drop_off_locations").select("name").order("name")
  const dropoffLocations = locations ? locations.map((loc) => loc.name) : undefined

  return <OrderPageClient farmers={farmers || []} dropoffLocations={dropoffLocations} />
}
