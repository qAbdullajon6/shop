import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";

const STATS = [
  { value: "5+",    label: "Yillik tajriba" },
  { value: "200+",  label: "Premium brend" },
  { value: "5000+", label: "Mamnun mijoz" },
  { value: "100%",  label: "Original mahsulot" },
];

const VALUES = [
  {
    title: "Haqiqiylik",
    desc: "Har bir mahsulot rasmiy distributorlar yoki to'g'ridan-to'g'ri brendlardan keltiriladi. Soxta yoki nusxa ko'chirilgan mahsulot sotmaymiz.",
  },
  {
    title: "Sifat birinchi",
    desc: "Har bir atir, body mist yoki xona aromatizi qabul qilinishidan oldin sifat nazoratidan o'tkaziladi. Siqilgan, muddati o'tgan yoki shubhali mahsulotlar ro'yxatimizga kiritilmaydi.",
  },
  {
    title: "Shaffof narxlar",
    desc: "Yashirin to'lovlar yo'q. Ko'rsatilgan narx — bu siz to'laydigan narx. Aksiya va chegirmalar real va vaqtinchalik.",
  },
];

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Biz haqimizda — Zahabi Parfüm</title>
        <meta name="description" content="Zahabi Parfüm — O'zbekistondagi premium parfyumeriya onlayn do'koni. 2019 yildan beri original atirlar, body care va xona aromalari." />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-6 py-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Biz haqimizda</span>
        </nav>

        <div className="space-y-14">

          {/* Hero intro */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-store-gold mb-3">
                Zahabi Parfüm
              </p>
              <h1 className="text-3xl font-serif font-medium text-store-text mb-4 leading-snug">
                Parfyumeriya — bu san'at.<br />Biz uni O'zbekistonga olib keldik.
              </h1>
              <div className="space-y-3 text-sm text-store-text-muted leading-relaxed">
                <p>
                  Zahabi Parfüm 2019 yilda Toshkentda tashkil etilgan premium parfyumeriya
                  onlayn do'koni. Biz O'zbekistonga Chanel, Dior, Tom Ford, YSL, Versace
                  va o'nlab boshqa dunyo brendlarining original atirlarini olib kiramiz.
                </p>
                <p>
                  Maqsadimiz oddiy: har bir mijozga haqiqiy brend hidini nusxa yoki imitatsiyasiz,
                  qulay narxda va ishonchli yetkazib berish bilan taqdim etish.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="rounded-xl border border-store-border bg-store-card p-5 text-center">
                  <p className="font-serif text-3xl font-light text-store-gold">{value}</p>
                  <p className="mt-1.5 text-xs text-store-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-xl font-serif font-medium text-store-text mb-6">Bizning qadriyatlarimiz</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {VALUES.map(({ title, desc }) => (
                <div key={title} className="rounded-xl border border-store-border bg-store-card p-5">
                  <h3 className="font-semibold text-store-text mb-2">{title}</h3>
                  <p className="text-sm text-store-text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Company details */}
          <div>
            <h2 className="text-base font-semibold text-store-text mb-4">Kompaniya rekvizitlari</h2>
            <div className="overflow-hidden rounded-xl border border-store-border text-sm">
              <table className="w-full">
                <tbody className="divide-y divide-store-border">
                  {[
                    ["Nomi",                 "Zahabi Trade LLC"],
                    ["STIR",                 "312345678"],
                    ["Ro'yxatdan o'tgan sana","12 yanvar 2019"],
                    ["Yuridik manzil",        "Toshkent sh., Mirzo Ulug'bek tumani"],
                    ["Telefon",               "+998 71 123-45-67"],
                    ["Elektron pochta",       "info@zahabi.uz"],
                  ].map(([key, value]) => (
                    <tr key={key} className="hover:bg-store-card/50 transition-colors">
                      <td className="px-4 py-3 text-store-text-muted w-56 flex-shrink-0">{key}</td>
                      <td className="px-4 py-3 text-store-text">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
