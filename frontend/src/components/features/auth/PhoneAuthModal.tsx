import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePhoneAuthStore } from "@/store/phoneAuthStore";
import { authService } from "@/services/auth.service";
import { tokens } from "@/lib/tokens";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

function formatUzPhone(digits: string): string {
  const d = digits.slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

/* Kod uzunligi backend VERIFICATION_CODE_LENGTH bilan mos bo'lishi shart (standart 6). */
const OTP_LENGTH = 6;

function OtpBoxes({ onComplete, disabled }: { onComplete: (c: string) => void; disabled: boolean }) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (digits[i]) { const n = [...digits]; n[i] = ""; setDigits(n); }
      else if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    p.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    refs.current[Math.min(p.length, OTP_LENGTH - 1)]?.focus();
    if (p.length === OTP_LENGTH) onComplete(p);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl border-2 bg-store-input text-center text-xl font-semibold text-store-text outline-none transition-all
            ${d ? "border-store-gold" : "border-store-border focus:border-store-gold"}
            ${disabled ? "opacity-40" : ""}`}
        />
      ))}
    </div>
  );
}

function Countdown({ timerKey, onDone }: { timerKey: number; onDone: () => void }) {
  const [left, setLeft] = useState(60);
  useEffect(() => { setLeft(60); }, [timerKey]);
  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onDone]);
  return (
    <span className="tabular-nums font-medium text-store-text">
      {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
    </span>
  );
}

export function PhoneAuthModal() {
  const { isOpen, step, phone, submitPhone, close, verifySuccess } = usePhoneAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  const [rawDigits, setRawDigits] = useState("");
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [error, setError] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawDigits.length < 9 || loading) return;
    setLoading(true);
    setError("");
    try {
      const phoneNumber = `+998${rawDigits}`;
      await authService.sendOtp(phoneNumber);
      submitPhone(phoneNumber);
      setCanResend(false);
      setTimerKey((k) => k + 1);
    } catch {
      setError("SMS yuborishda xatolik. Keyinroq urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (code: string) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await authService.verifyOtp(phone, code);
      tokens.setAccess(response.access_token);
      setUser(response.user);
      verifySuccess();
      // If the user is already inside the profile area (including any ?tab=),
      // stay there — the tab context is preserved in the URL.
      // Otherwise navigate to the profile home.
      if (!location.pathname.startsWith(ROUTES.PROFILE)) {
        navigate(ROUTES.PROFILE);
      }
    } catch {
      setError("Noto'g'ri kod. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await authService.sendOtp(phone);
      setCanResend(false);
      setTimerKey((k) => k + 1);
    } catch {
      setError("SMS qayta yuborishda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => close(), [close]);

  const goBack = () => {
    usePhoneAuthStore.setState({ step: "phone", pendingVerify: false, phone: "" });
    setRawDigits("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-[360px] rounded-2xl bg-store-card border border-store-border shadow-2xl">

        <div className="absolute left-4 right-4 top-4 flex justify-between">
          {step === "verify"
            ? (
              <button
                onClick={goBack}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-store-input text-store-text-muted hover:bg-store-border hover:text-store-text transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
            )
            : <span />}
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-store-input text-store-text-muted hover:bg-store-border hover:text-store-text transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-7 pt-12 pb-7">

          <div className="mb-5 flex justify-center">
            <img src="/logo.png" alt="Zahabi Parfüm" className="h-12 w-auto object-contain" />
          </div>

          {step === "phone" && (
            <>
              <h2 className="mb-1.5 text-center font-serif text-[22px] font-medium leading-snug text-store-text">
                Tizimga kirish yoki<br />ro'yxatdan o'tish
              </h2>
              <p className="mb-5 text-center text-xs text-store-text-muted">
                Telefon raqamingizni kiriting
              </p>

              <form onSubmit={handlePhoneSubmit} noValidate>
                <div
                  className={`flex overflow-hidden rounded-xl border transition-colors
                    ${error ? "border-red-500" : "border-store-border focus-within:border-store-gold"}`}
                >
                  <span className="flex shrink-0 items-center border-r border-store-border bg-store-nav px-3 py-3 text-sm font-semibold text-store-text-muted">
                    +998
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="90 000-00-00"
                    value={formatUzPhone(rawDigits)}
                    onChange={(e) => {
                      setError("");
                      setRawDigits(e.target.value.replace(/\D/g, "").slice(0, 9));
                    }}
                    autoFocus
                    className="flex-1 bg-store-input px-3 py-3 text-sm text-store-text outline-none placeholder:text-store-text-dim"
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={rawDigits.length < 9 || loading}
                  className="mt-3.5 w-full rounded-xl bg-store-gold py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Yuborilmoqda...
                    </span>
                  ) : (
                    "Kodni olish"
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-store-text-dim">
                Davom etib siz{" "}
                <a href="/terms" className="text-store-gold hover:underline">
                  foydalanish shartlari
                </a>
                {" "}va{" "}
                <a href="/privacy" className="text-store-gold hover:underline">
                  maxfiylik siyosati
                </a>
                {" "}bilan rozisiz
              </p>
            </>
          )}

          {step === "verify" && (
            <>
              <h2 className="mb-1.5 text-center font-serif text-[22px] font-medium text-store-text">
                SMS kodni tasdiqlang
              </h2>
              <p className="mb-5 text-center text-xs text-store-text-muted">
                <span className="font-semibold text-store-text">{phone}</span> ga yuborildi
              </p>

              <OtpBoxes onComplete={handleOtp} disabled={loading} />

              {error && (
                <p className="mt-2.5 text-center text-xs text-red-500">{error}</p>
              )}
              {loading && (
                <div className="mt-3 flex justify-center">
                  <span className="h-4 w-4 rounded-full border-2 border-store-border border-t-store-gold animate-spin" />
                </div>
              )}

              <div className="mt-4 text-center text-xs text-store-text-muted">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-store-gold font-medium hover:underline disabled:opacity-40"
                  >
                    Qayta yuborish
                  </button>
                ) : (
                  <span>
                    Qayta yuborish —{" "}
                    <Countdown timerKey={timerKey} onDone={() => setCanResend(true)} />
                    {" "}dan keyin
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
