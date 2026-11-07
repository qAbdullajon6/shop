import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ShieldCheck, Truck, Heart } from "lucide-react";
import { usePhoneAuthStore } from "@/store/phoneAuthStore";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

const PERKS = [
  { Icon: ShieldCheck, title: "Buyurtmalaringiz tarixi", desc: "Barcha xaridlar bir joyda saqlanadi" },
  { Icon: Heart,       title: "Sevimlilar ro'yxati",     desc: "Yoqqan atirlarni keyinga saqlab qo'ying" },
  { Icon: Truck,       title: "Tez rasmiylashtirish",    desc: "Manzilingiz eslab qolinadi" },
];

export function LoginPage() {
  const open = usePhoneAuthStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.PROFILE, { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Helmet>
        <title>Tizimga kirish — Zahabi Parfüm</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-store-bg px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to={ROUTES.HOME}
            className="mb-8 inline-flex items-center gap-2 text-[13px] text-store-text-muted transition-colors hover:text-store-gold"
          >
            <ArrowLeft size={15} />
            Bosh sahifaga
          </Link>

          <div className="rounded-2xl border border-store-border bg-store-card p-8 text-center">
            <img src="/logo.png" alt="Zahabi Parfüm" className="mx-auto h-14 w-auto object-contain" />

            <h1 className="mt-6 font-serif text-[26px] font-medium leading-snug text-store-text">
              Tizimga kirish yoki<br />ro'yxatdan o'tish
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-store-text-muted">
              Telefon raqamingiz orqali bir necha soniyada. Parol kerak emas.
            </p>

            <button
              onClick={open}
              className="mt-7 h-12 w-full rounded-md bg-store-gold text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Telefon raqam bilan davom etish
            </button>
          </div>

          <ul className="mt-8 space-y-4">
            {PERKS.map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-store-surface">
                  <Icon size={17} strokeWidth={1.6} className="text-store-gold" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-store-text">{title}</p>
                  <p className="mt-0.5 text-[12px] text-store-text-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
