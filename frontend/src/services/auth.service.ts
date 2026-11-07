import { apiPost, apiGet, apiPatch } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type {
  AuthResponse,
  User,
  SendOtpPayload,
  VerifyOtpPayload,
  UpdateProfilePayload,
} from "@/types";

export const authService = {
  sendOtp: (phone_number: string) =>
    apiPost<{ message: string }>(API_ENDPOINTS.AUTH.SEND_OTP, { phone_number } satisfies SendOtpPayload),

  verifyOtp: (phone_number: string, code: string) =>
    apiPost<AuthResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, { phone_number, code } satisfies VerifyOtpPayload),

  // Telegram Mini App: XOM initData satri serverga yuboriladi va u yerda
  // HMAC-SHA256 bilan tekshiriladi. initDataUnsafe HECH QACHON yuborilmaydi.
  telegramLogin: (init_data: string) =>
    apiPost<AuthResponse>(API_ENDPOINTS.AUTH.TELEGRAM, { init_data }),

  // The 'rt' cookie is sent automatically (withCredentials). No token arg needed.
  logout: () =>
    apiPost<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT),

  getMe: () =>
    apiGet<User>(API_ENDPOINTS.AUTH.ME),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiPatch<User>(API_ENDPOINTS.USERS.UPDATE_ME, payload),
};
