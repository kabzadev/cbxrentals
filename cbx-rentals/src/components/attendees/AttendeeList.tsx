import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, X, Car, Plane, ArrowUpDown, ArrowUp, ArrowDown, Check, CheckCircle, XCircle } from 'lucide-react'
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
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { formatPhoneNumber } from '../../lib/formatters'

type SortField = 'name' | 'checkIn' | 'checkedIn' | 'paymentStatus'
type SortDirection = 'asc' | 'desc'

export function AttendeeList() {
  const navigate = useNavigate()
  const { userType, attendeeData } = useAuthStore()
  const isAdmin = userType === 'admin'
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

  // Get current user's property for grouping
  const currentUserProperty = useMemo(() => {
    if (userType !== 'attendee' || !attendeeData?.bookings?.[0]) return null
    return attendeeData.bookings[0].property_id
  }, [userType, attendeeData])
  
  const { 
    attendees, 
    isLoading, 
    error
  } = useAttendees({
    pageSize: 1000, // Fetch all attendees
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

  const handleCheckInToggle = async (attendeeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('attendees')
        .update({ 
          checked_in: !currentStatus,
          check_in_time: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', attendeeId)

      if (error) {
        console.error('Error updating check-in status:', error)
        return
      }

      // Refresh the attendees list to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error updating check-in status:', error)
    }
  }

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

    // Parse dates as local dates (not UTC) to avoid timezone issues
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    
    // Special handling for off-site attendees
    if (currentBooking.property?.name === 'Off-site') {
      return {
        property: 'Off-site',
        checkIn: format(parseLocalDate(currentBooking.arrival_date), 'MMM d, yyyy'),
        checkOut: format(parseLocalDate(currentBooking.exit_date), 'MMM d, yyyy'),
        totalAmount: 0,
        hasUnpaid: false,
        checkInDate: parseLocalDate(currentBooking.arrival_date)
      }
    }

    return {
      property: currentBooking.property?.name || 'Unknown Property',
      checkIn: format(parseLocalDate(currentBooking.arrival_date), 'MMM d, yyyy'),
      checkOut: format(parseLocalDate(currentBooking.exit_date), 'MMM d, yyyy'),
      totalAmount,
      hasUnpaid,
      checkInDate: parseLocalDate(currentBooking.arrival_date)
    }
  }

  // Sort and group attendees based on current user's house
  const { sortedAttendees, groupedData } = useMemo(() => {
    let sorted = [...attendees]

    // Apply sorting if specified
    if (sortField) {
      sorted = sorted.sort((a, b) => {
        const aInfo = getAttendeeBookingInfo(a)
        const bInfo = getAttendeeBookingInfo(b)

        let comparison = 0

        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'checkIn':
            if (!aInfo.checkInDate && !bInfo.checkInDate) return 0
            if (!aInfo.checkInDate) return 1
            if (!bInfo.checkInDate) return -1
            comparison = aInfo.checkInDate.getTime() - bInfo.checkInDate.getTime()
            break
          case 'checkedIn':
            comparison = ((a as any).checked_in ? 1 : 0) - ((b as any).checked_in ? 1 : 0)
            break
          case 'paymentStatus':
            comparison = (aInfo.hasUnpaid ? 1 : 0) - (bInfo.hasUnpaid ? 1 : 0)
            break
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    // Group by house if current user is an attendee
    if (currentUserProperty && userType === 'attendee') {
      const sameHouse = []
      const otherHouses = []

      sorted.forEach(attendee => {
        const attendeeProperty = attendee.bookings?.[0]?.property_id
        if (attendeeProperty === currentUserProperty) {
          sameHouse.push(attendee)
        } else {
          otherHouses.push(attendee)
        }
      })

      return {
        sortedAttendees: [...sameHouse, ...otherHouses],
        groupedData: {
          sameHouseCount: sameHouse.length,
          otherHouseCount: otherHouses.length,
          sameHouseAttendees: sameHouse,
          otherHouseAttendees: otherHouses
        }
      }
    }

    return {
      sortedAttendees: sorted,
      groupedData: null
    }
  }, [attendees, sortField, sortDirection, currentUserProperty, userType])

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
        <CardContent className="pt-6">
          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
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
                      <SelectItem value="rental">Has Vehicle</SelectItem>
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

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-md border">
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
                  <TableHead>Phone</TableHead>
                  <TableHead>House</TableHead>
                  <TableHead>Vehicle</TableHead>
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
                  {isAdmin && (
                    <>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('checkedIn')}
                      >
                        <div className="flex items-center gap-1">
                          Check-in Confirmed
                          {sortField === 'checkedIn' ? (
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
                    </>
                  )}
                  {isAdmin && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 5} className="text-center">
                      Loading attendees...
                    </TableCell>
                  </TableRow>
                ) : attendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 5} className="text-center">
                      No attendees found
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {/* Same house section */}
                    {groupedData && groupedData.sameHouseCount > 0 && (
                      <>
                        <TableRow className="bg-gray-100 hover:bg-gray-100">
                          <TableCell colSpan={isAdmin ? 8 : 5} className="py-2 px-4 font-semibold text-gray-900 text-sm">
                            Your Housemates ({groupedData.sameHouseCount} {groupedData.sameHouseCount === 1 ? 'person' : 'people'})
                          </TableCell>
                        </TableRow>
                        {groupedData.sameHouseAttendees.map((attendee) => {
                          const bookingInfo = getAttendeeBookingInfo(attendee)
                          return (
                            <TableRow key={attendee.id} className="bg-blue-50 hover:bg-blue-100">
                              <TableCell className="font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Same house"></div>
                                  {attendee.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <a 
                                  href={`tel:${attendee.phone}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  {formatPhoneNumber(attendee.phone)}
                                </a>
                              </TableCell>
                              <TableCell className="text-gray-900">{bookingInfo.property}</TableCell>
                              <TableCell className="text-center">
                                {attendee.has_rental_car ? (
                                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="text-gray-900">{bookingInfo.checkIn}</div>
                                  <div className="text-gray-600">{bookingInfo.checkOut}</div>
                                </div>
                              </TableCell>
                              {isAdmin && (
                                <>
                                  <TableCell className="text-center">
                                    <button
                                      onClick={() => handleCheckInToggle(attendee.id, (attendee as any).checked_in || false)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                      title={(attendee as any).checked_in ? "Mark as not checked in" : "Mark as checked in"}
                                    >
                                      {(attendee as any).checked_in ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                      ) : (
                                        <XCircle className="h-6 w-6 text-gray-400" />
                                      )}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={bookingInfo.hasUnpaid ? "destructive" : "success"}>
                                      {bookingInfo.hasUnpaid ? "Unpaid" : "Paid"}
                                    </Badge>
                                  </TableCell>
                                </>
                              )}
                              {isAdmin && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/attendees/${attendee.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </>
                    )}

                    {/* Other houses section */}
                    {groupedData && groupedData.otherHouseCount > 0 && (
                      <>
                        <TableRow className="bg-gray-100 hover:bg-gray-100">
                          <TableCell colSpan={isAdmin ? 8 : 5} className="py-2 px-4 font-semibold text-gray-900 text-sm">
                            Other Houses ({groupedData.otherHouseCount} {groupedData.otherHouseCount === 1 ? 'person' : 'people'})
                          </TableCell>
                        </TableRow>
                        {groupedData.otherHouseAttendees.map((attendee) => {
                          const bookingInfo = getAttendeeBookingInfo(attendee)
                          return (
                            <TableRow key={attendee.id}>
                              <TableCell className="font-medium text-white">{attendee.name}</TableCell>
                              <TableCell>
                                <a 
                                  href={`tel:${attendee.phone}`}
                                  className="text-blue-300 hover:text-blue-100 hover:underline cursor-pointer"
                                >
                                  {formatPhoneNumber(attendee.phone)}
                                </a>
                              </TableCell>
                              <TableCell className="text-white">{bookingInfo.property}</TableCell>
                              <TableCell className="text-center">
                                {attendee.has_rental_car ? (
                                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="text-white">{bookingInfo.checkIn}</div>
                                  <div className="text-gray-300">{bookingInfo.checkOut}</div>
                                </div>
                              </TableCell>
                              {isAdmin && (
                                <>
                                  <TableCell className="text-center">
                                    <button
                                      onClick={() => handleCheckInToggle(attendee.id, (attendee as any).checked_in || false)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                      title={(attendee as any).checked_in ? "Mark as not checked in" : "Mark as checked in"}
                                    >
                                      {(attendee as any).checked_in ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                      ) : (
                                        <XCircle className="h-6 w-6 text-gray-400" />
                                      )}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={bookingInfo.hasUnpaid ? "destructive" : "success"}>
                                      {bookingInfo.hasUnpaid ? "Unpaid" : "Paid"}
                                    </Badge>
                                  </TableCell>
                                </>
                              )}
                              {isAdmin && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/attendees/${attendee.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </>
                    )}

                    {/* No grouping for admin users */}
                    {!groupedData && sortedAttendees.map((attendee) => {
                      const bookingInfo = getAttendeeBookingInfo(attendee)
                      return (
                        <TableRow key={attendee.id}>
                          <TableCell className="font-medium text-white">{attendee.name}</TableCell>
                          <TableCell>
                            <a 
                              href={`tel:${attendee.phone}`}
                              className="text-blue-300 hover:text-blue-100 hover:underline cursor-pointer"
                            >
                              {formatPhoneNumber(attendee.phone)}
                            </a>
                          </TableCell>
                          <TableCell className="text-white">{bookingInfo.property}</TableCell>
                          <TableCell className="text-center">
                            {attendee.has_rental_car ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-white">{bookingInfo.checkIn}</div>
                              <div className="text-gray-300">{bookingInfo.checkOut}</div>
                            </div>
                          </TableCell>
                          {isAdmin && (
                            <>
                              <TableCell className="text-center">
                                <button
                                  onClick={() => handleCheckInToggle(attendee.id, (attendee as any).checked_in || false)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title={(attendee as any).checked_in ? "Mark as not checked in" : "Mark as checked in"}
                                >
                                  {(attendee as any).checked_in ? (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                  ) : (
                                    <XCircle className="h-6 w-6 text-gray-400" />
                                  )}
                                </button>
                              </TableCell>
                              <TableCell>
                                <Badge variant={bookingInfo.hasUnpaid ? "destructive" : "success"}>
                                  {bookingInfo.hasUnpaid ? "Unpaid" : "Paid"}
                                </Badge>
                              </TableCell>
                            </>
                          )}
                          {isAdmin && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/attendees/${attendee.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {isLoading ? (
              <p className="text-center py-8">Loading attendees...</p>
            ) : sortedAttendees.length === 0 ? (
              <p className="text-center py-8">No attendees found</p>
            ) : (
              <>
                {/* Current User's Housemates */}
                {groupedData && groupedData.sameHouseCount > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-white px-2">
                      Your Housemates ({groupedData.sameHouseCount})
                    </h3>
                    {groupedData.sameHouseAttendees.map(attendee => {
                      const bookingInfo = getAttendeeBookingInfo(attendee);
                      return (
                        <Card key={attendee.id} className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{attendee.name}</h4>
                              {isAdmin && (
                                <button
                                  onClick={() => handleCheckInToggle(attendee.id, (attendee as any).checked_in || false)}
                                  className="p-1"
                                >
                                  {(attendee as any).checked_in ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-gray-600">
                                <a href={`tel:${attendee.phone}`} className="text-blue-600">
                                  {formatPhoneNumber(attendee.phone)}
                                </a>
                              </p>
                              <p className="text-gray-600">House: {bookingInfo.property}</p>
                              <div className="flex gap-2 mt-2">
                                {attendee.has_rental_car && (
                                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                    <Car className="h-3 w-3 mr-1" /> Vehicle
                                  </Badge>
                                )}
                                {isAdmin && bookingInfo.isPaid && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Check className="h-3 w-3 mr-1" /> Paid
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Other Attendees */}
                {groupedData && groupedData.otherHouseCount > 0 && (
                  <>
                    <h3 className="font-semibold text-sm text-white px-2 pt-2">
                      Other Houses ({groupedData.otherHouseCount})
                    </h3>
                    {groupedData.otherHouseAttendees.map(attendee => {
                      const bookingInfo = getAttendeeBookingInfo(attendee);
                  return (
                    <Card key={attendee.id} className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{attendee.name}</h4>
                          {isAdmin && (
                            <button
                              onClick={() => handleCheckInToggle(attendee.id, (attendee as any).checked_in || false)}
                              className="p-1"
                            >
                              {(attendee as any).checked_in ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">
                            <a href={`tel:${attendee.phone}`} className="text-blue-600">
                              {formatPhoneNumber(attendee.phone)}
                            </a>
                          </p>
                          <p className="text-gray-600">House: {bookingInfo.property}</p>
                          <div className="flex gap-2 mt-2">
                            {attendee.has_rental_car && (
                              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                <Car className="h-3 w-3 mr-1" /> Vehicle
                              </Badge>
                            )}
                            {isAdmin && !bookingInfo.hasUnpaid && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Check className="h-3 w-3 mr-1" /> Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                    })}
                  </>
                )}

                {/* No grouping for admin users */}
                {!groupedData && sortedAttendees.map((attendee) => {
                  const bookingInfo = getAttendeeBookingInfo(attendee);
                  return (
                    <Card key={attendee.id} className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{attendee.name}</h4>
                          {isAdmin && (
                            <button
                              onClick={() => handleCheckInToggle(attendee.id, (attendee as any).checked_in || false)}
                              className="p-1"
                            >
                              {(attendee as any).checked_in ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">
                            <a href={`tel:${attendee.phone}`} className="text-blue-600">
                              {formatPhoneNumber(attendee.phone)}
                            </a>
                          </p>
                          <p className="text-gray-600">House: {bookingInfo.property}</p>
                          <div className="flex gap-2 mt-2">
                            {attendee.has_rental_car && (
                              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                <Car className="h-3 w-3 mr-1" /> Vehicle
                              </Badge>
                            )}
                            {isAdmin && !bookingInfo.hasUnpaid && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Check className="h-3 w-3 mr-1" /> Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}