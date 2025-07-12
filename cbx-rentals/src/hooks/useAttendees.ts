import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { AttendeeWithBookings } from '../types'

export interface AttendeeFilters {
  search: string
  propertyId?: string
  paymentStatus?: 'paid' | 'unpaid' | 'all'
  transportationNeeds?: 'rental' | 'pickup' | 'all'
}

export interface UseAttendeesOptions {
  page?: number
  pageSize?: number
  filters?: AttendeeFilters
}

export interface UseAttendeesReturn {
  attendees: AttendeeWithBookings[]
  isLoading: boolean
  error: Error | null
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  setPage: (page: number) => void
  updatePaymentStatus: (bookingId: string, paid: boolean) => Promise<void>
  refetch: () => Promise<void>
}

export function useAttendees({
  page = 1,
  pageSize = 20,
  filters = { search: '', paymentStatus: 'all', transportationNeeds: 'all' }
}: UseAttendeesOptions = {}): UseAttendeesReturn {
  const [attendees, setAttendees] = useState<AttendeeWithBookings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(page)

  const fetchAttendees = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Start with base query
      let query = supabase
        .from('attendees')
        .select(`
          *,
          bookings (
            *,
            property:properties (*)
          )
        `, { count: 'exact' })

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      // Apply transportation filter
      if (filters.transportationNeeds === 'rental') {
        query = query.eq('has_rental_car', true)
      } else if (filters.transportationNeeds === 'pickup') {
        query = query.eq('needs_airport_pickup', true)
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      // Post-process for property and payment filters
      let filteredData = data || []

      // Filter by property if needed
      if (filters.propertyId) {
        filteredData = filteredData.filter((attendee: AttendeeWithBookings) => 
          attendee.bookings?.some((booking: any) => booking.property_id === filters.propertyId)
        )
      }

      // Filter by payment status if needed
      if (filters.paymentStatus !== 'all') {
        filteredData = filteredData.filter((attendee: AttendeeWithBookings) => {
          const hasPaidBookings = attendee.bookings?.some((booking: any) => booking.paid)
          const hasUnpaidBookings = attendee.bookings?.some((booking: any) => !booking.paid)
          
          if (filters.paymentStatus === 'paid') {
            return hasPaidBookings && !hasUnpaidBookings
          } else {
            return hasUnpaidBookings
          }
        })
      }

      setAttendees(filteredData)
      setTotalCount(count || 0)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching attendees:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    fetchAttendees()
  }, [currentPage, pageSize, filters.search, filters.propertyId, filters.paymentStatus, filters.transportationNeeds])

  const updatePaymentStatus = useCallback(async (bookingId: string, paid: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ paid })
        .eq('id', bookingId)

      if (updateError) throw updateError

      // Refetch to update the UI
      await fetchAttendees()
    } catch (err) {
      console.error('Error updating payment status:', err)
      throw err
    }
  }, [fetchAttendees])

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize])

  return {
    attendees,
    isLoading,
    error,
    totalCount,
    page: currentPage,
    pageSize,
    totalPages,
    setPage: setCurrentPage,
    updatePaymentStatus,
    refetch: fetchAttendees
  }
}