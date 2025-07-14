import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Phone, Car, Plane, CheckCircle2, XCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  location_name: string;
  is_optional: boolean;
}

interface AttendeeWithInterest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  has_rental_car: boolean;
  needs_airport_pickup: boolean;
  checked_in: boolean;
  is_interested: boolean;
  property_name: string | null;
}

export function EventAttendanceReport() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<AttendeeWithInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventAttendees(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAttendees = async (eventId: string) => {
    setEventLoading(true);
    try {
      const selectedEvent = events.find(e => e.id === eventId);
      
      if (selectedEvent?.is_optional) {
        // For optional events, get attendees who expressed interest
        const { data, error } = await supabase
          .from('event_attendees')
          .select(`
            is_interested,
            attendees!inner (
              id,
              name,
              email,
              phone,
              has_rental_car,
              needs_airport_pickup,
              checked_in
            )
          `)
          .eq('event_id', eventId)
          .eq('is_interested', true);

        if (error) throw error;

        const attendeesList = data?.map(item => ({
          id: item.attendees.id,
          name: item.attendees.name,
          email: item.attendees.email,
          phone: item.attendees.phone,
          has_rental_car: item.attendees.has_rental_car,
          needs_airport_pickup: item.attendees.needs_airport_pickup,
          checked_in: item.attendees.checked_in,
          is_interested: item.is_interested,
          property_name: null
        })) || [];

        // Get property assignments for these attendees
        const attendeeIds = attendeesList.map(a => a.id);
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            attendee_id, 
            properties (
              name
            )
          `)
          .in('attendee_id', attendeeIds);

        // Map property names to attendees
        const attendeesWithProperties = attendeesList.map(attendee => {
          const booking = bookings?.find(b => b.attendee_id === attendee.id);
          return {
            ...attendee,
            property_name: booking?.properties?.name || null
          };
        });

        setAttendees(attendeesWithProperties);
      } else {
        // For required events, get all checked-in attendees
        const { data, error } = await supabase
          .from('attendees')
          .select(`
            id,
            name,
            email,
            phone,
            has_rental_car,
            needs_airport_pickup,
            checked_in,
            bookings!inner (
              properties (
                name
              )
            )
          `)
          .eq('checked_in', true)
          .order('name');

        if (error) throw error;

        const attendeesList = data?.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          has_rental_car: item.has_rental_car,
          needs_airport_pickup: item.needs_airport_pickup,
          checked_in: item.checked_in,
          is_interested: true, // All checked-in attendees are expected at required events
          property_name: item.bookings?.[0]?.properties?.name || null
        })) || [];

        setAttendees(attendeesList);
      }
    } catch (error) {
      console.error('Error fetching event attendees:', error);
    } finally {
      setEventLoading(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const interestedCount = attendees.filter(a => a.is_interested).length;
  const checkedInCount = attendees.filter(a => a.checked_in).length;

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'N/A';
    // Remove +1 and format
    const cleaned = phone.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Attendance Report</h1>
            <p className="text-gray-600">View attendees for each event</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Event</CardTitle>
            {selectedEvent && (
              <Badge variant={selectedEvent.is_optional ? "secondary" : "default"}>
                {selectedEvent.is_optional ? "Optional" : "Required"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.title}</span>
                    <span className="text-sm text-gray-500">
                      - {format(new Date(event.event_date), 'MMM d')} at {format(new Date(`2000-01-01T${event.event_time}`), 'h:mm a')}
                    </span>
                    {event.is_optional && (
                      <Badge variant="outline" className="ml-2">Optional</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{selectedEvent.title}</CardTitle>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{interestedCount}</span>
                    <span className="text-gray-500">
                      {selectedEvent.is_optional ? 'interested' : 'expected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{checkedInCount}</span>
                    <span className="text-gray-500">checked in</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>{format(new Date(selectedEvent.event_date), 'EEEE, MMMM d, yyyy')} at {format(new Date(`2000-01-01T${selectedEvent.event_time}`), 'h:mm a')}</p>
                <p>{selectedEvent.location_name}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {eventLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : attendees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attendees {selectedEvent.is_optional ? 'interested in' : 'for'} this event yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Phone</th>
                      <th className="pb-3 font-medium">House</th>
                      <th className="pb-3 font-medium">Transportation</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{attendee.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatPhoneNumber(attendee.phone)}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          {attendee.property_name ? (
                            <Badge variant="outline">{attendee.property_name}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {attendee.has_rental_car && (
                              <Badge variant="secondary" className="gap-1">
                                <Car className="h-3 w-3" />
                                Car
                              </Badge>
                            )}
                            {attendee.needs_airport_pickup && (
                              <Badge variant="secondary" className="gap-1">
                                <Plane className="h-3 w-3" />
                                Pickup
                              </Badge>
                            )}
                            {!attendee.has_rental_car && !attendee.needs_airport_pickup && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          {attendee.checked_in ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Checked In
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Not Checked In
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}