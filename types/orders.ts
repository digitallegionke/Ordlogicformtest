export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  created_at: string
  scheduled_delivery_date: string
  produce_type: string
  produce_nature: string
  expected_quantity: number
  expected_quality_grade: string
  dropoff_location: string
  status: OrderStatus
  special_notes: string
  clients: {
    id: string
    name: string
    email: string
  }
  farmers: {
    id: string
    name: string
  }
} 