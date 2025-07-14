import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { trackEvent, setAuthenticatedUserContext } from '../lib/appInsights';

const checkInSchema = z.object({
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

export function CheckInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, userType, attendeeData } = useAuthStore();

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      lastName: '',
      phone: '',
    },
  });

  // If user is already authenticated as an attendee, skip to wizard
  useEffect(() => {
    if (isAuthenticated && userType === 'attendee' && attendeeData) {
      // Navigate directly to wizard with attendee data
      navigate('/check-in/wizard', { 
        state: { 
          attendee: attendeeData,
          booking: attendeeData.bookings?.[0] 
        } 
      });
    }
  }, [isAuthenticated, userType, attendeeData, navigate]);

  const cleanPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters for database lookup
    return phone.replace(/\D/g, '');
  };

  const onSubmit = async (values: CheckInFormValues) => {
    setIsLoading(true);
    
    try {
      // Track check-in attempt
      trackEvent('Check-In Attempt', {
        lastName: values.lastName,
        phoneLastFour: values.phone.slice(-4), // Only last 4 digits for privacy
        source: 'check_in_page'
      });

      // Clean phone number for database lookup (remove all non-digits)
      const cleanedPhone = cleanPhoneNumber(values.phone);
      
      // Search for attendee by last name and phone
      const { data: attendees, error } = await supabase
        .from('attendees')
        .select(`
          *,
          bookings (
            *,
            property:properties (*)
          )
        `)
        .ilike('name', `%${values.lastName}%`)
        .eq('phone', cleanedPhone);

      if (error) throw error;

      if (!attendees || attendees.length === 0) {
        trackEvent('Check-In Failed', {
          reason: 'not_found',
          lastName: values.lastName,
          phoneLastFour: values.phone.slice(-4)
        });
        toast({
          title: 'Not Found',
          description: 'No booking found with that last name and phone number. Please check your information.',
          variant: 'destructive',
        });
        return;
      }

      // If multiple matches, try to find exact match
      let attendee = attendees[0];
      if (attendees.length > 1) {
        const exactMatch = attendees.find(a => 
          a.name.toLowerCase().endsWith(values.lastName.toLowerCase())
        );
        if (exactMatch) attendee = exactMatch;
      }

      // Set user context for this session
      setAuthenticatedUserContext(attendee.id, attendee.name);
      
      // Track successful check-in start
      trackEvent('Check-In Started', {
        attendeeName: attendee.name,
        attendeeId: attendee.id,
        lastName: values.lastName,
        phoneLastFour: values.phone.slice(-4),
        hasBooking: !!attendee.bookings?.[0],
        propertyName: attendee.bookings?.[0]?.property?.name
      });

      // Navigate to wizard with attendee data
      navigate('/check-in/wizard', { 
        state: { 
          attendee,
          booking: attendee.bookings?.[0] 
        } 
      });
      
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#e50914] rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Guest Check-In</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your information to view your booking details and make payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your last name" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(555) 555-5555" 
                        {...field} 
                        disabled={isLoading}
                        type="tel"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#e50914] hover:bg-[#b90710] text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>CBX Experience • September 10-14, 2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}