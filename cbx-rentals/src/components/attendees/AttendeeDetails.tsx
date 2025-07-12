import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Car, Plane, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '../ui/use-toast'
import type { AttendeeWithBookings } from '../../types'

export function AttendeeDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [attendee, setAttendee] = useState<AttendeeWithBookings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchAttendeeDetails()
    }
  }, [id])

  const fetchAttendeeDetails = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('attendees')
        .select(`
          *,
          bookings (
            *,
            property:properties (*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setAttendee(data)
    } catch (error) {
      console.error('Error fetching attendee:', error)
      toast({
        title: 'Error',
        description: 'Failed to load attendee details',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updatePaymentStatus = async (bookingId: string, paid: boolean) => {
    try {
      setIsUpdating(bookingId)
      const { error } = await supabase
        .from('bookings')
        .update({ paid })
        .eq('id', bookingId)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Payment status updated to ${paid ? 'paid' : 'unpaid'}`
      })

      // Refetch attendee details to update UI
      await fetchAttendeeDetails()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading attendee details...</p>
      </div>
    )
  }

  if (!attendee) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="mb-4">Attendee not found</p>
        <Button onClick={() => navigate('/attendees')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Attendees
        </Button>
      </div>
    )
  }

  const totalAmount = attendee.bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0
  const totalPaid = attendee.bookings?.filter(b => b.paid).reduce((sum, booking) => sum + booking.total_amount, 0) || 0
  const totalOwed = totalAmount - totalPaid

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/attendees')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Attendees
        </Button>
      </div>

      {/* Attendee Information */}
      <Card>
        <CardHeader>
          <CardTitle>{attendee.name}</CardTitle>
          <CardDescription>Attendee Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{attendee.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{attendee.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Transportation:</p>
            <div className="flex gap-2">
              {attendee.has_rental_car && (
                <Badge variant="outline">
                  <Car className="mr-1 h-3 w-3" />
                  Has Rental Car
                </Badge>
              )}
              {attendee.needs_airport_pickup && (
                <Badge variant="outline">
                  <Plane className="mr-1 h-3 w-3" />
                  Needs Airport Pickup
                </Badge>
              )}
              {!attendee.has_rental_car && !attendee.needs_airport_pickup && (
                <span className="text-sm text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Amount Owed</p>
              <p className="text-2xl font-bold text-red-600">${totalOwed.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>All bookings for this attendee</CardDescription>
        </CardHeader>
        <CardContent>
          {!attendee.bookings || attendee.bookings.length === 0 ? (
            <p className="text-center text-muted-foreground">No bookings found</p>
          ) : (
            <div className="space-y-4">
              {attendee.bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        {booking.property?.name || 'Unknown Property'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.property?.address}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-medium">Check-in:</span>{' '}
                          {format(new Date(booking.arrival_date), 'MMM d, yyyy')}
                        </div>
                        <div>
                          <span className="font-medium">Check-out:</span>{' '}
                          {format(new Date(booking.exit_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold">
                          ${booking.total_amount.toFixed(2)}
                        </p>
                        <Badge variant={booking.paid ? 'success' : 'destructive'}>
                          {booking.paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {booking.paid ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePaymentStatus(booking.id, false)}
                          disabled={isUpdating === booking.id}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Mark Unpaid
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updatePaymentStatus(booking.id, true)}
                          disabled={isUpdating === booking.id}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}