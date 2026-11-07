import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";

export function ContactsPage() {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Helmet>
        <title>Kontaktlar — Zahabi Parfüm</title>
        <meta name="description" content="Zahabi.uz bilan bog'lanish: telefon, elektron pochta, manzil." />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-6 py-6">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Kontaktlar</span>
        </nav>

        <h1 className="mb-6 text-2xl font-bold text-store-text">Kontaktlar</h1>

        {/* Top contacts row */}
        <div className="mb-8 grid grid-cols-1 gap-px border border-store-border rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Asosiy telefon",
              value: "+998 71 234-56-78",
              sub: "9:00 – 20:00, Dush – Juma",
              href: "tel:+998712345678",
            },
            {
              label: "Kafolat bo'limi",
              value: "+998 71 234-56-79",
              sub: "9:00 – 18:00, Dush – Juma",
              href: "tel:+998712345679",
            },
            {
              label: "Elektron pochta",
              value: "info@zahabi.uz",
              sub: "Javob 1–2 soat ichida",
              href: "mailto:info@zahabi.uz",
            },
            {
              label: "Manzil",
              value: "Yunusobod, Amir Temur, 1",
              sub: "Shanba 10:00–17:00",
              href: null,
            },
          ].map(({ label, value, sub, href }) => (
            <div key={label} className="bg-store-card px-4 py-4">
              <p className="mb-1.5 text-xs text-store-text-muted">{label}</p>
              {href ? (
                <a href={href} className="block text-sm font-semibold text-store-text hover:text-store-gold transition-colors">
                  {value}
                </a>
              ) : (
                <p className="text-sm font-semibold text-store-text">{value}</p>
              )}
              <p className="mt-0.5 text-xs text-store-text-dim">{sub}</p>
            </div>
          ))}
        </div>

        {/* Main: form + sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">

          {/* Form */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-store-text">Murojaat shakli</h2>

            {sent ? (
              <div className="rounded-lg border border-store-border bg-store-card px-6 py-10 text-center">
                <p className="mb-1 text-sm font-semibold text-store-text">Murojaatingiz qabul qilindi</p>
                <p className="mb-4 text-sm text-store-text-muted">Tez orada siz bilan bog'lanamiz.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", phone: "", subject: "", message: "" }); }}
                  className="text-sm text-store-gold hover:underline"
                >
                  Yangi murojaat
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-lg border border-store-border bg-store-card p-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-store-text-muted">Ismingiz *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ismingiz"
                      className="w-full rounded-lg border border-store-border bg-store-input px-3 py-2 text-sm text-store-text placeholder:text-store-text-dim focus:border-store-gold focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-store-text-muted">Telefon *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+998 99 000-00-00"
                      className="w-full rounded-lg border border-store-border bg-store-input px-3 py-2 text-sm text-store-text placeholder:text-store-text-dim focus:border-store-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-store-text-muted">Mavzu</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-store-border bg-store-input px-3 py-2 text-sm text-store-text focus:border-store-gold focus:outline-none transition-colors"
                  >
                    <option value="">Tanlang</option>
                    <option value="order">Buyurtma haqida</option>
                    <option value="delivery">Yetkazib berish</option>
                    <option value="warranty">Qaytarish va originallik</option>
                    <option value="return">Qaytarish</option>
                    <option value="other">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-store-text-muted">Xabar *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Savolingizni yozing..."
                    className="w-full resize-none rounded-lg border border-store-border bg-store-input px-3 py-2 text-sm text-store-text placeholder:text-store-text-dim focus:border-store-gold focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-store-text-dim leading-snug">
                    Formani yuborish orqali shaxsiy ma'lumotlarni qayta ishlashga rozilik bildirasiz.
                  </p>
                  <button
                    type="submit"
                    className="flex-shrink-0 rounded-lg bg-store-gold px-6 py-2 text-sm font-semibold text-white hover:bg-store-gold-dark transition-colors"
                  >
                    Yuborish
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <aside className="rounded-lg border border-store-border bg-store-card divide-y divide-store-border lg:sticky lg:top-20 lg:self-start">
            <div className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-store-text-muted">Ijtimoiy tarmoqlar</p>
              <div className="space-y-2">
                {[
                  { label: "Telegram", handle: "@zahabi_uz", href: "https://t.me/zahabi_uz" },
                  { label: "Instagram", handle: "@zahabi.uz", href: "https://instagram.com/zahabi.uz" },
                  { label: "YouTube", handle: "@zahabi_uz", href: "https://youtube.com/@zahabi_uz" },
                ].map(({ label, handle, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm hover:text-store-gold transition-colors">
                    <span className="text-store-text">{label}</span>
                    <span className="text-store-text-muted">{handle}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-store-text-muted">Ish vaqti</p>
              <div className="space-y-1.5 text-sm">
                {[
                  ["Dush – Juma", "9:00 – 20:00"],
                  ["Shanba", "10:00 – 17:00"],
                  ["Yakshanba", "Dam olish"],
                ].map(([day, time]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-store-text-muted">{day}</span>
                    <span className={time === "Dam olish" ? "text-store-text-dim" : "text-store-text"}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-store-text-muted">Foydali havolalar</p>
              <div className="space-y-2 text-sm">
                <Link to={ROUTES.FAQ} className="block text-store-text-muted hover:text-store-gold transition-colors">FAQ →</Link>
                <Link to={ROUTES.DELIVERY} className="block text-store-text-muted hover:text-store-gold transition-colors">Yetkazib berish →</Link>
                <Link to={ROUTES.WARRANTY} className="block text-store-text-muted hover:text-store-gold transition-colors">Kafolat va qaytarish →</Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}
