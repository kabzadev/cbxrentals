import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userType: 'admin' | 'attendee' | null;
  attendeeData: any | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginAttendee: (attendeeData: any) => void;
  updatePaymentStatus: (bookingId: string, paid: boolean) => void;
  logout: () => void;
}

// TEMPORARY HARDCODED VALUES FOR TESTING
const AUTH_USERNAME = 'cbxadmin';
const AUTH_PASSWORD = 'CBX2024$ecure!';

const formatPhoneNumber = (phone: string) => {
  // Remove all non-numeric characters and return just digits
  return phone.replace(/\D/g, '');
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      userType: null,
      attendeeData: null,
      
      login: async (username: string, password: string) => {
        console.log('Login attempt with username:', username);
        
        // Check admin login first
        if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
          set({ 
            isAuthenticated: true, 
            username,
            userType: 'admin',
            attendeeData: null
          });
          return true;
        }
        
        // Check attendee login (last name + phone number)
        try {
          const formattedPhone = formatPhoneNumber(password);
          
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
            .ilike('name', `%${username}%`)
            .eq('phone', formattedPhone);

          if (error) throw error;

          if (attendees && attendees.length > 0) {
            // If multiple matches, try to find exact match
            let attendee = attendees[0];
            if (attendees.length > 1) {
              const exactMatch = attendees.find(a => 
                a.name.toLowerCase().endsWith(username.toLowerCase())
              );
              if (exactMatch) attendee = exactMatch;
            }

            set({ 
              isAuthenticated: true, 
              username: attendee.name,
              userType: 'attendee',
              attendeeData: attendee
            });
            return true;
          }
        } catch (error) {
          console.error('Attendee login error:', error);
        }
        
        return false;
      },

      loginAttendee: (attendeeData: any) => {
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
              bookings: state.attendeeData.bookings.map((booking: any) =>
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
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);