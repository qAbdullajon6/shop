import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, ChevronDown } from "lucide-react";
import { ROUTES } from "@/constants";

interface FaqItem { q: string; a: string; }

const FAQ: Record<string, FaqItem[]> = {
  "Buyurtma": [
    {
      q: "Buyurtma berishning eng qulay usuli qaysi?",
      a: "Saytda mahsulotni savatga qo'shib buyurtmani rasmiylashtirishingiz mumkin. Shuningdek, +998 71 234-56-78 raqamiga qo'ng'iroq qilib ham buyurtma berishingiz mumkin — operator barcha tafsilotlarni yo'naltirib beradi.",
    },
    {
      q: "Buyurtmam holatini qanday kuzatish mumkin?",
      a: "Shaxsiy kabinetingizga kirib \"Mening buyurtmalarim\" bo'limida buyurtmangiz holatini kuzatishingiz mumkin. Har bir yangilanish haqida SMS xabar ham keladi.",
    },
    {
      q: "Buyurtmani bekor qilish mumkinmi?",
      a: "Ha. Buyurtma kuryer jo'natilguncha bekor qilish mumkin — shaxsiy kabinet orqali yoki telefon orqali. Kuryer yo'lga chiqqandan so'ng bekor qilib bo'lmaydi.",
    },
    {
      q: "Mahsulot stokda bo'lmasa nima qilish kerak?",
      a: "Mahsulot sahifasida \"Narx tushganda xabar ber\" tugmasini bosib, elektron pochtangizni qoldiring. Mahsulot paydo bo'lganda avtomatik xabar olib, birinchilar qatorida buyurtma berasiz.",
    },
  ],
  "To'lov": [
    {
      q: "Qanday to'lov usullari mavjud?",
      a: "Onlayn karta (Visa, Mastercard, Uzcard, Humo), Click, Payme, naqd pul (kuryer yoki do'konda), bank o'tkazmasi (yuridik shaxslar uchun).",
    },
    {
      q: "Bo'lib to'lash imkoniyati bormi?",
      a: "Ha, tanlangan mahsulotlar uchun 3, 6 yoki 12 oylik muddatli to'lov mavjud. Bu imkoniyat mahsulot sahifasida ko'rsatiladi.",
    },
    {
      q: "Onlayn to'lov xavfsizmi?",
      a: "Ha. Barcha to'lovlar SSL shifrlash va 3D Secure orqali himoyalangan. Karta ma'lumotlaringiz bizning serverlarimizda saqlanmaydi.",
    },
  ],
  "Yetkazib berish": [
    {
      q: "Toshkentga qancha vaqtda yetkazib berasizlar?",
      a: "Odatda 1–3 soat ichida. Tushlik vaqti va kech kiriladigan buyurtmalar ertasi kuni yetkazilishi mumkin. Aniq vaqt operatorimiz tasdiqlash vaqtida aytiladi.",
    },
    {
      q: "Bepul yetkazib berish bormi?",
      a: "Ha. Toshkent bo'ylab 500 000 so'mdan yuqori buyurtmalarda yetkazib berish bepul.",
    },
    {
      q: "Kuryer belgilangan vaqtda kelmasa nima qilaman?",
      a: "Kuryer raqamiga bevosita qo'ng'iroq qiling — kuryer yo'lda bo'lganda siz bilan bog'langan raqamdan javob beradi. Yoki qo'llab-quvvatlash xizmatiga murojaat qiling.",
    },
  ],
  "Qaytarish va originallik": [
    {
      q: "Mahsulotni qaytarish mumkinmi?",
      a: "Ha, mahsulot yetkazilgandan so'ng 14 kun ichida. Atir ochilmagan, ishlatilmagan va original qadoqda bo'lishi shart. Ochilgan parfyum sanitariya sabablariga ko'ra qaytarilmaydi.",
    },
    {
      q: "Atirlar haqiqiy (original) ekaniga qanday ishonch hosil qilaman?",
      a: "Barcha mahsulotlarimiz rasmiy distribyutorlar yoki brendlarning o'zidan keltiriladi. Har bir atir 100% original — soxta yoki nusxa mahsulot sotmaymiz. Batafsil ma'lumot uchun qadoqdagi batch-kodni brend saytida tekshirishingiz mumkin.",
    },
    {
      q: "Mahsulot buzilgan yoki noto'g'ri yetkazilsa nima qilaman?",
      a: "Buyurtmani ochganingizda muammo aniqlansa, 24 soat ichida biz bilan bog'laning. Kuryer mahsulotni bepul almashtiradi yoki to'liq pulini qaytaramiz.",
    },
  ],
  "Hisob va kirish": [
    {
      q: "Ro'yxatdan o'tmasdan buyurtma bera olamanmi?",
      a: "Buyurtma berish uchun telefon raqamingizni tasdiqlash kifoya — alohida parol yaratish shart emas. Tasdiqlangan raqam avtomatik hisob sifatida saqlanadi va buyurtmalar tarixini ko'rish imkonini beradi.",
    },
    {
      q: "Tizimga qanday kiraman?",
      a: "Telefon raqamingizni kiriting — SMS orqali bir martalik kod (OTP) yuboriladi. Kodni tasdiqlab, hisobingizga kirasiz. Parol eslab qolish shart emas.",
    },
  ],
};

const CATEGORIES = Object.keys(FAQ);

function Item({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-store-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-sm text-store-text leading-snug">{item.q}</span>
        <ChevronDown
          size={15}
          className={`mt-0.5 flex-shrink-0 text-store-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-3.5 text-sm text-store-text-muted leading-relaxed">
          {item.a}
        </p>
      )}
    </div>
  );
}

export function FaqPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Ko'p so'raladigan savollar — Zahabi Parfüm</title>
        <meta name="description" content="Zahabi.uz FAQ: buyurtma, to'lov, yetkazib berish va kafolat bo'yicha savol-javoblar." />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-6 py-6">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <span className="text-store-text">FAQ</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">

          {/* Sticky category nav */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-lg border border-store-border">
              <button
                onClick={() => setActive(null)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors border-b border-store-border ${
                  active === null
                    ? "bg-store-gold/10 text-store-gold font-medium"
                    : "bg-store-card text-store-text-muted hover:bg-store-bg hover:text-store-text"
                }`}
              >
                Barchasi
                {active === null && <ChevronRight size={13} />}
              </button>
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    i < CATEGORIES.length - 1 ? "border-b border-store-border" : ""
                  } ${
                    active === cat
                      ? "bg-store-gold/10 text-store-gold font-medium"
                      : "bg-store-card text-store-text-muted hover:bg-store-bg hover:text-store-text"
                  }`}
                >
                  {cat}
                  {active === cat && <ChevronRight size={13} />}
                </button>
              ))}
            </div>
          </aside>

          {/* Questions */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-store-text">
              {active ?? "Ko'p so'raladigan savollar"}
            </h1>

            {Object.entries(active ? { [active]: FAQ[active] } : FAQ).map(([cat, items]) => (
              <div key={cat}>
                {!active && (
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-store-text-muted">{cat}</h2>
                )}
                <div className="rounded-lg border border-store-border bg-store-card px-4">
                  {items.map((item) => (
                    <Item key={item.q} item={item} />
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-store-border pt-4 text-sm text-store-text-muted">
              Javob topa olmadingizmi?{" "}
              <Link to="/contacts" className="text-store-gold hover:underline">Murojaat qiling</Link>
              {" "}yoki{" "}
              <a href="tel:+998712345678" className="text-store-gold hover:underline">+998 71 234-56-78</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
