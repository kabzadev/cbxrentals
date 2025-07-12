// Type definitions for CBX Rentals application

// Export database types
export type { Database } from './database'
export type { Json } from './database'

// Re-export specific table types for convenience
import type { Database } from './database'

export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type Attendee = Database['public']['Tables']['attendees']['Row']
export type AttendeeInsert = Database['public']['Tables']['attendees']['Insert']
export type AttendeeUpdate = Database['public']['Tables']['attendees']['Update']

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

// Additional type helpers
export interface BookingWithRelations extends Booking {
  attendee?: Attendee
  property?: Property
}

export interface PropertyWithBookings extends Property {
  bookings?: BookingWithRelations[]
}

export interface AttendeeWithBookings extends Attendee {
  bookings?: BookingWithRelations[]
}
