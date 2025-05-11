export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      farmers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string | null
          phone_number: string
          address: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email?: string | null
          phone_number: string
          address?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string | null
          phone_number?: string
          address?: string | null
          status?: string
        }
      }
      delivery_schedules: {
        Row: {
          id: string
          created_at: string
          scheduled_delivery_date: string
          produce_type: string
          produce_nature: string
          expected_quantity: number
          expected_quality_grade: string
          dropoff_location: string
          status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          special_notes: string | null
          farmer_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          scheduled_delivery_date: string
          produce_type: string
          produce_nature: string
          expected_quantity: number
          expected_quality_grade: string
          dropoff_location: string
          status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          special_notes?: string | null
          farmer_id: string
        }
        Update: {
          id?: string
          created_at?: string
          scheduled_delivery_date?: string
          produce_type?: string
          produce_nature?: string
          expected_quantity?: number
          expected_quality_grade?: string
          dropoff_location?: string
          status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          special_notes?: string | null
          farmer_id?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          stock_quantity: number
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          stock_quantity?: number
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          stock_quantity?: number
          status?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          product_id?: string
          quantity?: number
        }
      }
    }
  }
}

// Export commonly used types
export type Product = Database['public']['Tables']['products']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
