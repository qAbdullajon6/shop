import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Check, X } from "lucide-react";
import { ROUTES } from "@/constants";

const RETURNABLE = [
  "Mahsulot yetkazilgandan keyin 14 kun ichida qaytarish",
  "Qadoqlash buzilmagan (original holati saqlangan)",
  "Mahsulot ishlatilmagan (parfyum holati o'zgarilmagan)",
  "Kerak bo'lsa, noto'g'ri yetkazilgan mahsulot",
  "Tasvirda ko'rsatilganidan farqli mahsulot",
];

const NON_RETURNABLE = [
  "Qadoqlash ochilgan va mahsulot ishlatilgan parfyum",
  "Sanitariya nuqtai nazaridan qaytarib bo'lmaydigan mahsulotlar",
  "Chegirmadagi va aksiya tovarlarining maxsus holatlarida",
  "14 kundan oshib ketgan muddatda",
];

const PROCESS = [
  { step: "1", title: "Murojaat qiling", desc: "info@zahabi.uz ga yozing yoki +998 71 123-45-67 ga qo'ng'iroq qiling." },
  { step: "2", title: "Holat tasdiqlash", desc: "Operator mahsulot holatini va qaytarish mumkinligini 24 soat ichida tasdiqlaydi." },
  { step: "3", title: "Qaytarish", desc: "Kuryer siz bilan bog'lanadi va mahsulotni olib ketadi." },
  { step: "4", title: "Pul qaytarish", desc: "Mablag' 3–5 ish kuni ichida asl to'lov usuliga qaytariladi." },
];

export function WarrantyPage() {
  return (
    <>
      <Helmet>
        <title>Qaytarish siyosati — Zahabi Parfüm</title>
        <meta name="description" content="Zahabi Parfüm qaytarish shartlari: 14 kunlik qaytarish kafol, tartib va shartlar." />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-6 py-6">
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Qaytarish siyosati</span>
        </nav>

        <div className="space-y-10">

          {/* Header */}
          <div>
            <h1 className="mb-3 text-2xl font-serif font-medium text-store-text">
              14 kunlik qaytarish kafolati
            </h1>
            <p className="text-sm text-store-text-muted leading-relaxed max-w-2xl">
              Zahabi Parfümda xarid qilish 100% xavfsiz. Mahsulot siz kutgandek bo'lmasa,
              14 kun ichida qaytarib, to'liq pulni qaytarib oling.
            </p>
          </div>

          {/* Returnable / Non-returnable */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-store-border bg-store-card p-5">
              <h2 className="font-semibold text-store-text mb-3 flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                Qaytarish mumkin
              </h2>
              <ul className="space-y-2">
                {RETURNABLE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-store-text-muted">
                    <Check size={14} className="mt-0.5 flex-shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-store-border bg-store-card p-5">
              <h2 className="font-semibold text-store-text mb-3 flex items-center gap-2">
                <X size={16} className="text-store-red" />
                Qaytarish mumkin emas
              </h2>
              <ul className="space-y-2">
                {NON_RETURNABLE.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-store-text-muted">
                    <X size={14} className="mt-0.5 flex-shrink-0 text-store-red" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Process */}
          <div>
            <h2 className="text-base font-semibold text-store-text mb-5">Qaytarish tartibi</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map(({ step, title, desc }) => (
                <div key={step} className="rounded-xl border border-store-border bg-store-card p-4">
                  <div className="w-8 h-8 rounded-full bg-store-gold/15 flex items-center justify-center mb-3">
                    <span className="text-sm font-bold text-store-gold">{step}</span>
                  </div>
                  <h3 className="font-medium text-store-text text-sm mb-1">{title}</h3>
                  <p className="text-xs text-store-text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-store-gold/30 bg-store-gold/5 p-5">
            <h2 className="font-semibold text-store-text mb-2">Savol qoldimi?</h2>
            <p className="text-sm text-store-text-muted">
              Istalgan vaqt biz bilan bog'laning:{" "}
              <a href="mailto:info@zahabi.uz" className="text-store-gold hover:underline">info@zahabi.uz</a>
              {" "}yoki{" "}
              <a href="tel:+998711234567" className="text-store-gold hover:underline">+998 71 123-45-67</a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
