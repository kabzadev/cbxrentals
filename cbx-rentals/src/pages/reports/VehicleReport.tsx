import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Car, Phone, Calendar, MapPin } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPhoneNumber } from '../../lib/utils';

interface AttendeeWithVehicle {
  id: string;
  name: string;
  email: string;
  phone: string;
  has_rental_car: boolean;
  bookings: {
    id: string;
    property: {
      id: string;
      name: string;
      address: string;
    } | null;
    arrival_date: string;
    exit_date: string;
  }[];
}

export function VehicleReport() {
  const [attendees, setAttendees] = useState<AttendeeWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

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
          has_rental_car,
          bookings (
            id,
            arrival_date,
            exit_date,
            property:properties (
              id,
              name,
              address
            )
          )
        `)
        .eq('has_rental_car', true)
        .order('name');

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('Error loading attendees with vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Vehicle Report</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Report</h1>
          <p className="text-gray-600 mt-2">
            Total attendees with vehicles: {attendees.length}
          </p>
        </div>

        {attendees.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6 text-center text-gray-600">
              No attendees with vehicles found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attendees.map((attendee) => (
              <Card key={attendee.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-gray-50">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Car className="w-5 h-5 text-blue-600" />
                    {attendee.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${attendee.phone}`} className="text-blue-700 hover:text-blue-900 hover:underline font-medium">
                          {formatPhoneNumber(attendee.phone)}
                        </a>
                      </div>
                    </div>
                    
                    {attendee.bookings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-800">Booking Details:</h4>
                        {attendee.bookings.map((booking) => (
                          <div key={booking.id} className="text-sm space-y-1 bg-blue-50 border border-blue-100 p-3 rounded">
                            {booking.property && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-600" />
                                <span className="font-medium text-gray-900">{booking.property.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-3 h-3 text-gray-600" />
                              <span>
                                {new Date(booking.arrival_date).toLocaleDateString()} - {new Date(booking.exit_date).toLocaleDateString()}
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
        )}
      </div>
  );
}