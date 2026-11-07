import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, X, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { usePhoneAuthStore } from "@/store/phoneAuthStore";
import { useThemeStore } from "@/store/themeStore";
import { useCategories } from "@/hooks/useCategories";
import { PRIMARY_NAV, ROUTES } from "@/constants";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Grace period (ms) before closing the mega menu, so a diagonal cursor path
 *  from the trigger to the panel does not dismiss it mid-move. */
const MEGA_MENU_CLOSE_DELAY = 120;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-store-gold px-1 text-[9px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu?: () => void } = {}) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const t = useT();

  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const closeTimer = useRef<number | null>(null);

  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = usePhoneAuthStore((s) => s.open);
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const { categories } = useCategories();

  /* Close the mega menu whenever the route changes — otherwise it stays pinned
     open over the new page after a click. */
  useEffect(() => {
    setCatalogMenuOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  /* Several nav links share the `/products` path and differ only by query
     string, so active state compares the full pathname + search. */
  const isActive = (href: string) => `${pathname}${search}` === href;

  const scheduleClose = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setCatalogMenuOpen(false), MEGA_MENU_CLOSE_DELAY);
  };

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleMenuClick = () => {
    if (onOpenMenu) onOpenMenu();
    else setDrawerOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40">
        <nav className="border-b border-store-border bg-store-nav/90 backdrop-blur-md">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 xl:px-10">

            {/* ══ Mobile / tablet header (< xl) ══════════════════ */}
            <div className="flex h-[60px] items-center gap-2 xl:hidden">
              <button
                type="button"
                onClick={handleMenuClick}
                aria-label={t("header.menu")}
                className="-ml-2 flex h-10 w-10 flex-shrink-0 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
              >
                <Menu size={21} />
              </button>

              <Link
                to={ROUTES.HOME}
                className="flex flex-1 select-none justify-center"
                aria-label="Zahabi Parfüm"
              >
                <img src="/logo.png" alt="Zahabi Parfüm" className="h-9 w-auto object-contain" />
              </Link>

              <div className="flex flex-shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label={t("header.search")}
                  aria-expanded={searchOpen}
                  className="flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  {searchOpen ? <X size={19} /> : <Search size={19} />}
                </button>

                <Link
                  to={ROUTES.WISHLIST}
                  aria-label={t("header.wishlist")}
                  className="relative flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  <Heart size={19} />
                  <CountBadge count={wishlistCount} />
                </Link>

                <Link
                  to={ROUTES.CART}
                  aria-label={t("header.cart")}
                  className="relative -mr-2 flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  <ShoppingBag size={19} />
                  <CountBadge count={itemCount} />
                </Link>
              </div>
            </div>

            {/* ══ Desktop header (xl+, 1280px and above) ═════════ */}
            <div className="hidden h-[76px] items-center gap-5 xl:flex 2xl:gap-6">
              <Link to={ROUTES.HOME} className="flex-shrink-0 select-none" aria-label="Zahabi Parfüm">
                <img src="/logo.png" alt="Zahabi Parfüm" className="h-12 w-auto object-contain 2xl:h-14" />
              </Link>

              {/* Primary destinations. Shopping categories are NOT here —
                  they live behind "Kataloglar". */}
              <div
                className="flex flex-1 items-center justify-center gap-6 2xl:gap-9"
                onMouseLeave={scheduleClose}
              >
                {PRIMARY_NAV.map((item) => {
                  const expanded = Boolean(item.hasMegaMenu) && catalogMenuOpen;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onMouseEnter={() => {
                        cancelClose();
                        setCatalogMenuOpen(Boolean(item.hasMegaMenu));
                      }}
                      onFocus={() => setCatalogMenuOpen(Boolean(item.hasMegaMenu))}
                      aria-expanded={item.hasMegaMenu ? expanded : undefined}
                      aria-haspopup={item.hasMegaMenu ? "menu" : undefined}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap text-[13.5px] transition-colors 2xl:text-[14px]",
                        isActive(item.href) || expanded
                          ? "font-medium text-store-gold"
                          : "text-store-text-muted hover:text-store-text"
                      )}
                    >
                      {t(item.labelKey)}
                      {item.hasMegaMenu && (
                        <ChevronDown
                          size={13}
                          className={cn(
                            "transition-transform duration-200",
                            expanded && "rotate-180"
                          )}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label={t("header.search")}
                  aria-expanded={searchOpen}
                  className="flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  {searchOpen ? <X size={19} /> : <Search size={19} />}
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? t("header.lightMode") : t("header.darkMode")}
                  className="flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  {isDark ? <Sun size={17} className="text-store-gold" /> : <Moon size={17} />}
                </button>

                <LanguageSwitcher />

                {isAuthenticated ? (
                  <Link
                    to={ROUTES.PROFILE}
                    aria-label={t("header.account")}
                    className="flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                  >
                    <User size={19} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    aria-label={t("header.login")}
                    className="flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                  >
                    <User size={19} />
                  </button>
                )}

                <Link
                  to={ROUTES.WISHLIST}
                  aria-label={t("header.wishlist")}
                  className="relative flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  <Heart size={19} />
                  <CountBadge count={wishlistCount} />
                </Link>

                <Link
                  to={ROUTES.CART}
                  aria-label={t("header.cart")}
                  className="relative flex h-10 w-10 items-center justify-center text-store-text-muted transition-colors hover:text-store-text"
                >
                  <ShoppingBag size={19} />
                  <CountBadge count={itemCount} />
                </Link>
              </div>
            </div>
          </div>

          {/* ══ Search overlay ═══════════════════════════════════ */}
          {searchOpen && (
            <div className="border-t border-store-border bg-store-nav">
              <div className="mx-auto max-w-content px-4 py-3 sm:px-6 lg:px-10">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-store-text-dim"
                    />
                    <input
                      autoFocus
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("header.searchPlaceholder")}
                      className="w-full rounded-md border border-store-border bg-store-input py-2.5 pl-9 pr-4 text-sm text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-store-gold px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    {t("header.search")}
                  </button>
                </form>
              </div>
            </div>
          )}
        </nav>

        {/* ══ "Kataloglar" mega menu ═════════════════════════════ */}
        {catalogMenuOpen && (
          <div
            className="absolute inset-x-0 top-full hidden xl:block"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 xl:px-10">
              <CategoryMegaMenu
                categories={categories}
                onNavigate={() => setCatalogMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </header>

      {/* Drawer is only self-managed when the layout does not own it. */}
      {!onOpenMenu && (
        <MobileMenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}
