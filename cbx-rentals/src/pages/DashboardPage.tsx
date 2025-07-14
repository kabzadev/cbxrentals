import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PropertyList } from '../components/properties/PropertyList';
import { PropertyImages } from '../components/properties/PropertyImages';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, UsersIcon, DollarSign, CheckCircle, Phone, User, Calendar, Clock, CalendarDays } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { formatCurrency } from '../lib/utils';
import { formatPhoneNumber } from '../lib/formatters';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { PaymentModal } from '../components/PaymentModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const { username, logout, userType, attendeeData } = useAuthStore();
  const [paidCount, setPaidCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(24);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payment status
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('paid');

        if (!error && bookings) {
          const paid = bookings.filter(b => b.paid).length;
          setPaidCount(paid);
          setTotalAttendees(bookings.length);
        }

        // Fetch check-in status
        const { data: attendees, error: attendeesError } = await supabase
          .from('attendees')
          .select('checked_in');

        if (!attendeesError && attendees) {
          const confirmed = attendees.filter(a => a.checked_in).length;
          setConfirmedCount(confirmed);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userType, attendeeData]);

  // Countdown timer effect
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const eventDate = new Date('2025-09-12T00:00:00'); // September 12, 2025
      
      const diff = eventDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateCountdown();
    
    // Update every second
    const interval = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Total Properties',
      value: '4',
      icon: HomeIcon,
      description: 'Beach houses in Oceanside',
      bgColor: 'bg-[#303030]',
      iconColor: 'text-gray-400',
    },
    {
      title: 'Total Attendees',
      value: totalAttendees.toString(),
      icon: UsersIcon,
      description: 'Registered attendees',
      bgColor: 'bg-[#303030]',
      iconColor: 'text-gray-400',
    },
    {
      title: 'Payment Status',
      value: `${paidCount}/${totalAttendees}`,
      icon: DollarSign,
      description: `${totalAttendees - paidCount} payments pending`,
      bgColor: paidCount === totalAttendees ? 'bg-emerald-900/20' : 'bg-rose-900/20',
      iconColor: paidCount === totalAttendees ? 'text-emerald-500' : 'text-rose-500',
    },
    {
      title: 'Check-ins Confirmed',
      value: `${confirmedCount}/${totalAttendees}`,
      icon: CheckCircle,
      description: `${totalAttendees - confirmedCount} not checked in`,
      bgColor: confirmedCount === totalAttendees ? 'bg-sky-900/20' : 'bg-amber-900/20',
      iconColor: confirmedCount === totalAttendees ? 'text-sky-500' : 'text-amber-500',
    },
  ];

  const renderAttendeeHouse = () => {
    if (!attendeeData?.bookings?.[0]) return null;
    const booking = attendeeData.bookings[0];
    const property = booking.property;
    
    return (
      <div className="space-y-6">
        {/* House Info with Media */}
        <Card className="bg-[#303030] border-[#303030]">
          <CardHeader>
            <CardTitle className="text-white">Your House - {property.name}</CardTitle>
            <CardDescription className="text-gray-400">
              {property.address}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyImages 
              propertyId={property.id}
              propertyName={property.name}
              listingUrl={property.listing_url}
            />
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card className="bg-[#303030] border-[#303030]">
          <CardHeader>
            <CardTitle className="text-white">Your Booking Information</CardTitle>
            <CardDescription className="text-gray-400">
              CBX Experience details and payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="bg-black rounded-lg p-3 sm:p-4 border border-[#505050]">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-white">Contact Information</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">{attendeeData.name}</p>
                    <p className="text-gray-400">{formatPhoneNumber(attendeeData.phone)}</p>
                  </div>
                </div>

                {/* Stay Dates */}
                <div className="bg-black rounded-lg p-3 sm:p-4 border border-[#505050]">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-white">Stay Dates</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="text-gray-300">
                        {format(new Date(booking.arrival_date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="text-gray-300">
                        {format(new Date(booking.exit_date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-4">
                <div className="bg-black rounded-lg p-3 sm:p-4 border border-[#505050]">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-white">Payment Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Amount</span>
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.paid 
                          ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-700'
                          : 'bg-rose-900/20 text-rose-400 border border-rose-700'
                      }`}>
                        {booking.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    {booking.paid && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Payment confirmed</span>
                      </div>
                    )}
                  </div>
                  {!booking.paid && (
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full mt-4 bg-[#e50914] hover:bg-[#b90710] text-white"
                    >
                      Make Payment
                    </Button>
                  )}
                </div>

                {/* Transportation Info */}
                {(attendeeData.has_rental_car !== null || attendeeData.interested_in_carpool) && (
                  <div className="bg-black rounded-lg p-3 sm:p-4 border border-[#505050]">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-white">Transportation</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {attendeeData.has_rental_car && (
                        <p className="text-gray-300">✓ Has rental car</p>
                      )}
                      {attendeeData.interested_in_carpool && (
                        <p className="text-gray-300">✓ Interested in ride sharing</p>
                      )}
                      {!attendeeData.has_rental_car && !attendeeData.interested_in_carpool && (
                        <p className="text-gray-500">No transportation preferences set</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Modal */}
        {attendeeData && booking && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            attendeeId={attendeeData.id}
            bookingId={booking.id}
            amount={booking.total_amount}
            attendeeName={attendeeData.name}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userType === 'attendee' ? `Welcome, ${username}!` : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {userType === 'attendee' 
              ? 'CBX Experience - Your event information' 
              : 'Welcome to CBX Rentals management system'
            }
          </p>
        </div>

        {/* Compact Countdown Timer */}
        <div className="bg-gradient-to-r from-[#e50914] to-[#b90710] rounded-lg p-3 lg:p-4">
          <div className="flex items-center gap-2 text-white mb-1">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">CBX Experience</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold">{countdown.days}</div>
              <div className="text-[10px] lg:text-xs opacity-70">DAYS</div>
            </div>
            <span className="text-lg">:</span>
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold">{countdown.hours}</div>
              <div className="text-[10px] lg:text-xs opacity-70">HRS</div>
            </div>
            <span className="text-lg">:</span>
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold">{countdown.minutes}</div>
              <div className="text-[10px] lg:text-xs opacity-70">MIN</div>
            </div>
            <span className="text-lg">:</span>
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold">{countdown.seconds}</div>
              <div className="text-[10px] lg:text-xs opacity-70">SEC</div>
            </div>
          </div>
          <div className="text-[10px] lg:text-xs text-white/70 mt-1">Sept 12-13, 2025</div>
        </div>
      </div>

      {userType === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className={`${stat.bgColor} border-[#303030]`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-gray-400">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {userType === 'attendee' ? (
          renderAttendeeHouse()
        ) : (
          <Card className="bg-[#303030] border-[#303030]">
            <CardHeader>
              <CardTitle className="text-white">CBX Experience Properties</CardTitle>
              <CardDescription className="text-gray-400">
                4 beautiful beach houses in Oceanside, CA for September 10-14, 2024
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyList />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}