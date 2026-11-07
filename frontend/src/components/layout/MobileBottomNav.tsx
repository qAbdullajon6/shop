import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useT, type MessageKey } from "@/i18n";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  catalogOpen: boolean;
  onToggleCatalog: () => void;
}

interface NavEntry {
  id: string;
  labelKey: MessageKey;
  Icon: LucideIcon;
  href?: string;
}

/* Order matches the reference design and must stay stable — users build muscle
   memory for tab position. */
const ENTRIES: readonly NavEntry[] = [
  { id: "home",     labelKey: "bottomNav.home",     Icon: Home,         href: ROUTES.HOME },
  { id: "catalog",  labelKey: "bottomNav.catalog",  Icon: LayoutGrid },
  { id: "wishlist", labelKey: "bottomNav.wishlist", Icon: Heart,        href: ROUTES.WISHLIST },
  { id: "cart",     labelKey: "bottomNav.cart",     Icon: ShoppingBag,  href: ROUTES.CART },
  { id: "profile",  labelKey: "bottomNav.profile",  Icon: User,         href: ROUTES.PROFILE },
];

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-store-gold px-1 text-[9px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

/**
 * Fixed mobile/tablet bottom navigation.
 *
 * Hidden from `xl` (1280px) up, matching `--bottom-nav-h` in globals.css — the
 * layout reserves space using that same variable, so the bar never covers
 * content. Below 1280px the compact header has no category links, so this bar
 * plus the catalog sheet carry all primary navigation.
 *
 * "Kataloglar" is a button rather than a link: it opens the catalogue bottom
 * sheet instead of jumping to one arbitrary category.
 */
export function MobileBottomNav({ catalogOpen, onToggleCatalog }: MobileBottomNavProps) {
  const t = useT();
  const { pathname } = useLocation();

  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const isActive = (entry: NavEntry): boolean => {
    if (entry.id === "catalog") return catalogOpen || pathname.startsWith(ROUTES.PRODUCTS);
    if (entry.id === "home") return pathname === ROUTES.HOME;
    return entry.href ? pathname.startsWith(entry.href) : false;
  };

  const badgeFor = (id: string): number =>
    id === "cart" ? cartCount : id === "wishlist" ? wishlistCount : 0;

  return (
    <nav
      aria-label={t("catalog.title")}
      className="pb-safe-area fixed inset-x-0 bottom-0 z-50 border-t border-store-border bg-store-card/95 backdrop-blur-md xl:hidden"
    >
      <ul className="flex h-[3.875rem] items-stretch">
        {ENTRIES.map((entry) => {
          const active = isActive(entry);
          const { Icon } = entry;

          const inner = (
            <>
              <span className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.1 : 1.7}
                  className="transition-transform duration-200"
                />
                <Badge count={badgeFor(entry.id)} />
              </span>
              <span
                className={cn(
                  "text-[10px] leading-none transition-colors",
                  active ? "font-semibold" : "font-normal"
                )}
              >
                {t(entry.labelKey)}
              </span>
            </>
          );

          const className = cn(
            "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors duration-200",
            active ? "text-store-gold" : "text-store-text-dim"
          );

          return (
            <li key={entry.id} className="flex-1">
              {entry.href ? (
                <Link to={entry.href} className={className} aria-current={active ? "page" : undefined}>
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onToggleCatalog}
                  aria-expanded={catalogOpen}
                  className={className}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
