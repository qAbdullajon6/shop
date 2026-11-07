import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";

/* Ro'yxatdan o'tish alohida oqim emas — telefon + OTP bitta oqimda ishlaydi
   (backend faqat send-otp / verify-otp ni qo'llab-quvvatlaydi). */
export function RegisterPage() {
  return <Navigate to={ROUTES.LOGIN} replace />;
}
