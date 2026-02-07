import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id?: string;
  email: string;
  token?: string;
  role?: 'ADMIN' | 'STAFF';
  name?: string;
}

interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  // Form state
  name: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Error state
  passwordError: string | null;
  confirmPasswordError: string | null;
  generalError: string | null;

  // Form actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setName: (name: string) => void;

  // Validation actions
  validatePassword: (password: string) => boolean;
  validateConfirmPassword: (password: string, confirmPassword: string) => boolean;
  clearErrors: () => void;

  // Error setters
  setPasswordError: (error: string | null) => void;
  setConfirmPasswordError: (error: string | null) => void;
  setGeneralError: (error: string | null) => void;

  // Auth actions
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  resetForm: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,

      name: '',
      email: '',
      password: '',
      confirmPassword: '',

      passwordError: null,
      confirmPasswordError: null,
      generalError: null,

      // Form actions
      setEmail: (email: string) => set({ email }),
      setPassword: (password: string) => {
        set({ password });
        // Validate
        const state = get();
        if (password.length > 0 && password.length < 8) {
          set({ passwordError: 'Password harus minimal 8 karakter' });
        } else {
          set({ passwordError: null });
        }

        if (state.confirmPassword && password !== state.confirmPassword) {
          set({ confirmPasswordError: 'Password tidak cocok' });
        } else if (state.confirmPassword) {
          set({ confirmPasswordError: null });
        }
      },
      setConfirmPassword: (confirmPassword: string) => {
        set({ confirmPassword });
        const { password } = get();
        if (confirmPassword !== password) {
          set({ confirmPasswordError: 'Password tidak cocok' });
        } else {
          set({ confirmPasswordError: null });
        }
      },
      setName: (name: string) => set({ name }),

      // Validation actions
      validatePassword: (password: string): boolean => {
        if (password.length < 8) {
          set({ passwordError: 'Password harus minimal 8 karakter' });
          return false;
        }
        set({ passwordError: null });
        return true;
      },

      validateConfirmPassword: (password: string, confirmPassword: string): boolean => {
        if (password !== confirmPassword) {
          set({ confirmPasswordError: 'Password tidak cocok' });
          return false;
        }
        set({ confirmPasswordError: null });
        return true;
      },

      clearErrors: () =>
        set({
          passwordError: null,
          confirmPasswordError: null,
          generalError: null,
        }),

      // Error setters
      setPasswordError: (error: string | null) => set({ passwordError: error }),
      setConfirmPasswordError: (error: string | null) => set({ confirmPasswordError: error }),
      setGeneralError: (error: string | null) => set({ generalError: error }),

      // Auth actions
      setUser: (user: User | null) =>
        set({ user, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN' }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          email: '',
          password: '',
          confirmPassword: '',
          passwordError: null,
          confirmPasswordError: null,
          generalError: null,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          passwordError: null,
          confirmPasswordError: null,
          generalError: null,
        });
      },

      resetForm: () =>
        set({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          passwordError: null,
          confirmPasswordError: null,
          generalError: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
