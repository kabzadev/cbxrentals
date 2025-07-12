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
      properties: {
        Row: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          max_occupancy: number
          price_per_night: number
          listing_url?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude: number
          longitude: number
          max_occupancy: number
          price_per_night: number
          listing_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          max_occupancy?: number
          price_per_night?: number
          listing_url?: string | null
          created_at?: string
        }
      }
      attendees: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          has_rental_car: boolean
          needs_airport_pickup: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          has_rental_car?: boolean
          needs_airport_pickup?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          has_rental_car?: boolean
          needs_airport_pickup?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          attendee_id: string
          property_id: string
          arrival_date: string
          exit_date: string
          total_amount: number
          paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          attendee_id: string
          property_id: string
          arrival_date: string
          exit_date: string
          total_amount: number
          paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          attendee_id?: string
          property_id?: string
          arrival_date?: string
          exit_date?: string
          total_amount?: number
          paid?: boolean
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}