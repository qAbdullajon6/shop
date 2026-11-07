import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setLoading: (isLoading) => set({ isLoading }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      // Token cleanup is handled by useAuth.logout() and api.ts interceptor.
      // Tokens are no longer in localStorage — nothing to remove here.
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "zahabi-auth",
      // Only persist non-sensitive UI state. Tokens must never be persisted.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
