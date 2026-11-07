import { Link } from "react-router-dom";
import { Phone, Mail, Clock, MapPin, Send, Instagram, Facebook, Music2 } from "lucide-react";
import { ROUTES } from "@/constants";

/* Havolalar backenddagi haqiqiy category_slug'larga bog'langan. */
const SHOP_LINKS = [
  { label: "Erkaklar uchun",  href: `${ROUTES.PRODUCTS}?category_slug=erkaklar-atiri` },
  { label: "Ayollar uchun",   href: `${ROUTES.PRODUCTS}?category_slug=ayollar-atiri` },
  { label: "Niche atirlar",   href: `${ROUTES.PRODUCTS}?category_slug=niche-atir` },
  { label: "Bestseller",      href: `${ROUTES.PRODUCTS}?is_bestseller=true` },
  { label: "Yangi kelganlar", href: `${ROUTES.PRODUCTS}?sort_by=created_at&sort_order=desc` },
  { label: "Body & Beauty",   href: `${ROUTES.PRODUCTS}?category_slug=body-mist` },
  { label: "Xona aromalari",  href: `${ROUTES.PRODUCTS}?category_slug=xona-aromalari` },
  { label: "Aksiyalar",       href: `${ROUTES.PRODUCTS}?on_sale=true` },
  { label: "Gift setlar",     href: `${ROUTES.PRODUCTS}?category_slug=gift-box` },
];

const INFO_LINKS = [
  { label: "Biz haqimizda",             href: ROUTES.ABOUT },
  { label: "Yetkazib berish va to'lov", href: ROUTES.DELIVERY },
  { label: "Qaytarish shartlari",       href: ROUTES.WARRANTY },
  { label: "FAQ",                       href: ROUTES.FAQ },
  { label: "Kontaktlar",                href: ROUTES.CONTACTS },
  { label: "Hamkorlik",                 href: ROUTES.PARTNERSHIP },
];

const CUSTOMER_LINKS = [
  { label: "Mening buyurtmalarim", href: ROUTES.PROFILE_TAB("orders") },
  { label: "Sevimlilarim",         href: ROUTES.WISHLIST },
  { label: "Profilim",             href: ROUTES.PROFILE },
  { label: "Savatcha",             href: ROUTES.CART },
];

const SOCIAL = [
  { label: "Telegram",  href: "https://t.me/zahabi_uz",           icon: Send },
  { label: "Instagram", href: "https://instagram.com/zahabi.uz",  icon: Instagram },
  { label: "Facebook",  href: "https://facebook.com/zahabi.uz",   icon: Facebook },
  { label: "TikTok",    href: "https://tiktok.com/@zahabi.uz",    icon: Music2 },
];

const PAYMENTS = ["Visa", "Mastercard", "Uzcard", "Humo"];

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-store-gold">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.href}
              className="text-[12.5px] text-store-text-muted transition-colors hover:text-store-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-store-bg">
      <div className="mx-auto max-w-content px-4 pb-6 pt-14 sm:px-6 lg:px-10">

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* Brend ustuni */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to={ROUTES.HOME} className="mb-4 inline-block select-none">
              <img src="/logo.png" alt="Zahabi Parfüm" className="h-12 w-auto object-contain" />
            </Link>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-store-text-muted">
              O'zbekistondagi premium parfyumeriya do'koni. Dunyoning eng yaxshi brendlarini siz uchun bir joyga jamladik.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-store-border text-store-text-muted transition-colors hover:border-store-gold hover:text-store-gold"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Do'kon"       links={SHOP_LINKS} />
          <LinkColumn title="Ma'lumot"     links={INFO_LINKS} />
          <LinkColumn title="Mijoz uchun"  links={CUSTOMER_LINKS} />

          {/* Aloqa */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-store-gold">
              Aloqa
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="flex-shrink-0 text-store-gold" />
                <a href="tel:+998712345678" className="text-[12.5px] text-store-text-muted transition-colors hover:text-store-gold">
                  +998 71 234-56-78
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="flex-shrink-0 text-store-gold" />
                <a href="tel:+998909876543" className="text-[12.5px] text-store-text-muted transition-colors hover:text-store-gold">
                  +998 90 987-65-43
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="flex-shrink-0 text-store-gold" />
                <a href="mailto:info@zahabiparfum.uz" className="text-[12.5px] text-store-gold transition-opacity hover:opacity-75">
                  info@zahabiparfum.uz
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={14} className="flex-shrink-0 text-store-gold" />
                <span className="text-[12.5px] text-store-text-muted">09:00 — 21:00</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="flex-shrink-0 text-store-gold" />
                <span className="text-[12.5px] text-store-text-muted">Toshkent, O'zbekiston</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pastki qator */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-store-border pt-6">
          <p className="text-[11.5px] text-store-text-dim">
            © 2018–{new Date().getFullYear()} Zahabi Parfüm. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-2.5">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="rounded border border-store-border bg-store-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-store-text-muted"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
