export type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  price: number
  stock_quantity: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  // Joined fields
  product?: Product
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type DeliveryScheduleStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

export type Client = {
  id: string
  name: string
  email: string
  phone_number: string | null
  created_at: string
  updated_at: string
}

export type Farmer = {
  id: string
  name: string
  phone_number: string | null
  created_at: string
  updated_at: string
}

export type DropOffLocation = {
  id: string
  name: string
  address: string
  storage_type: string
  max_capacity: number
  available_capacity: number
  created_at: string
  updated_at: string
}

export type DeliverySchedule = {
  id: string
  client_id: string
  farmer_id: string | null
  produce_type: string
  produce_nature: string
  expected_quantity: number
  expected_quality_grade: string
  dropoff_location: string
  scheduled_delivery_date: string
  special_notes: string | null
  packaging_type: string | null
  payment_terms: string | null
  certifications: string[] | null
  delivery_frequency: string | null
  contract_duration: string | null
  status: string
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string | null
  status: OrderStatus
  total_amount: number
  delivery_address: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  delivery_notes: string | null
  delivery_schedule_id: string | null
  created_at: string
  updated_at: string
  // Joined fields
  items?: OrderItem[]
  delivery_schedule?: DeliverySchedule
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  // Joined fields
  product?: Product
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      cart_items: {
        Row: CartItem
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CartItem, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
      }
      farmers: {
        Row: Farmer
        Insert: Omit<Farmer, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Farmer, 'id' | 'created_at' | 'updated_at'>>
      }
      drop_off_locations: {
        Row: DropOffLocation
        Insert: Omit<DropOffLocation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DropOffLocation, 'id' | 'created_at' | 'updated_at'>>
      }
      delivery_schedules: {
        Row: {
          id: string
          client_id: string
          farmer_id: string | null
          produce_type: string
          produce_nature: string
          expected_quantity: number
          expected_quality_grade: string
          dropoff_location: string
          scheduled_delivery_date: string
          special_notes: string | null
          packaging_type: string | null
          payment_terms: string | null
          delivery_frequency: string | null
          contract_duration: string | null
          certifications: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          farmer_id?: string | null
          produce_type: string
          produce_nature: string
          expected_quantity: number
          expected_quality_grade: string
          dropoff_location: string
          scheduled_delivery_date: string
          special_notes?: string | null
          packaging_type?: string | null
          payment_terms?: string | null
          delivery_frequency?: string | null
          contract_duration?: string | null
          certifications?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          farmer_id?: string | null
          produce_type?: string
          produce_nature?: string
          expected_quantity?: number
          expected_quality_grade?: string
          dropoff_location?: string
          scheduled_delivery_date?: string
          special_notes?: string | null
          packaging_type?: string | null
          payment_terms?: string | null
          delivery_frequency?: string | null
          contract_duration?: string | null
          certifications?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 