import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, DollarSign, User, Check, X, AlertCircle, Edit2, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { PropertyImages } from '../components/properties/PropertyImages';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  has_rental_car?: boolean;
  arrival_airline?: string;
  arrival_flight_number?: string;
  arrival_time?: string;
  departure_airline?: string;
  departure_flight_number?: string;
  departure_time?: string;
  interested_in_carpool?: boolean;
}

interface Booking {
  id: string;
  attendee_id: string;
  property_id: string;
  arrival_date: string;
  exit_date: string;
  total_amount: number;
  paid: boolean;
  attendees: Attendee;
}

interface Property {
  id: string;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  max_occupancy: number;
  price_per_night: number;
  listing_url?: string;
  sleeps?: number;
  property_type?: string;
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [editDates, setEditDates] = useState<{[key: string]: { arrival: string; exit: string }}>({});

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) return;

      try {
        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (propertyError) throw propertyError;
        setProperty(propertyData);

        // Fetch bookings for this property with attendee information
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            attendee:attendees!attendee_id (
              id,
              name,
              email,
              phone,
              has_rental_car,
              arrival_airline,
              arrival_flight_number,
              arrival_time,
              departure_airline,
              departure_flight_number,
              departure_time,
              interested_in_carpool
            )
          `)
          .eq('property_id', id)
          .order('arrival_date');

        if (bookingsError) {
          console.error('Bookings error:', bookingsError);
          throw bookingsError;
        }
        console.log('Bookings data:', bookingsData);
        console.log('Property ID:', id);
        console.log('Number of bookings:', bookingsData?.length || 0);
        setBookings(bookingsData || []);
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleEditDates = (bookingId: string, currentArrival: string, currentExit: string) => {
    setEditingBooking(bookingId);
    setEditDates({
      ...editDates,
      [bookingId]: {
        arrival: currentArrival,
        exit: currentExit
      }
    });
  };

  const handleSaveDates = async (bookingId: string) => {
    const dates = editDates[bookingId];
    if (!dates) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          arrival_date: dates.arrival,
          exit_date: dates.exit
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, arrival_date: dates.arrival, exit_date: dates.exit }
          : booking
      ));

      setEditingBooking(null);
      setEditDates({});
    } catch (error) {
      console.error('Error updating dates:', error);
      alert('Failed to update dates. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditDates({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">House not found</div>
      </div>
    );
  }

  // Calculate stats
  const totalGuests = bookings.length;
  const paidGuests = bookings.filter(b => b.paid).length;
  const confirmedDates = bookings.length; // All dates are considered confirmed for now
  const modifiedDates = 0;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-gray-400">{property.address}</p>
        </div>

        {/* Property Images */}
        <div className="mb-8">
          <PropertyImages 
            propertyId={property.id}
            propertyName={property.name}
            listingUrl={property.listing_url}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#303030] border-[#303030]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Guests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGuests}</div>
              <p className="text-xs text-gray-500">of {property.max_occupancy} max</p>
            </CardContent>
          </Card>

          <Card className="bg-[#303030] border-[#303030]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{paidGuests}</div>
              <p className="text-xs text-gray-500">{totalGuests - paidGuests} unpaid</p>
            </CardContent>
          </Card>

          <Card className="bg-[#303030] border-[#303030]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Dates Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-500">{confirmedDates}</div>
              <p className="text-xs text-gray-500">{modifiedDates} modified</p>
            </CardContent>
          </Card>

          <Card className="bg-[#303030] border-[#303030]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>{property.bedrooms} bedrooms • {property.bathrooms} baths</p>
                <p className="text-xs text-gray-500 mt-1">
                  {property.sleeps && `Sleeps ${property.sleeps}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest List */}
        <Card className="bg-[#303030] border-[#303030]">
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
            <CardDescription className="text-gray-400">
              All guests assigned to {property.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No guests assigned to this property yet.</p>
                <pre className="text-xs mt-4 text-left bg-gray-900 p-2 rounded">
                  Debug: Property ID = {id}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-black rounded-lg p-4 border border-[#505050]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <h3 className="font-semibold text-lg">
                          {booking.attendee?.name || 'Unknown Guest'}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Contact Info</p>
                          <p className="text-gray-300">{booking.attendee?.phone || 'No phone'}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-gray-400">Stay Dates</p>
                            {editingBooking !== booking.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDates(booking.id, booking.arrival_date, booking.exit_date)}
                                className="text-gray-400 hover:text-white p-1 h-6"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {editingBooking === booking.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 w-16">Arrival:</label>
                                <input
                                  type="date"
                                  value={editDates[booking.id]?.arrival || booking.arrival_date}
                                  onChange={(e) => setEditDates({
                                    ...editDates,
                                    [booking.id]: {
                                      ...editDates[booking.id],
                                      arrival: e.target.value,
                                      exit: editDates[booking.id]?.exit || booking.exit_date
                                    }
                                  })}
                                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 w-16">Exit:</label>
                                <input
                                  type="date"
                                  value={editDates[booking.id]?.exit || booking.exit_date}
                                  onChange={(e) => setEditDates({
                                    ...editDates,
                                    [booking.id]: {
                                      arrival: editDates[booking.id]?.arrival || booking.arrival_date,
                                      exit: e.target.value
                                    }
                                  })}
                                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveDates(booking.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="text-gray-400 hover:text-white px-3 py-1 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(booking.arrival_date + 'T00:00:00'), 'MMM d')} - 
                              {format(new Date(booking.exit_date + 'T00:00:00'), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>

                      {(booking.attendee?.arrival_airline || booking.attendee?.departure_airline) && (
                        <div className="mt-3 text-sm">
                          <p className="text-gray-400">Flight Info</p>
                          <div className="text-gray-300 space-y-1">
                            {booking.attendee?.arrival_airline && (
                              <p>
                                Arrival: {booking.attendee?.arrival_airline} {booking.attendee?.arrival_flight_number}
                                {booking.attendee?.arrival_time && ` at ${booking.attendee?.arrival_time}`}
                              </p>
                            )}
                            {booking.attendee?.departure_airline && (
                              <p>
                                Departure: {booking.attendee?.departure_airline} {booking.attendee?.departure_flight_number}
                                {booking.attendee?.departure_time && ` at ${booking.attendee?.departure_time}`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {(booking.attendee?.has_rental_car || booking.attendee?.interested_in_carpool) && (
                        <div className="mt-3 text-sm">
                          <p className="text-gray-400">Transportation</p>
                          <div className="text-gray-300 space-y-1">
                            {booking.attendee?.has_rental_car && <p>✓ Has rental car</p>}
                            {booking.attendee?.interested_in_carpool && <p>✓ Interested in ride sharing</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <p className="text-xl font-bold mb-2">{formatCurrency(booking.total_amount)}</p>
                      <Badge 
                        className={booking.paid 
                          ? 'bg-emerald-900 text-emerald-300 border-emerald-700' 
                          : 'bg-rose-900 text-rose-300 border-rose-700'
                        }
                      >
                        {booking.paid ? (
                          <><Check className="h-3 w-3 mr-1" /> Paid</>
                        ) : (
                          <><X className="h-3 w-3 mr-1" /> Unpaid</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}