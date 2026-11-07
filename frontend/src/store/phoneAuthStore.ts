import { create } from "zustand";
import { persist } from "zustand/middleware";

type Step = "phone" | "verify";

interface PhoneAuthState {
  // Persisted — refresh bo'lsa ham verify saqlanadi
  pendingVerify: boolean;
  phone: string;
  // Runtime only — persist qilinmaydi
  isOpen: boolean;
  step: Step;
  // Actions
  open: () => void;
  submitPhone: (phone: string) => void;
  close: () => void;
  verifySuccess: () => void;
}

export const usePhoneAuthStore = create<PhoneAuthState>()(
  persist(
    (set) => ({
      pendingVerify: false,
      phone: "",
      isOpen: false,
      step: "phone",

      open: () =>
        set((s) => ({
          isOpen: true,
          step: s.pendingVerify ? "verify" : "phone",
        })),

      submitPhone: (phone) =>
        set({ phone, pendingVerify: true, step: "verify" }),

      close: () =>
        set((s) => ({
          isOpen: false,
          // pendingVerify true bo'lib qoladi — refresh da qayta ochish uchun
          // faqat muvaffaqiyatli verify yoki user o'zi bekor qilsa tozalanadi
          pendingVerify: s.pendingVerify,
        })),

      verifySuccess: () =>
        set({ isOpen: false, pendingVerify: false, phone: "", step: "phone" }),
    }),
    {
      name: "zahabi-phone-auth",
      // isOpen/step saqlanmaydi — aks holda modal har bir sahifa yuklanishida
      // o'z-o'zidan ochilib qolardi. pendingVerify saqlanadi: foydalanuvchi
      // modalni qayta ochsa, open() uni to'g'ridan-to'g'ri verify qadamiga qaytaradi.
      partialize: (s) => ({ pendingVerify: s.pendingVerify, phone: s.phone }),
    }
  )
);
