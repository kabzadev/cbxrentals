import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Car, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPhoneNumber } from '../../lib/utils';

interface AttendeeWithRentalCar {
  id: string;
  name: string;
  email: string;
  phone: string;
  rental_car: boolean;
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

export function RentalCarsReport() {
  const [attendees, setAttendees] = useState<AttendeeWithRentalCar[]>([]);
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
          rental_car,
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
        .eq('rental_car', true)
        .order('name');

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('Error loading attendees with rental cars:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Rental Cars Report</h1>
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
          <h1 className="text-3xl font-bold">Rental Cars Report</h1>
          <p className="text-gray-600 mt-2">
            Total attendees with rental cars: {attendees.length}
          </p>
        </div>

        {attendees.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No attendees with rental cars found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attendees.map((attendee) => (
              <Card key={attendee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
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
        )}
      </div>
  );
}