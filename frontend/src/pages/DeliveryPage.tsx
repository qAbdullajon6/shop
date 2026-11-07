import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";

export function DeliveryPage() {
  return (
    <>
      <Helmet>
        <title>Yetkazib berish va to'lov — Zahabi Parfüm</title>
        <meta name="description" content="Zahabi.uz yetkazib berish shartlari, narxlar va to'lov usullari." />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-6 py-6">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Yetkazib berish va to'lov</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-8">

            <div>
              <h1 className="mb-4 text-2xl font-bold text-store-text">Yetkazib berish va to'lov</h1>
              <p className="text-sm text-store-text-muted leading-relaxed">
                Biz Toshkent va O'zbekistonning barcha viloyatlariga yetkazib beramiz.
                Buyurtmangiz tasdiqlangandan so'ng kuryer siz bilan bog'lanadi va qulay vaqtni kelishib oladi.
              </p>
            </div>

            {/* Delivery */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-store-text">Yetkazib berish shartlari</h2>
              <div className="overflow-hidden rounded-lg border border-store-border text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-store-card border-b border-store-border">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-store-text-muted">Hudud</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-store-text-muted">Narx</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-store-text-muted">Muddat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-store-border">
                    {[
                      ["Toshkent shahri", "15 000 so'm", "1–3 soat"],
                      ["Toshkent viloyati", "25 000 so'm", "1 ish kuni"],
                      ["Samarqand, Buxoro", "45 000 so'm", "2–3 ish kuni"],
                      ["Farg'ona vodiysi", "40 000 so'm", "2 ish kuni"],
                      ["Qoraqalpog'iston", "70 000 so'm", "3–5 ish kuni"],
                      ["Boshqa viloyatlar", "35 000–60 000 so'm", "2–4 ish kuni"],
                    ].map(([zone, price, time]) => (
                      <tr key={zone} className="hover:bg-store-card/50 transition-colors">
                        <td className="px-4 py-2.5 text-store-text">{zone}</td>
                        <td className="px-4 py-2.5 text-store-text">{price}</td>
                        <td className="px-4 py-2.5 text-store-text-muted">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-store-text-muted">
                Toshkent bo'ylab 500 000 so'mdan yuqori buyurtmalarda yetkazib berish bepul.
              </p>
            </div>

            {/* How it works */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-store-text">Buyurtma berish tartibi</h2>
              <ol className="space-y-3 text-sm text-store-text-muted">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-store-gold">1.</span>
                  <span>Saytda mahsulotni tanlang va savatga qo'shing. Buyurtmani rasmiylashtiring yoki +998 71 234-56-78 raqamiga qo'ng'iroq qiling.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-store-gold">2.</span>
                  <span>Operatorimiz 15–30 daqiqa ichida siz bilan bog'lanadi, buyurtmani tasdiqlaydi va yetkazib berish vaqtini belgilaydi.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-store-gold">3.</span>
                  <span>Kuryer kelishdan 30 daqiqa oldin qo'ng'iroq qiladi. Mahsulotni qabul qilganda tekshirib ko'rishingiz mumkin.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-store-gold">4.</span>
                  <span>Qabul qilingan mahsulotni ko'rib chiqqach to'lovni amalga oshirasiz.</span>
                </li>
              </ol>
            </div>

            {/* Payment */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-store-text">To'lov usullari</h2>
              <ul className="space-y-2 text-sm text-store-text-muted">
                <li><span className="font-medium text-store-text">Karta orqali onlayn</span> — Visa, Mastercard, Uzcard, Humo. To'lov buyurtma berilganda yoki yetkazib berishdan oldin.</li>
                <li><span className="font-medium text-store-text">Click / Payme</span> — mobil to'lov tizimlari orqali.</li>
                <li><span className="font-medium text-store-text">Naqd pul</span> — kuryer kelganida yoki do'konimizda to'lash.</li>
                <li><span className="font-medium text-store-text">Muddatli to'lov</span> — ba'zi mahsulotlar uchun 3, 6 yoki 12 oylik to'lov rejasi mavjud.</li>
                <li><span className="font-medium text-store-text">Bank o'tkazmasi</span> — yuridik shaxslar uchun hisob-faktura asosida.</li>
              </ul>
            </div>

            {/* Notes */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-store-text">Muhim eslatmalar</h2>
              <ul className="space-y-2 text-sm text-store-text-muted list-disc pl-4">
                <li>Mahsulotni kuryer oldida tekshiring. Keyinchalik tashqi shikast bo'yicha da'vo qabul qilinmaydi.</li>
                <li>Agar qabul qilish vaqti qulay bo'lmasa, kuryerga qo'ng'iroq qilib vaqtni o'zgartirish mumkin.</li>
                <li>Og'ir va yirik tovarlar uchun yuqori qavatga ko'tarish alohida kelishiladi.</li>
                <li>Dam olish kunlari yetkazib berish ish kuni hisobiga kirmaydi.</li>
              </ul>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-lg border border-store-border bg-store-card p-4">
              <p className="mb-2 text-sm font-semibold text-store-text">Buyurtma berish</p>
              <p className="mb-3 text-xs text-store-text-muted leading-relaxed">
                Qo'ng'iroq qiling, operatorimiz yetkazib berish tafsilotlarini tushuntiradi.
              </p>
              <a
                href="tel:+998712345678"
                className="block w-full rounded-lg bg-store-gold py-2 text-center text-sm font-semibold text-white hover:bg-store-gold-dark transition-colors"
              >
                +998 71 234-56-78
              </a>
            </div>

            <div className="rounded-lg border border-store-border bg-store-card p-4 text-xs text-store-text-muted space-y-1.5">
              <p className="font-medium text-store-text text-sm">Ish vaqti</p>
              <p>Dushanba – Juma: 9:00 – 20:00</p>
              <p>Shanba: 10:00 – 17:00</p>
              <p>Yakshanba: dam olish</p>
            </div>

            <div className="rounded-lg border border-store-border bg-store-card p-4">
              <p className="mb-2 text-sm font-semibold text-store-text">O'z-o'zidan olish</p>
              <p className="text-xs text-store-text-muted leading-relaxed">
                Toshkentdagi do'konimizdan buyurtmani bepul olib ketishingiz mumkin.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
