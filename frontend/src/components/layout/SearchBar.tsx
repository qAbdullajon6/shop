import { useState, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, User, Heart, ShoppingCart } from "lucide-react";
import { CatalogMegaMenu } from "@/components/features/home/CatalogMegaMenu";
import { useCartStore } from "@/store/cartStore";
import { usePhoneAuthStore } from "@/store/phoneAuthStore";
import { ROUTES } from "@/constants";

const USER_ACTIONS = [
  { icon: User, label: "Kabinet", href: ROUTES.PROFILE },
  { icon: Heart, label: "Sevimlilar", href: "/wishlist" },
  { icon: ShoppingCart, label: "Savat", href: ROUTES.CART },
];

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const catalogButtonRef = useRef<HTMLButtonElement>(null);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openAuthModal = usePhoneAuthStore((s) => s.open);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section
      className="sticky top-14 bg-store-nav border-b border-store-border z-30"
      aria-label="Mahsulot qidirish"
    >
      <div className="mx-auto max-w-content px-4 py-3">
        <div className="flex items-center gap-3">

          {/* Catalog toggle */}
          <div className="flex-shrink-0">
            <button
              ref={catalogButtonRef}
              onClick={() => setCatalogOpen((v) => !v)}
              aria-expanded={catalogOpen}
              aria-label="Katalog"
              className={[
                "flex items-center gap-2.5 rounded px-5 py-2.5 text-sm font-semibold text-white transition-colors",
                catalogOpen ? "bg-store-red-hover" : "bg-store-red hover:bg-store-red-hover",
              ].join(" ")}
            >
              <Menu
                size={18}
                className={["transition-transform duration-200", catalogOpen ? "rotate-90" : "rotate-0"].join(" ")}
              />
              <span>Katalog</span>
            </button>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center" role="search">
            <label htmlFor="site-search" className="sr-only">Mahsulot qidirish</label>
            <div className="relative flex-1">
              <input
                id="site-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mahsulot nomi yoki ID bo'yicha qidirish..."
                autoComplete="off"
                className="w-full rounded-l bg-store-input py-2.5 pl-4 pr-12 text-sm text-store-text placeholder-store-text-dim outline-none focus:ring-1 focus:ring-store-red transition-all"
              />
              <button
                type="submit"
                aria-label="Qidirish"
                className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r bg-store-input px-4 text-store-text-muted hover:text-store-text transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* User actions */}
          <nav className="flex items-center gap-5 flex-shrink-0" aria-label="Foydalanuvchi">
            {USER_ACTIONS.map(({ icon: Icon, label, href }) => {
              const isCart = href === ROUTES.CART;
              const isKabinet = href === ROUTES.PROFILE;
              const cls = "flex flex-col items-center gap-0.5 text-store-text-muted hover:text-store-text transition-colors";

              const inner = (
                <>
                  <span className="relative">
                    <Icon size={22} />
                    {isCart && itemCount > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-store-red text-[10px] font-bold text-white leading-none">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] leading-none">{label}</span>
                </>
              );

              return isKabinet ? (
                <button key={label} onClick={openAuthModal} className={cls} aria-label={label}>
                  {inner}
                </button>
              ) : (
                <Link key={label} to={href} className={cls} aria-label={label}>
                  {inner}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <CatalogMegaMenu
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        toggleButtonRef={catalogButtonRef}
      />
    </section>
  );
}
