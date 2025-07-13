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
          bedrooms?: number
          bathrooms?: number
          sleeps?: number
          property_type?: string
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
          bedrooms?: number
          bathrooms?: number
          sleeps?: number
          property_type?: string
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
          bedrooms?: number
          bathrooms?: number
          sleeps?: number
          property_type?: string
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
          arrival_airline?: string | null
          arrival_flight_number?: string | null
          arrival_time?: string | null
          departure_airline?: string | null
          departure_flight_number?: string | null
          departure_time?: string | null
          interested_in_carpool?: boolean
          checked_in: boolean
          check_in_time?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          has_rental_car?: boolean
          needs_airport_pickup?: boolean
          arrival_airline?: string | null
          arrival_flight_number?: string | null
          arrival_time?: string | null
          departure_airline?: string | null
          departure_flight_number?: string | null
          departure_time?: string | null
          interested_in_carpool?: boolean
          checked_in?: boolean
          check_in_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          has_rental_car?: boolean
          needs_airport_pickup?: boolean
          arrival_airline?: string | null
          arrival_flight_number?: string | null
          arrival_time?: string | null
          departure_airline?: string | null
          departure_flight_number?: string | null
          departure_time?: string | null
          interested_in_carpool?: boolean
          checked_in?: boolean
          check_in_time?: string | null
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