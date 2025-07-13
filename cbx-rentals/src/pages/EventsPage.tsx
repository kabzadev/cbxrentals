import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CalendarIcon, Clock, MapPin, Navigation, Star, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';

export function EventsPage() {
  const { userType, attendeeData } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [eventInterests, setEventInterests] = useState<Record<string, any>>({});
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    is_optional: false,
    location_name: '',
    location_address: '',
    location_latitude: '',
    location_longitude: '',
    map_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            event_attendees (
              id,
              attendee_id,
              is_interested
            )
          `)
          .order('event_date')
          .order('event_time');

        if (!eventsError && eventsData) {
          setEvents(eventsData);
          
          // Build interest map for current attendee
          if (userType === 'attendee' && attendeeData) {
            const interests: Record<string, any> = {};
            eventsData.forEach(event => {
              const interest = event.event_attendees?.find(
                (ea: any) => ea.attendee_id === attendeeData.id
              );
              if (interest) {
                interests[event.id] = interest;
              }
            });
            setEventInterests(interests);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [userType, attendeeData]);

  const handleEventInterest = async (eventId: string, isInterested: boolean) => {
    if (!attendeeData) return;

    try {
      const existingInterest = eventInterests[eventId];

      if (existingInterest) {
        // Update existing interest
        const { error } = await supabase
          .from('event_attendees')
          .update({ is_interested: isInterested })
          .eq('id', existingInterest.id);

        if (!error) {
          setEventInterests({
            ...eventInterests,
            [eventId]: { ...existingInterest, is_interested: isInterested }
          });
        }
      } else {
        // Create new interest
        const { data, error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            attendee_id: attendeeData.id,
            is_interested: isInterested
          })
          .select()
          .single();

        if (!error && data) {
          setEventInterests({
            ...eventInterests,
            [eventId]: data
          });
        }
      }
    } catch (error) {
      console.error('Error updating event interest:', error);
    }
  };

  const getDirectionsUrl = (event: any) => {
    // If we have a map URL, use it
    if (event.map_url) {
      return event.map_url;
    }
    
    // Otherwise, use the address if available
    if (event.location_address) {
      const encodedAddress = encodeURIComponent(event.location_address);
      return `https://maps.google.com/?q=${encodedAddress}`;
    }
    
    // Fall back to coordinates if we have them
    if (event.location_latitude && event.location_longitude) {
      return `https://maps.google.com/?q=${event.location_latitude},${event.location_longitude}`;
    }
    
    // Last resort - just search for the location name
    const encodedName = encodeURIComponent(event.location_name || 'San Diego');
    return `https://maps.google.com/?q=${encodedName}`;
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      // Generate map URL from address if we have one
      let mapUrl = eventData.map_url;
      let latitude = eventData.location_latitude;
      let longitude = eventData.location_longitude;
      
      if (eventData.location_address && !mapUrl) {
        // Encode the address for use in Google Maps URL
        const encodedAddress = encodeURIComponent(eventData.location_address);
        mapUrl = `https://maps.google.com/?q=${encodedAddress}`;
        
        // For now, we'll use dummy coordinates. In a real app, you'd use a geocoding API
        // These are San Diego area coordinates as a fallback
        latitude = latitude || '32.7157';
        longitude = longitude || '-117.1611';
      }
      
      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        is_optional: eventData.is_optional,
        location_name: eventData.location_name,
        location_address: eventData.location_address,
        location_latitude: latitude,
        location_longitude: longitude,
        map_url: mapUrl
      };
      
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            ...eventPayload,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Event updated successfully',
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert(eventPayload);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
      }

      // Refresh events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees (
            id,
            attendee_id,
            is_interested
          )
        `)
        .order('event_date')
        .order('event_time');

      if (eventsData) {
        setEvents(eventsData);
      }

      setEditingEvent(null);
      setShowEventForm(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });

      // Refresh events
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  // Update form data when editing event changes
  useEffect(() => {
    if (editingEvent) {
      setEventFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        event_date: editingEvent.event_date || '',
        event_time: editingEvent.event_time || '',
        is_optional: editingEvent.is_optional || false,
        location_name: editingEvent.location_name || '',
        location_address: editingEvent.location_address || '',
        location_latitude: editingEvent.location_latitude || '',
        location_longitude: editingEvent.location_longitude || '',
        map_url: editingEvent.map_url || ''
      });
    } else {
      setEventFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        is_optional: false,
        location_name: '',
        location_address: '',
        location_latitude: '',
        location_longitude: '',
        map_url: ''
      });
    }
  }, [editingEvent]);

  // Group events by day
  const groupEventsByDay = (events: any[]) => {
    const grouped = events.reduce((acc, event) => {
      const eventDate = new Date(event.event_date + 'T00:00:00');
      const dayKey = format(eventDate, 'yyyy-MM-dd');
      const dayName = format(eventDate, 'EEEE, MMMM d, yyyy');
      
      if (!acc[dayKey]) {
        acc[dayKey] = {
          dayName,
          date: eventDate,
          events: []
        };
      }
      acc[dayKey].events.push(event);
      return acc;
    }, {} as Record<string, { dayName: string; date: Date; events: any[] }>);

    // Sort by date
    return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const renderEventForm = () => (
    <Card className="bg-white border-gray-200 mb-6">
      <CardHeader>
        <CardTitle className="text-gray-900">
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-700">Event Title</Label>
              <Input
                id="title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date" className="text-gray-700">Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={eventFormData.event_date}
                  onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="event_time" className="text-gray-700">Time</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={eventFormData.event_time}
                  onChange={(e) => setEventFormData({ ...eventFormData, event_time: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_optional"
                checked={eventFormData.is_optional}
                onChange={(e) => setEventFormData({ ...eventFormData, is_optional: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 bg-white text-[#e50914] focus:ring-[#e50914]"
              />
              <Label htmlFor="is_optional" className="text-gray-700 cursor-pointer">
                This is an optional event
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="location_name" className="text-gray-700">Location Name</Label>
              <Input
                id="location_name"
                value={eventFormData.location_name}
                onChange={(e) => setEventFormData({ ...eventFormData, location_name: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="e.g., Beach Pavilion"
              />
            </div>

            <div>
              <Label htmlFor="location_address" className="text-gray-700">Address</Label>
              <Input
                id="location_address"
                value={eventFormData.location_address}
                onChange={(e) => setEventFormData({ ...eventFormData, location_address: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="123 Main St, San Diego, CA 92101"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the full address - we'll automatically generate the map link
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => handleSaveEvent(eventFormData)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            {editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditingEvent(null);
              setShowEventForm(false);
            }}
            className="bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:text-black font-medium"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CBX Experience Events</h1>
        <p className="text-gray-600">
          Official events and optional activities
        </p>
      </div>

      <div className="space-y-6">
        {userType === 'admin' && (
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingEvent(null);
                setShowEventForm(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
            </Button>
          </div>
        )}

        {showEventForm && userType === 'admin' && renderEventForm()}

        {groupEventsByDay(events).map((dayGroup) => (
          <div key={dayGroup.dayName} className="mb-8">
            {/* Day Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{dayGroup.dayName}</h2>
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-24"></div>
            </div>

            {/* Events for this day */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {dayGroup.events.map((event) => {
                    const eventDate = new Date(event.event_date + 'T' + event.event_time);
                    const isInterested = eventInterests[event.id]?.is_interested;
                    const interestedCount = event.event_attendees?.filter((ea: any) => ea.is_interested).length || 0;
                    
                    return (
                      <div key={event.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            event.is_optional 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-green-100 text-green-800 border border-green-300'
                          }`}>
                            {event.is_optional ? 'Optional' : 'Official'}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg flex-1">{event.title}</h3>
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              {format(eventDate, 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {format(eventDate, 'h:mm a')}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              {event.location_name}
                            </div>
                            {event.location_address && (
                              <div className="text-xs text-gray-600 ml-6">
                                {event.location_address}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interest tracking for optional events */}
                        {event.is_optional && userType === 'attendee' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                {interestedCount > 0 && (
                                  <span>{interestedCount} attendee{interestedCount !== 1 ? 's' : ''} interested</span>
                                )}
                              </div>
                              <Button
                                variant={isInterested ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleEventInterest(event.id, !isInterested)}
                                className={isInterested 
                                  ? "bg-blue-500 hover:bg-blue-600 text-white font-medium" 
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 font-medium"
                                }
                              >
                                <Star className={`h-4 w-4 mr-1 ${isInterested ? 'fill-current' : ''}`} />
                                {isInterested ? "Attending" : "Not Attending"}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Show interest count for admin */}
                        {event.is_optional && userType === 'admin' && interestedCount > 0 && (
                          <div className="mt-3 text-sm text-gray-600">
                            {interestedCount} attendee{interestedCount !== 1 ? 's' : ''} interested
                          </div>
                        )}
                      </div>

                      {/* Get Directions Button */}
                      <div className="ml-4 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getDirectionsUrl(event), '_blank')}
                          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 font-medium"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                        
                        {/* Admin edit/delete buttons */}
                        {userType === 'admin' && (
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingEvent(event);
                                setShowEventForm(true);
                              }}
                              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 font-medium"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-white border-red-300 text-red-700 hover:bg-red-50 hover:text-red-900 hover:border-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {events.length === 0 && (
          <Card className="bg-white border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No events scheduled yet.</p>
                {userType === 'admin' && (
                  <p className="text-sm mt-2">Click "Add New Event" to get started.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}