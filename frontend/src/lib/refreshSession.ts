import axios from "axios";
import { API_BASE_URL } from "@/constants";

/**
 * Yagona (single-flight) sessiya yangilash.
 *
 * Refresh token bitta httpOnly cookie'da saqlanadi va backend uni har
 * ishlatishda ALMASHTIRADI (rotation). Agar bir sahifa yuklanishida bir necha
 * komponent (AdminGuard, useAuth, axios interceptorlar) bir vaqtda
 * `/auth/refresh` chaqirsa, birinchisi tokenni rotatsiya qiladi, qolganlari
 * eskirgan token bilan 404 oladi — va reuse-detection barcha sessiyalarni
 * o'chirib yuborishi mumkin.
 *
 * Shu sababli barcha chaqiruvchilar SHU yerdagi bitta in-flight so'rovni
 * ulashadi: bir vaqtning o'zida faqat bitta haqiqiy HTTP refresh bo'ladi.
 */
let inFlight: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (inFlight) return inFlight;

  inFlight = axios
    .post<{ access_token: string }>(`${API_BASE_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .then((res) => res.data.access_token)
    .finally(() => {
      // Keyingi (yangi) chaqiruvlar yangi so'rov yaratishi uchun tozalanadi.
      inFlight = null;
    });

  return inFlight;
}
