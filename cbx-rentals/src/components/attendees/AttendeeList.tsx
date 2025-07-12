import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, X, Car, Plane, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { useAttendees, type AttendeeFilters } from '../../hooks/useAttendees'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { debounce } from 'lodash'
import type { AttendeeWithBookings } from '../../types'

type SortField = 'name' | 'email' | 'checkIn' | 'amount' | 'paymentStatus'
type SortDirection = 'asc' | 'desc'

export function AttendeeList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<AttendeeFilters>({
    search: '',
    paymentStatus: 'all',
    transportationNeeds: 'all'
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Debounced search implementation
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearch(value)
    }, 300),
    []
  )

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    debouncedSetSearch(value)
  }, [debouncedSetSearch])

  const { 
    attendees, 
    isLoading, 
    error, 
    page, 
    totalPages,
    setPage
  } = useAttendees({
    pageSize: 20,
    filters: useMemo(() => ({ ...filters, search: debouncedSearch }), [filters.paymentStatus, filters.transportationNeeds, filters.propertyId, debouncedSearch])
  })

  const clearFilters = () => {
    setFilters({
      search: '',
      paymentStatus: 'all',
      transportationNeeds: 'all'
    })
    setDebouncedSearch('')
  }

  const hasActiveFilters = filters.search || filters.paymentStatus !== 'all' || 
    filters.transportationNeeds !== 'all' || filters.propertyId

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getAttendeeBookingInfo = (attendee: AttendeeWithBookings) => {
    if (!attendee.bookings || attendee.bookings.length === 0) {
      return {
        property: 'No booking',
        checkIn: '-',
        checkOut: '-',
        totalAmount: 0,
        hasUnpaid: false,
        checkInDate: null
      }
    }

    // Get the most recent or active booking
    const currentBooking = attendee.bookings.reduce((latest, booking) => {
      const bookingDate = new Date(booking.arrival_date)
      const latestDate = new Date(latest.arrival_date)
      return bookingDate > latestDate ? booking : latest
    })

    const totalAmount = attendee.bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
    const hasUnpaid = attendee.bookings.some(booking => !booking.paid)

    return {
      property: currentBooking.property?.name || 'Unknown Property',
      checkIn: format(new Date(currentBooking.arrival_date), 'MMM d, yyyy'),
      checkOut: format(new Date(currentBooking.exit_date), 'MMM d, yyyy'),
      totalAmount,
      hasUnpaid,
      checkInDate: new Date(currentBooking.arrival_date)
    }
  }

  // Sort attendees based on current sort field
  const sortedAttendees = useMemo(() => {
    if (!sortField) return attendees

    const sorted = [...attendees].sort((a, b) => {
      const aInfo = getAttendeeBookingInfo(a)
      const bInfo = getAttendeeBookingInfo(b)

      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'checkIn':
          if (!aInfo.checkInDate && !bInfo.checkInDate) return 0
          if (!aInfo.checkInDate) return 1
          if (!bInfo.checkInDate) return -1
          comparison = aInfo.checkInDate.getTime() - bInfo.checkInDate.getTime()
          break
        case 'amount':
          comparison = aInfo.totalAmount - bInfo.totalAmount
          break
        case 'paymentStatus':
          comparison = (aInfo.hasUnpaid ? 1 : 0) - (bInfo.hasUnpaid ? 1 : 0)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [attendees, sortField, sortDirection])

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading attendees: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendee Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Payment Status</label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, paymentStatus: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Transportation</label>
                  <Select
                    value={filters.transportationNeeds}
                    onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, transportationNeeds: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="rental">Has Rental Car</SelectItem>
                      <SelectItem value="pickup">Needs Airport Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Attendee Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortField === 'email' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Current Property</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('checkIn')}
                  >
                    <div className="flex items-center gap-1">
                      Check In/Out
                      {sortField === 'checkIn' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-1">
                      Amount Owed
                      {sortField === 'amount' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center gap-1">
                      Payment Status
                      {sortField === 'paymentStatus' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Transportation</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Loading attendees...
                    </TableCell>
                  </TableRow>
                ) : attendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No attendees found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAttendees.map((attendee) => {
                    const bookingInfo = getAttendeeBookingInfo(attendee)
                    
                    return (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell>{attendee.email}</TableCell>
                        <TableCell>{attendee.phone}</TableCell>
                        <TableCell>{bookingInfo.property}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{bookingInfo.checkIn}</div>
                            <div className="text-muted-foreground">{bookingInfo.checkOut}</div>
                          </div>
                        </TableCell>
                        <TableCell>${bookingInfo.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={bookingInfo.hasUnpaid ? "destructive" : "success"}>
                            {bookingInfo.hasUnpaid ? "Unpaid" : "Paid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {attendee.has_rental_car && (
                              <Badge variant="outline" title="Has rental car">
                                <Car className="h-3 w-3" />
                              </Badge>
                            )}
                            {attendee.needs_airport_pickup && (
                              <Badge variant="outline" title="Needs airport pickup">
                                <Plane className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/attendees/${attendee.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}