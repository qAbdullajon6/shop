import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";

const BENEFITS = [
  {
    title: "Katta auditoriya",
    desc: "50 000+ faol xaridor bazasiga to'g'ridan-to'g'ri chiqing. Mahsulotingiz bir kechada minglab potentsial mijozlar ko'radi.",
  },
  {
    title: "Nol reklama xarajati",
    desc: "Sayt trafigi, SEO, ijtimoiy tarmoqlar — bularni biz hal qilamiz. Siz faqat sifatli mahsulot bilan kelasiz.",
  },
  {
    title: "Tez va oson boshlash",
    desc: "Hujjatlar, shartnoma, mahsulot yuklanishi — 3–5 ish kunida do'konda sahifangiz tayyor bo'ladi.",
  },
  {
    title: "Shaffof hisobot",
    desc: "Real vaqt rejimida sotuv statistikasi, konversiya, va to'lov tarixi — hamma narsa shaxsiy kabinetda.",
  },
  {
    title: "Mahsulot kafolati saqlanadi",
    desc: "Ishlab chiqaruvchi kafolati va servis markazingiz bilan aloqa to'liq saqlanadi. Biz faqat savdo kanalini ta'minlaymiz.",
  },
  {
    title: "Moslashuvchan shartlar",
    desc: "Hamkorlik formati va shartlari individual muhokama qilinadi — kichik yetkazuvchidan yirik distributorgacha.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Murojaat yuboring",
    desc: "Telefon yoki forma orqali biz bilan bog'laning. Menejerimiz 1 ish kuni ichida javob beradi.",
  },
  {
    n: "02",
    title: "Mahsulotlar ro'yxatini taqdim eting",
    desc: "Assortiment, kategoriya va minimal tavsiflarni yuboring — biz mahsulotlarni tez joylashtirish jarayonini boshlaymiz.",
  },
  {
    n: "03",
    title: "Shartnoma tuzing",
    desc: "Shartlarni birgalikda kelishib olamiz va rasmiy shartnomani imzalaymiz. Hammasi shaffof va qonuniy.",
  },
  {
    n: "04",
    title: "Sotuvni boshlang",
    desc: "Sahifangiz jonlandi — buyurtmalar tushadi, to'lovlar kelishilgan jadval bo'yicha o'tkaziladi.",
  },
];

export function PartnershipPage() {
  return (
    <>
      <Helmet>
        <title>Hamkorlik — Zahabi Parfüm</title>
        <meta
          name="description"
          content="Zahabi.uz bilan hamkorlik qiling — mahsulotlaringizni 50 000+ xaridor bazasiga yetkazing. Shartlar individual, boshlash oson."
        />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-6 py-6">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">
            Bosh sahifa
          </Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Hamkorlik</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-10">

            {/* Hero block */}
            <div>
              <h1 className="mb-4 text-2xl font-bold text-store-text">
                Mahsulotlaringizni biz bilan soting
              </h1>
              <div className="space-y-3 text-sm text-store-text-muted leading-relaxed">
                <p>
                  Zahabi Parfüm — O'zbekistonning yetakchi onlayn parfyumeriya do'koni. Bizning
                  platformamiz sizga tayyor auditoriya, ishonchli infratuzilma va kuchli
                  marketing kanalini taqdim etadi. Siz faqat original va sifatli mahsulot bilan
                  kelasiz — qolgan hamma narsani biz hal qilamiz.
                </p>
                <p>
                  Kuniga yuzlab buyurtma qayta ishlash tajribasiga ega jamoamiz hamkor
                  brendlarning atirlarini xuddi o'zimiznikidek e'tibor bilan taqdim etadi.
                  Bizga qo'shilgan hamkorlar o'rtacha{" "}
                  <span className="font-medium text-store-text">2–3 hafta ichida</span> birinchi
                  sotuv natijalarini ko'rishadi.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h2 className="mb-4 text-base font-semibold text-store-text">
                Nima uchun aynan Zahabi Parfüm?
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {BENEFITS.map(({ title, desc }) => (
                  <div
                    key={title}
                    className="rounded-lg border border-store-border bg-store-card p-4 hover:border-store-gold/40 transition-colors"
                  >
                    <p className="mb-1.5 text-sm font-semibold text-store-text">{title}</p>
                    <p className="text-xs text-store-text-muted leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <h2 className="mb-4 text-base font-semibold text-store-text">
                Hamkorlik qanday boshlanadi?
              </h2>
              <div className="space-y-px overflow-hidden rounded-lg border border-store-border">
                {STEPS.map(({ n, title, desc }) => (
                  <div
                    key={n}
                    className="flex gap-4 bg-store-card px-5 py-4 hover:bg-store-bg transition-colors"
                  >
                    <span className="flex-shrink-0 text-2xl font-bold text-store-gold/30 leading-none mt-0.5">
                      {n}
                    </span>
                    <div>
                      <p className="mb-1 text-sm font-semibold text-store-text">{title}</p>
                      <p className="text-xs text-store-text-muted leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who can partner */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-store-text">
                Kim hamkorlik qila oladi?
              </h2>
              <ul className="space-y-2 text-sm text-store-text-muted list-disc pl-4">
                <li>Rasmiy parfyumeriya distribyutorlari va importyorlari</li>
                <li>Mahalliy atir va kosmetika ishlab chiqaruvchilari</li>
                <li>Niche va mualliflik brendlari</li>
                <li>Body care va xona aromalari yetkazuvchilari</li>
                <li>Ulgurji sotuvchilar va omborxonalar</li>
              </ul>
              <p className="mt-3 text-xs text-store-text-dim">
                Yo'nalish bo'yicha savol bo'lsa — shunchaki qo'ng'iroq qiling, birgalikda
                imkoniyatlarni ko'rib chiqamiz.
              </p>
            </div>

            {/* Pricing note */}
            <div className="rounded-lg border border-store-border bg-store-card px-5 py-4">
              <p className="mb-1 text-sm font-semibold text-store-text">Narx va shartlar</p>
              <p className="text-sm text-store-text-muted leading-relaxed">
                Hamkorlik shartlari har bir kompaniya bilan alohida muhokama qilinadi. Narxlar
                va komissiya foizlari assortiment hajmi, tovar kategoriyasi va hamkorlik
                formatiga qarab belgilanadi.{" "}
                <span className="font-medium text-store-text">
                  Biz bilan bog'laning — bepul konsultatsiya beramiz.
                </span>
              </p>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-lg border border-store-border bg-store-card p-4">
              <p className="mb-1 text-sm font-semibold text-store-text">Hamkorlik bo'limi</p>
              <p className="mb-3 text-xs text-store-text-muted">
                Savollar yoki takliflar uchun to'g'ridan-to'g'ri biz bilan bog'laning:
              </p>
              <a
                href="tel:+998712345678"
                className="block w-full rounded-lg bg-store-gold py-2 text-center text-sm font-semibold text-white hover:bg-store-gold-dark transition-colors"
              >
                +998 71 234-56-78
              </a>
              <a
                href="mailto:partners@zahabi.uz"
                className="mt-2 block w-full rounded-lg border border-store-border py-2 text-center text-sm text-store-text hover:border-store-gold transition-colors"
              >
                partners@zahabi.uz
              </a>
            </div>

            <div className="rounded-lg border border-store-border bg-store-card p-4 text-xs text-store-text-muted space-y-1.5">
              <p className="font-medium text-store-text text-sm">Ish vaqti</p>
              <div className="space-y-1 mt-2">
                {[
                  ["Dush – Juma", "9:00 – 20:00"],
                  ["Shanba", "10:00 – 17:00"],
                  ["Yakshanba", "Dam olish"],
                ].map(([day, time]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span>{day}</span>
                    <span className={time === "Dam olish" ? "text-store-text-dim" : "text-store-text"}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-store-border bg-store-card p-4 text-xs text-store-text-muted space-y-1.5">
              <p className="font-medium text-store-text text-sm">Foydali havolalar</p>
              <Link to={ROUTES.ABOUT} className="block hover:text-store-gold transition-colors">
                Biz haqimizda →
              </Link>
              <Link to={ROUTES.CONTACTS} className="block hover:text-store-gold transition-colors">
                Kontaktlar →
              </Link>
              <Link to={ROUTES.FAQ} className="block hover:text-store-gold transition-colors">
                FAQ →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
