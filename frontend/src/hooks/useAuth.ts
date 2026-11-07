import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { tokens } from "@/lib/tokens";
import { ROUTES } from "@/constants";
import { refreshAccessToken } from "@/lib/refreshSession";

export function useAuth() {
  const navigate = useNavigate();
  const store = useAuthStore();

  const sendOtp = useCallback(
    (phoneNumber: string) => authService.sendOtp(phoneNumber),
    []
  );

  const verifyOtp = useCallback(
    async (phoneNumber: string, code: string) => {
      store.setLoading(true);
      try {
        const response = await authService.verifyOtp(phoneNumber, code);
        // Only the access token is stored in memory; the refresh token is in the
        // httpOnly 'rt' cookie set by the server — not accessible here at all.
        tokens.setAccess(response.access_token);
        store.setUser(response.user);
        navigate(ROUTES.HOME);
        return response;
      } finally {
        store.setLoading(false);
      }
    },
    [store, navigate]
  );

  const logout = useCallback(async () => {
    try {
      // Cookie sent automatically via withCredentials; no token to pass.
      await authService.logout();
    } finally {
      tokens.clearAccess();
      store.clearUser();
      navigate(ROUTES.LOGIN);
    }
  }, [store, navigate]);

  const loadUser = useCallback(async () => {
    store.setLoading(true);
    try {
      // If there's no in-memory access token (e.g. page reload), attempt a silent
      // refresh first. The httpOnly cookie is sent automatically; if it's valid
      // the server rotates it and returns a fresh access token.
      if (!tokens.getAccess()) {
        const accessToken = await refreshAccessToken();
        tokens.setAccess(accessToken);
      }

      const user = await authService.getMe();
      store.setUser(user);
    } catch {
      // No valid session — clear any stale UI state and stay on the current page.
      tokens.clearAccess();
      store.clearUser();
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    sendOtp,
    verifyOtp,
    logout,
    loadUser,
  };
}
