import type { Database } from './database'

// Get the base delivery schedule type from our database types
type DeliverySchedule = Database['public']['Tables']['delivery_schedules']['Row']
type Farmer = Database['public']['Tables']['farmers']['Row']

// Define the Order type which extends DeliverySchedule
export type Order = DeliverySchedule & {
  farmers?: Farmer | null
  clients?: {
    id: string
    name: string
    email: string
  } | null
  produce: Database['public']['Tables']['produce']['Row'] | null
}

// Export the status type from our database schema
export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' 