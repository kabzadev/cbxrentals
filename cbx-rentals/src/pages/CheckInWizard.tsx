import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, DollarSign, Check, ChevronRight, QrCode, AlertCircle, Edit2, CreditCard, Clock, Car, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../components/ui/use-toast';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { PropertyImages } from '../components/properties/PropertyImages';
import { useAuthStore } from '../stores/authStore';
import { trackEvent, trackException, setAuthenticatedUserContext } from '../lib/appInsights';
import { logActivity } from '../lib/activityLogger';

interface WizardStep {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: WizardStep[] = [
  { id: 1, title: 'Confirm Dates', icon: Calendar },
  { id: 2, title: 'Arrival Details', icon: Clock },
  { id: 3, title: 'Property & Cost', icon: MapPin },
  { id: 4, title: 'Payment', icon: DollarSign },
];

export function CheckInWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAttendee, logout, attendeeData, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [arrivalDate, setArrivalDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [dateChangeReason, setDateChangeReason] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [hasRentalCar, setHasRentalCar] = useState<boolean | null>(null);
  const [interestedInCarpool, setInterestedInCarpool] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get attendee and booking data from navigation state
  const { attendee, booking } = location.state || {};

  useEffect(() => {
    // Check if user is already checked in
    const checkAuthStatus = async () => {
      // If user is authenticated and already checked in, redirect to dashboard
      if (isAuthenticated && attendeeData?.checked_in) {
        navigate('/dashboard');
        return;
      }
      
      // If no navigation state and user is authenticated, fetch their data
      if (!attendee && isAuthenticated && attendeeData) {
        try {
          // Check if they have bookings and if they're checked in
          const { data: attendeeWithBookings, error } = await supabase
            .from('attendees')
            .select(`
              *,
              bookings (
                *,
                property:properties (*)
              )
            `)
            .eq('id', attendeeData.id)
            .single();

          if (error) throw error;

          if (attendeeWithBookings?.checked_in) {
            // User is already checked in, redirect to dashboard
            navigate('/dashboard');
            return;
          }

          // If they have a booking but aren't checked in, redirect to check-in page
          if (attendeeWithBookings?.bookings?.length > 0) {
            navigate('/check-in');
            return;
          }
        } catch (error) {
          console.error('Error checking attendee status:', error);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [isAuthenticated, attendeeData, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e50914] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For off-site attendees or those without bookings who are already checked in,
  // redirect to dashboard
  if (!attendee && isAuthenticated && attendeeData?.checked_in) {
    navigate('/dashboard');
    return null;
  }

  if (!attendee || !booking) {
    // If they're an off-site attendee (no booking), redirect to dashboard if checked in
    if (isAuthenticated && attendeeData?.checked_in) {
      navigate('/dashboard');
      return null;
    }
    navigate('/check-in');
    return null;
  }

  const property = booking.property;
  const isPaid = booking.paid;
  const datesModified = false; // Removed since dates_modified column doesn't exist

  // Initialize dates and arrival details when data is available
  useEffect(() => {
    if (booking?.arrival_date && booking?.exit_date) {
      setArrivalDate(booking.arrival_date);
      setExitDate(booking.exit_date);
    }
    if (attendee) {
      setHasRentalCar(attendee.has_rental_car ?? null);
      // Don't pre-select carpool option even if it has a value in the database
      setInterestedInCarpool(null);
      
      // Set user context and track wizard start (use name as userId for consistency)
      setAuthenticatedUserContext(attendee.name, 'check-in-wizard');
      trackEvent('Check-In Wizard Started', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        propertyName: property?.name,
        isPaid: isPaid,
        totalAmount: booking?.total_amount
      });
    }
  }, [booking, attendee]);

  const handleConfirmDates = async () => {
    setIsProcessing(true);
    try {
      // For now, just update dates if they changed
      const updates: any = {};

      // Check if dates were modified
      if (arrivalDate !== booking.arrival_date || exitDate !== booking.exit_date) {
        updates.arrival_date = arrivalDate;
        updates.exit_date = exitDate;
        
        const { error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', booking.id);

        if (error) throw error;

        // Update local booking data
        booking.arrival_date = arrivalDate;
        booking.exit_date = exitDate;

        trackEvent('Check-In Dates Changed', {
          attendeeName: attendee.name,
          attendeeId: attendee.id,
          oldArrival: booking.arrival_date,
          newArrival: arrivalDate,
          oldExit: booking.exit_date,
          newExit: exitDate,
          reason: dateChangeReason
        });

        toast({
          title: 'Dates Updated',
          description: 'Your new dates have been saved.',
        });
      } else {
        trackEvent('Check-In Dates Confirmed', {
          attendeeName: attendee.name,
          attendeeId: attendee.id,
          arrivalDate,
          exitDate
        });

        toast({
          title: 'Dates Confirmed',
          description: 'Your dates have been confirmed.',
        });
      }

      handleNext();
    } catch (error) {
      console.error('Date confirmation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveArrivalDetails = async (retryCount = 0) => {
    // Validation
    if (!arrivalTime) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your arrival time.',
        variant: 'destructive',
      });
      return;
    }

    if (hasRentalCar === null) {
      toast({
        title: 'Missing Information',
        description: 'Please indicate whether you have a vehicle.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Log the update attempt
      console.log('Updating arrival details for:', {
        attendeeId: attendee.id,
        attendeeName: attendee.name,
        hasRentalCar,
        interestedInCarpool
      });

      const { data, error } = await supabase
        .from('attendees')
        .update({
          has_rental_car: hasRentalCar,
          interested_in_carpool: interestedInCarpool || false
        })
        .eq('id', attendee.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      trackEvent('Check-In Arrival Details', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        arrivalTime,
        hasRentalCar,
        interestedInCarpool
      });

      toast({
        title: 'Arrival Details Saved',
        description: 'Your transportation preferences have been updated.',
      });

      handleNext();
    } catch (error) {
      console.error('Arrival details error:', error);
      
      // Check if it's a network error
      const isNetworkError = error instanceof TypeError && error.message === 'Load failed';
      
      // Retry logic for network errors
      if (isNetworkError && retryCount < 2) {
        console.log(`Retrying arrival details save (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => {
          handleSaveArrivalDetails(retryCount + 1);
        }, 1000); // Wait 1 second before retry
        return;
      }
      
      const errorMessage = isNetworkError 
        ? 'Network connection error. Please check your internet connection and try again.'
        : 'Failed to save arrival details. Please try again.';
      
      trackException(error as Error, {
        context: 'arrival_details_save',
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        isNetworkError,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        retryCount
      });
      
      toast({
        title: isNetworkError ? 'Connection Error' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      trackEvent('Check-In Wizard Step', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        fromStep: steps[currentStep - 1].title,
        toStep: steps[nextStep - 1].title,
        direction: 'forward'
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      trackEvent('Check-In Wizard Step', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        fromStep: steps[currentStep - 1].title,
        toStep: steps[prevStep - 1].title,
        direction: 'backward'
      });
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Update payment status in database - only update paid field
      const { error: paymentError } = await supabase
        .from('bookings')
        .update({ paid: true })
        .eq('id', booking.id);

      if (paymentError) throw paymentError;

      // Mark attendee as checked in
      const { error: checkinError } = await supabase
        .from('attendees')
        .update({ 
          checked_in: true
        })
        .eq('id', attendee.id);

      if (checkinError) throw checkinError;

      // Update the attendee data with checked_in status and updated booking
      const updatedBooking = { ...booking, paid: true };
      const updatedAttendee = { 
        ...attendee, 
        checked_in: true,
        bookings: [updatedBooking]
      };

      // Log payment completion and check-in
      trackEvent('Payment Completed', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        bookingId: booking.id,
        amount: booking.total_amount,
        propertyName: booking.property?.name
      });

      trackEvent('Check-In Completed', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        method: 'payment_flow',
        hasVehicle: attendee.has_rental_car,
        propertyName: booking.property?.name
      });

      // Log check-in completed activity
      await logActivity(attendee.id, attendee.name, 'check_in_completed', {
        method: 'payment_flow',
        propertyName: booking.property?.name,
        amount: booking.total_amount,
        hasVehicle: attendee.has_rental_car
      });

      // Authenticate the attendee with updated data
      await loginAttendee(updatedAttendee);

      toast({
        title: 'Payment Confirmed!',
        description: 'Thank you for your payment. Redirecting to your dashboard...',
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Payment update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const StepIndicator = () => (
    <div className="mb-6">
      {/* Mobile View - Simplified */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all
                    ${isActive ? 'bg-[#e50914] text-white shadow-lg' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-900' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-1 text-xs font-medium text-center ${
                    isActive ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {step.title.split(' ')[0]}
                </span>
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-300 -z-10" 
                       style={{ transform: 'translateX(50%)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Desktop View - Original */}
      <div className="hidden sm:flex items-center justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center ${index > 0 ? 'ml-2' : ''}`}>
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all text-base
                    ${isActive ? 'bg-[#e50914] text-white shadow-lg' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-900' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-semibold ${
                    isActive ? 'text-gray-900' : 'text-gray-800'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-600 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="w-full sm:max-w-2xl sm:mx-auto sm:py-6 sm:px-4">
        <div className="text-center mb-6 px-4 pt-6 sm:px-0 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome, {attendee.name}!</h1>
          <p className="text-base sm:text-lg text-gray-700">CBX Experience Event Check-In</p>
        </div>

        <StepIndicator />

        <Card className="bg-white border-gray-200 shadow-lg mx-4 sm:mx-0">
          {currentStep === 1 && (
            <>
              <CardHeader className="bg-white">
                <CardTitle className="text-gray-900">Confirm Your Dates</CardTitle>
                <CardDescription className="text-gray-700">
                  Please verify your arrival and departure dates for the CBX Experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                {datesModified && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your dates have been previously modified. Please confirm the current dates are correct.
                    </AlertDescription>
                  </Alert>
                )}

                {!isEditingDates ? (
                  <>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Arrival Date</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                              {arrivalDate ? format(new Date(arrivalDate + 'T00:00:00'), 'MMMM d, yyyy') : 'Loading...'}
                            </p>
                          </div>
                          <Calendar className="w-8 h-8 text-gray-700" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Departure Date</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                              {exitDate ? format(new Date(exitDate + 'T00:00:00'), 'MMMM d, yyyy') : 'Loading...'}
                            </p>
                          </div>
                          <Calendar className="w-8 h-8 text-gray-700" />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full bg-white border-2 border-amber-600 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-700 font-semibold"
                      onClick={() => setIsEditingDates(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      These dates are incorrect
                    </Button>
                  </>
                ) : (
                  <>
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Please enter your correct dates below. This change will be flagged for review.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="arrival" className="text-gray-900 font-semibold">Arrival Date</Label>
                        <Input
                          id="arrival"
                          type="date"
                          value={arrivalDate}
                          onChange={(e) => setArrivalDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="exit" className="text-gray-900 font-semibold">Departure Date</Label>
                        <Input
                          id="exit"
                          type="date"
                          value={exitDate}
                          onChange={(e) => setExitDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason" className="text-gray-900 font-semibold">Reason for Change (Optional)</Label>
                        <Input
                          id="reason"
                          placeholder="e.g., Flight changed, Work schedule..."
                          value={dateChangeReason}
                          onChange={(e) => setDateChangeReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full text-gray-800 hover:bg-gray-100 hover:text-gray-900 font-medium"
                      onClick={() => {
                        setIsEditingDates(false);
                        setArrivalDate(booking.arrival_date);
                        setExitDate(booking.exit_date);
                        setDateChangeReason('');
                      }}
                    >
                      Cancel Changes
                    </Button>
                  </>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="flex-1 bg-white border-2 border-gray-400 text-gray-900 hover:bg-gray-50 hover:text-black hover:border-gray-600 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmDates}
                    disabled={isProcessing}
                    className="flex-1 bg-[#e50914] hover:bg-[#b90710] text-white font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Confirming...' : isEditingDates ? 'Save & Continue' : 'Confirm Dates'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader className="bg-white">
                <CardTitle className="text-gray-900">Arrival Details</CardTitle>
                <CardDescription className="text-gray-700">
                  Please provide your transportation and arrival information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-900 font-semibold">
                      What time do you plan to arrive? <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-3 mt-2">
                      <div className="flex-1">
                        <select
                          value={(() => {
                            if (!arrivalTime) return '';
                            const hour24 = parseInt(arrivalTime.split(':')[0]);
                            if (hour24 === 0) return '12';
                            if (hour24 > 12) return (hour24 - 12).toString().padStart(2, '0');
                            return hour24.toString().padStart(2, '0');
                          })()}
                          onChange={(e) => {
                            const hour12 = e.target.value;
                            const minute = arrivalTime.split(':')[1] || '00';
                            
                            if (!hour12) {
                              setArrivalTime('');
                              return;
                            }
                            
                            // Keep the current AM/PM when changing hour
                            const currentHour24 = arrivalTime ? parseInt(arrivalTime.split(':')[0]) : 12;
                            const isPM = currentHour24 >= 12;
                            
                            let hour24 = parseInt(hour12);
                            if (isPM && hour24 !== 12) {
                              hour24 += 12;
                            } else if (!isPM && hour24 === 12) {
                              hour24 = 0;
                            }
                            
                            setArrivalTime(`${hour24.toString().padStart(2, '0')}:${minute}`);
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-[#e50914] focus:outline-none"
                        >
                          <option value="">Hour</option>
                          {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                            <option key={hour} value={hour.toString().padStart(2, '0')}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={arrivalTime.split(':')[1] || ''}
                          onChange={(e) => {
                            const hour = arrivalTime.split(':')[0] || '12';
                            const minute = e.target.value;
                            setArrivalTime(minute ? `${hour}:${minute}` : '');
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-[#e50914] focus:outline-none"
                        >
                          <option value="">Minutes</option>
                          <option value="00">00</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={(() => {
                            if (!arrivalTime) return '';
                            const hour24 = parseInt(arrivalTime.split(':')[0]);
                            return hour24 >= 12 ? 'PM' : 'AM';
                          })()}
                          onChange={(e) => {
                            if (!arrivalTime || !e.target.value) return;
                            
                            const [hourStr, minute] = arrivalTime.split(':');
                            const hour24 = parseInt(hourStr);
                            
                            let hour12;
                            if (hour24 === 0) {
                              hour12 = 12;
                            } else if (hour24 > 12) {
                              hour12 = hour24 - 12;
                            } else {
                              hour12 = hour24;
                            }
                            
                            let newHour24;
                            if (e.target.value === 'PM') {
                              newHour24 = hour12 === 12 ? 12 : hour12 + 12;
                            } else { // AM
                              newHour24 = hour12 === 12 ? 0 : hour12;
                            }
                            
                            setArrivalTime(`${newHour24.toString().padStart(2, '0')}:${minute || '00'}`);
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:border-[#e50914] focus:outline-none"
                        >
                          <option value="">AM/PM</option>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-900 font-semibold">
                      Do you have a vehicle? <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-900 font-medium">Vehicle:</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setHasRentalCar(true)}
                          className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                            hasRentalCar === true 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-green-50 hover:border-green-400 hover:text-green-700'
                          }`}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setHasRentalCar(false)}
                          className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                            hasRentalCar === false 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-red-50 hover:border-red-400 hover:text-red-700'
                          }`}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>

                  {hasRentalCar === false && (
                    <div className="space-y-3">
                      <Label className="text-gray-900 font-semibold">
                        Are you interested in ride sharing? <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-gray-700" />
                          <span className="text-gray-900 font-medium">Ride Sharing:</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => setInterestedInCarpool(true)}
                            className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                              interestedInCarpool === true 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-green-50 hover:border-green-400 hover:text-green-700'
                            }`}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setInterestedInCarpool(false)}
                            className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                              interestedInCarpool === false 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-red-50 hover:border-red-400 hover:text-red-700'
                            }`}
                          >
                            No
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        We'll connect you with other guests for shared rides to/from the airport
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 font-semibold"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSaveArrivalDetails}
                    disabled={isProcessing || hasRentalCar === null || !arrivalTime || (hasRentalCar === false && interestedInCarpool === null)}
                    className="flex-1 bg-[#e50914] hover:bg-[#b90710] text-white font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Saving...' : 'Continue'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader className="bg-white">
                <CardTitle className="text-gray-900">Your Accommodation</CardTitle>
                <CardDescription className="text-gray-700">
                  Property details and total cost
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                <PropertyImages 
                  propertyId={property.id}
                  propertyName={property.name}
                  listingUrl={property.listing_url || undefined}
                />
                
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        VRBO #{property.listing_url?.split('/').pop()?.split('?')[0] || ''}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.address}
                      </p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                      Your Home
                    </Badge>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Total Stay Cost</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-700 font-medium">Payment Status</span>
                      <Badge className={isPaid ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {property.listing_url && (
                  <div className="text-center">
                    <a
                      href={property.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#e50914] hover:underline"
                    >
                      View property listing →
                    </a>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 font-semibold"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="flex-1 bg-[#e50914] hover:bg-[#b90710] text-white font-semibold"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 4 && (
            <>
              <CardHeader className="bg-white">
                <CardTitle className="text-gray-900">Payment</CardTitle>
                <CardDescription className="text-gray-700">
                  {isPaid 
                    ? 'Your payment has already been received!' 
                    : 'Complete your payment via Venmo'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 bg-white">
                {isPaid ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Payment Complete!</h3>
                    <p className="text-gray-700">
                      Thank you for your payment. We look forward to hosting you!
                    </p>
                    <Button 
                      className="mt-6 bg-green-600 hover:bg-green-700 text-white font-medium" 
                      onClick={() => navigate('/check-in')}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4 bg-white rounded-xl p-4 border-2 border-gray-200">
                      <p className="text-sm text-gray-700 font-medium mb-1">Total amount due</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>

                    <div className="space-y-3 mb-4">
                      {/* Venmo Option - with QR code */}
                      <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">Pay with Venmo</h4>
                            <div className="flex items-center gap-4">
                              <div className="bg-white rounded-lg p-2 border-2 border-purple-300">
                                <img 
                                  src="/venmo-qr.png" 
                                  alt="Venmo QR Code" 
                                  className="w-20 h-20"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                                <div className="qr-fallback w-20 h-20 bg-purple-100 border-2 border-purple-300 rounded flex items-center justify-center hidden">
                                  <QrCode className="w-12 h-12 text-purple-500" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-700 font-medium mb-1">Scan QR code or use:</p>
                                <p className="text-lg font-bold text-gray-900">@KeithKabza</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Zelle Option */}
                      <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-emerald-500" />
                            <div>
                              <h4 className="font-bold text-gray-900">Zelle</h4>
                              <p className="text-sm font-semibold text-gray-900">727-455-3833</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-700 font-medium">Phone number</span>
                        </div>
                      </div>

                      {/* PayPal Option */}
                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-gray-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">PayPal</h4>
                              <p className="text-sm font-semibold text-gray-900">keith@visualgov.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                      <p className="text-sm text-gray-900 font-medium">
                        <strong>Important:</strong> Please include your name and "House {property.name.match(/\d+/)?.[0] || ''}" 
                        in the payment note.
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleBack}
                        className="flex-1 bg-white border-2 border-gray-400 text-gray-900 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-600 font-semibold"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={async () => {
                          setIsProcessing(true);
                          try {
                            // Mark attendee as checked in
                            const { error } = await supabase
                              .from('attendees')
                              .update({ 
                                checked_in: true
                              })
                              .eq('id', attendee.id);

                            if (error) throw error;

                            // Update the attendee data with checked_in status
                            const updatedAttendee = { ...attendee, checked_in: true };
                            
                            // Log check-in without payment
                            trackEvent('Check-In Completed', {
                              attendeeName: attendee.name,
                              attendeeId: attendee.id,
                              method: 'without_payment',
                              hasVehicle: attendee.has_rental_car,
                              propertyName: booking.property?.name
                            });
                            
                            // Log check-in completed activity
                            await logActivity(attendee.id, attendee.name, 'check_in_completed', {
                              method: 'without_payment',
                              propertyName: booking.property?.name,
                              amount: booking.total_amount,
                              hasVehicle: attendee.has_rental_car
                            });
                            
                            // Authenticate the attendee
                            await loginAttendee(updatedAttendee);
                            
                            toast({
                              title: 'Check-In Complete',
                              description: 'You can complete payment later. Redirecting to your dashboard...',
                            });
                            setTimeout(() => {
                              navigate('/');
                            }, 1500);
                          } catch (error) {
                            console.error('Check-in error:', error);
                            toast({
                              title: 'Error',
                              description: 'Failed to complete check-in. Please try again.',
                              variant: 'destructive',
                            });
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Pay Later'}
                      </Button>
                      <Button 
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : "Payment Sent"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}