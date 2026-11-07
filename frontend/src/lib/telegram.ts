/**
 * Telegram Mini App (WebApp) integratsiyasi.
 *
 * Bir xil React ilova ikki muhitda ishlaydi:
 *   • Oddiy brauzer — telefon+OTP autentifikatsiya
 *   • Telegram Mini App — `window.Telegram.WebApp.initData` orqali avtomatik
 *     autentifikatsiya (server initData'ni HMAC bilan tekshiradi)
 *
 * MUHIM: `initDataUnsafe` (parse qilingan obyekt) HECH QACHON serverga
 * yuborilmaydi va ishonch uchun ishlatilmaydi — u faqat UI ko'rinishi uchun.
 * Ishonchli manba — imzolangan XOM `initData` satri.
 */

interface TelegramBackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(fn: () => void): void;
  offClick(fn: () => void): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    user?: { id: number; first_name?: string; last_name?: string; username?: string };
  };
  ready: () => void;
  expand: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  version?: string;
  platform?: string;
  BackButton?: TelegramBackButton;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** Ilova Telegram Mini App ichida ochilganmi? (imzolangan initData mavjudmi) */
export function isTelegramMiniApp(): boolean {
  const wa = getTelegramWebApp();
  return Boolean(wa && typeof wa.initData === "string" && wa.initData.length > 0);
}

/** Serverga yuboriladigan XOM initData satri (yoki null). */
export function getTelegramInitData(): string | null {
  const wa = getTelegramWebApp();
  if (!wa || !wa.initData) return null;
  return wa.initData;
}

/** Telegram WebApp'ga ilova tayyorligini bildiradi va oynani yoyadi. */
export function initTelegramWebApp(): void {
  const wa = getTelegramWebApp();
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
  } catch {
    // Eski Telegram klientlarida ba'zi metodlar bo'lmasligi mumkin — muhim emas.
  }
}
