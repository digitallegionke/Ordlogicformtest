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
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      produce: {
        Row: {
          id: string
          name: string
          category: string | null
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          unit?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          unit?: string
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
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      receiving_records: {
        Row: {
          id: string
          client_id: string
          order_date: string
          is_dropped: boolean
          drop_time: string | null
          drop_notes: string | null
          has_returns: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          order_date: string
          is_dropped?: boolean
          drop_time?: string | null
          drop_notes?: string | null
          has_returns?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          order_date?: string
          is_dropped?: boolean
          drop_time?: string | null
          drop_notes?: string | null
          has_returns?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      receiving_items: {
        Row: {
          id: string
          receiving_id: string
          produce_id: string | null
          name: string | null
          ordered_quantity: number
          received_quantity: number
          grade_a: number
          grade_b: number
          grade_c: number
          returned_quantity: number
          return_reason: string | null
          return_notes: string | null
          grading_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          receiving_id: string
          produce_id?: string | null
          name?: string | null
          ordered_quantity: number
          received_quantity: number
          grade_a?: number
          grade_b?: number
          grade_c?: number
          returned_quantity?: number
          return_reason?: string | null
          return_notes?: string | null
          grading_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          receiving_id?: string
          produce_id?: string | null
          name?: string | null
          ordered_quantity?: number
          received_quantity?: number
          grade_a?: number
          grade_b?: number
          grade_c?: number
          returned_quantity?: number
          return_reason?: string | null
          return_notes?: string | null
          grading_notes?: string | null
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
