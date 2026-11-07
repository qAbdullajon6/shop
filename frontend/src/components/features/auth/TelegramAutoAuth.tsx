import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { tokens } from "@/lib/tokens";
import {
  isTelegramMiniApp,
  getTelegramInitData,
  initTelegramWebApp,
} from "@/lib/telegram";

/**
 * Telegram Mini App ichida ochilganda foydalanuvchini avtomatik kiritadi.
 *
 * Oqim:
 *   1. `window.Telegram.WebApp` mavjudligini aniqlaydi
 *   2. XOM `initData` ni serverga yuboradi (POST /auth/telegram)
 *   3. Server HMAC bilan tekshiradi, hisobni bog'laydi/yaratadi va token beradi
 *
 * Oddiy brauzerda (Telegram emas) bu komponent hech narsa qilmaydi —
 * telefon+OTP oqimi o'z holicha ishlaydi.
 */
export function TelegramAutoAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (!isTelegramMiniApp()) return;
    attempted.current = true;

    initTelegramWebApp();

    // Allaqachon kirgan bo'lsa qayta autentifikatsiya shart emas.
    if (isAuthenticated) return;

    const initData = getTelegramInitData();
    if (!initData) return;

    // isLoading=true so ProfilePage shows a spinner instead of the
    // "please login" screen during the auth round-trip.
    setLoading(true);
    authService
      .telegramLogin(initData)
      .then((res) => {
        tokens.setAccess(res.access_token);
        setUser(res.user);
      })
      .catch(() => {
        // Invalid/expired initData — let the user log in via OTP.
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, setUser, setLoading]);

  return null;
}
