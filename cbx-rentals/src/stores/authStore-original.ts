import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Get auth credentials from environment variables
const AUTH_USERNAME = import.meta.env.VITE_AUTH_USERNAME || 'cbxadmin';
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      
      login: (username: string, password: string) => {
        // Debug logging
        console.log('Login attempt:', { username });
        console.log('Expected username:', AUTH_USERNAME);
        console.log('Expected password exists:', !!AUTH_PASSWORD);
        console.log('Environment check:', {
          hasUsername: !!import.meta.env.VITE_AUTH_USERNAME,
          hasPassword: !!import.meta.env.VITE_AUTH_PASSWORD
        });
        
        // Check credentials against environment variables
        if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
          set({ isAuthenticated: true, username });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ isAuthenticated: false, username: null });
      },
    }),
    {
      name: 'cbx-auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);