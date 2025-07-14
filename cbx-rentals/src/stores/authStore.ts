import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { trackEvent, trackException, setAuthenticatedUserContext } from '../lib/appInsights';

interface AttendeeData {
  id: string;
  name: string;
  checked_in?: boolean;
  bookings: { 
    id: string; 
    paid: boolean;
    property?: {
      name: string;
    };
  }[];
  // Add other fields as needed
}

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userType: 'admin' | 'attendee' | null;
  attendeeData: AttendeeData | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginAttendee: (attendeeData: AttendeeData) => Promise<void>;
  updatePaymentStatus: (bookingId: string, paid: boolean) => void;
  logout: () => void;
}

// Hardcoded admin credentials
const ADMIN_USERNAME = 'cbxadmin';
const ADMIN_PASSWORD = 'cbx2025';

// Update formatPhoneNumber to include hashing (client-side; move to server for security)
const formatPhoneNumber = (phone: string) => {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  // TODO: Hash on server via Edge Function
  return digits;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      userType: null,
      attendeeData: null,

      login: async (username: string, password: string) => {
        try {
          // Check hardcoded admin credentials first
          if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            set({
              isAuthenticated: true,
              username,
              userType: 'admin',
              attendeeData: null,
            });
            setAuthenticatedUserContext(username, 'admin');
            trackEvent('Login', { userType: 'admin', method: 'hardcoded' });
            return true;
          }

          // Try Supabase Auth for other admin users
          const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password,
          });

          if (error) {
            console.error('Supabase auth error:', error);
            // Fallback to attendee login
            const formattedPhone = formatPhoneNumber(password);
            const { data: attendees, error: attendeeError } = await supabase
              .from('attendees')
              .select(`
                *,
                bookings (
                  *,
                  property:properties (*)
                )
              `)
              .ilike('name', `%${username}%`)
              .eq('phone', formattedPhone);

            if (attendeeError || !attendees?.length) {
              trackEvent('Login Failed', { userType: 'attendee', reason: 'not_found' });
              return false;
            }

            const attendee = attendees[0];
            
            // Check if attendee is off-site (has a booking with property name "Off-site")
            const isOffsite = attendee.bookings?.some((booking: any) => 
              booking.property?.name === 'Off-site'
            );

            // If off-site and not already checked in, mark them as checked in
            if (isOffsite && !attendee.checked_in) {
              const { error: updateError } = await supabase
                .from('attendees')
                .update({ checked_in: true })
                .eq('id', attendee.id);

              if (!updateError) {
                attendee.checked_in = true;
                trackEvent('Auto Check-in', { attendeeName: attendee.name, reason: 'offsite' });
              }
            }

            // For attendee, sign in with Supabase phone auth if possible, or custom
            // Assuming custom for now, but set session manually (not secure; improve)
            set({
              isAuthenticated: true,
              username: attendee.name,
              userType: 'attendee',
              attendeeData: attendee,
            });
            setAuthenticatedUserContext(attendee.name, 'attendee');
            trackEvent('Login', { userType: 'attendee', method: 'phone', isOffsite });
            return true;
          }

          // On success, get session and set state
          const session = data.session;
          supabase.auth.setSession(session);
          set({
            isAuthenticated: true,
            username: data.user?.email || username,
            userType: 'admin', // Or fetch from metadata/claims
            attendeeData: null,
          });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          trackException(error as Error, { context: 'login' });
          return false;
        }
      },

      loginAttendee: async (attendeeData: AttendeeData) => {
        // Check if attendee is off-site
        const isOffsite = attendeeData.bookings?.some(booking => 
          booking.property?.name === 'Off-site'
        );

        // If off-site and not already checked in, mark them as checked in
        if (isOffsite && !attendeeData.checked_in) {
          const { error: updateError } = await supabase
            .from('attendees')
            .update({ checked_in: true })
            .eq('id', attendeeData.id);

          if (!updateError) {
            attendeeData.checked_in = true;
            trackEvent('Auto Check-in', { attendeeName: attendeeData.name, reason: 'offsite' });
          }
        }

        set({
          isAuthenticated: true,
          username: attendeeData.name,
          userType: 'attendee',
          attendeeData: attendeeData
        });
      },

      updatePaymentStatus: (bookingId: string, paid: boolean) => {
        set((state) => {
          if (state.attendeeData && state.attendeeData.bookings) {
            const updatedAttendeeData = {
              ...state.attendeeData,
              bookings: state.attendeeData.bookings.map((booking: { id: string; paid: boolean; [key: string]: unknown }) =>
                booking.id === bookingId ? { ...booking, paid } : booking
              )
            };
            return { attendeeData: updatedAttendeeData };
          }
          return state;
        });
      },

      logout: () => {
        const state = useAuthStore.getState();
        trackEvent('Logout', { 
          userType: state.userType,
          username: state.username 
        });
        set({
          isAuthenticated: false,
          username: null,
          userType: null,
          attendeeData: null
        });
      },
    }),
    {
      name: 'cbx-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
