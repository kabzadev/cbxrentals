import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface AttendeeData {
  name: string;
  bookings: { id: string; paid: boolean }[];
  // Add other fields as needed
}

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userType: 'admin' | 'attendee' | null;
  attendeeData: AttendeeData | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginAttendee: (attendeeData: AttendeeData) => void;
  updatePaymentStatus: (bookingId: string, paid: boolean) => void;
  logout: () => void;
}

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
          // Admin login (assume username is email for Supabase Auth)
          const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password,
          });

          if (error) {
            console.error('Admin login error:', error);
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
              return false;
            }

            // For attendee, sign in with Supabase phone auth if possible, or custom
            // Assuming custom for now, but set session manually (not secure; improve)
            set({
              isAuthenticated: true,
              username: attendees[0].name,
              userType: 'attendee',
              attendeeData: attendees[0],
            });
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
          return false;
        }
      },

      loginAttendee: (attendeeData: AttendeeData) => {
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
