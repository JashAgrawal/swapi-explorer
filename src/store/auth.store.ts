/**
 * Authentication store using Zustand
 * Manages user authentication state and provides login/logout functionality
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock user data for demonstration purposes
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

// Authentication store state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Mock credentials for demo purposes
const MOCK_CREDENTIALS = {
  username: 'demo',
  password: 'password',
};

// Mock user data
const MOCK_USER: User = {
  id: '1',
  username: 'demo',
  name: 'Demo User',
  email: 'demo@example.com',
};

/**
 * Authentication store with persistence
 * Uses localStorage to persist auth state between sessions
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Simulates a login request with mock validation
       * In a real app, this would make an API call
       */
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
            set({ 
              user: MOCK_USER, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              error: 'Invalid username or password', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: 'An error occurred during login', 
            isLoading: false 
          });
        }
      },

      /**
       * Logs out the current user
       */
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      /**
       * Clears any authentication errors
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // Only persist these fields
    }
  )
);
