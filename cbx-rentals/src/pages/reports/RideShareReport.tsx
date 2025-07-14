import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { UserPlus, Phone, Mail, Calendar, MapPin, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPhoneNumber } from '../../lib/utils';

interface AttendeeWantingRideShare {
  id: string;
  name: string;
  email: string;
  phone: string;
  ride_share: boolean;
  bookings: {
    id: string;
    property: {
      id: string;
      name: string;
      address: string;
    } | null;
    check_in: string;
    check_out: string;
  }[];
}

export function RideShareReport() {
  const [attendees, setAttendees] = useState<AttendeeWantingRideShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedByProperty, setGroupedByProperty] = useState<Record<string, AttendeeWantingRideShare[]>>({});

  useEffect(() => {
    loadAttendees();
  }, []);

  const loadAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select(`
          id,
          name,
          email,
          phone,
          ride_share,
          bookings (
            id,
            check_in,
            check_out,
            property:properties!inner (
              id,
              name,
              address
            )
          )
        `)
        .eq('ride_share', true)
        .order('name');

      if (error) throw error;
      
      if (data) {
        setAttendees(data);
        
        // Group attendees by property for easier ride sharing coordination
        const grouped: Record<string, AttendeeWantingRideShare[]> = {};
        data.forEach(attendee => {
          attendee.bookings.forEach(booking => {
            if (booking.property) {
              const propertyName = booking.property.name;
              if (!grouped[propertyName]) {
                grouped[propertyName] = [];
              }
              grouped[propertyName].push(attendee);
            }
          });
        });
        setGroupedByProperty(grouped);
      }
    } catch (error) {
      console.error('Error loading attendees wanting ride share:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Ride Share Report</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    );
  }

  return (
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Ride Share Report</h1>
          <p className="text-gray-600 mt-2">
            Total attendees requesting ride share: {attendees.length}
          </p>
        </div>

        {attendees.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No attendees requesting ride share found.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Individual List */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">All Attendees Requesting Ride Share</h2>
              <div className="space-y-4">
                {attendees.map((attendee) => (
                  <Card key={attendee.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-600" />
                        {attendee.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${attendee.email}`} className="text-blue-600 hover:underline">
                              {attendee.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${attendee.phone}`} className="text-blue-600 hover:underline">
                              {formatPhoneNumber(attendee.phone)}
                            </a>
                          </div>
                        </div>
                        
                        {attendee.bookings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">Booking Details:</h4>
                            {attendee.bookings.map((booking) => (
                              <div key={booking.id} className="text-sm space-y-1 bg-gray-50 p-2 rounded">
                                {booking.property && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium">{booking.property.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span>
                                    {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Grouped by Property */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Grouped by Property (for ride sharing coordination)</h2>
              <div className="space-y-6">
                {Object.entries(groupedByProperty).map(([propertyName, propertyAttendees]) => (
                  <Card key={propertyName} className="border-2 border-green-200">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        {propertyName} ({propertyAttendees.length} attendees)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {propertyAttendees.map((attendee) => (
                          <div key={attendee.id} className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">{attendee.name}</h4>
                            <div className="space-y-1">
                              <a href={`mailto:${attendee.email}`} className="text-xs text-blue-600 hover:underline block">
                                {attendee.email}
                              </a>
                              <a href={`tel:${attendee.phone}`} className="text-xs text-blue-600 hover:underline block">
                                {formatPhoneNumber(attendee.phone)}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
  );
}