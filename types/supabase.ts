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
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_schedules: {
        Row: {
          id: string
          client_id: string
          farmer_id: string
          produce_type: string
          produce_nature: string
          expected_quantity: number
          expected_quality_grade: string
          dropoff_location: string
          scheduled_delivery_date: string
          special_notes: string | null
          contact_person: string
          contact_phone: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          farmer_id: string
          produce_type: string
          produce_nature: string
          expected_quantity: number
          expected_quality_grade: string
          dropoff_location: string
          scheduled_delivery_date: string
          special_notes?: string | null
          contact_person: string
          contact_phone: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          farmer_id?: string
          produce_type?: string
          produce_nature?: string
          expected_quantity?: number
          expected_quality_grade?: string
          dropoff_location?: string
          scheduled_delivery_date?: string
          special_notes?: string | null
          contact_person?: string
          contact_phone?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      farmers: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string | null
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
