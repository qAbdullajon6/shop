/**
 * Navigation model.
 *
 * Two distinct lists, deliberately kept apart:
 *
 *   PRIMARY_NAV  — the six top-level destinations in the desktop header.
 *   CATALOG_NAV  — the seven shopping categories, which are NOT in the header
 *                  bar itself. They live behind "Kataloglar": a mega menu on
 *                  desktop, the bottom sheet on mobile.
 *
 * CATALOG_NAV is the single source of truth for both of those surfaces, so a
 * label or route can never drift between them.
 *
 * `href` values are the pre-existing, working product-filter URLs and must not
 * be changed without updating ProductsPage's query parsing.
 */

import type { MessageKey } from "@/i18n";
import { ROUTES } from "./routes";

/* ── Shopping categories (behind "Kataloglar") ───────────────────────────── */

export interface CatalogNavItem {
  /** Stable key for React lists and active-state matching. */
  id: string;
  /** i18n key — never render a hardcoded label. */
  labelKey: MessageKey;
  /** Existing, working product-filter route. */
  href: string;
  /**
   * Backend category slug, used to pull a real thumbnail for the mega menu and
   * the bottom sheet. `null` for filter-only entries (Aksiyalar) that map to no
   * single category — those fall back to a lettered tile.
   */
  categorySlug: string | null;
}

export const CATALOG_NAV: readonly CatalogNavItem[] = [
  {
    id: "women",
    labelKey: "nav.women",
    href: `${ROUTES.PRODUCTS}?category_slug=ayollar-atiri`,
    categorySlug: "ayollar-atiri",
  },
  {
    id: "men",
    labelKey: "nav.men",
    href: `${ROUTES.PRODUCTS}?category_slug=erkaklar-atiri`,
    categorySlug: "erkaklar-atiri",
  },
  {
    id: "niche",
    labelKey: "nav.niche",
    href: `${ROUTES.PRODUCTS}?category_slug=niche-atir`,
    categorySlug: "niche-atir",
  },
  {
    id: "body",
    labelKey: "nav.body",
    href: `${ROUTES.PRODUCTS}?category_slug=body-mist`,
    categorySlug: "body-mist",
  },
  {
    id: "home-aroma",
    labelKey: "nav.homeAroma",
    href: `${ROUTES.PRODUCTS}?category_slug=xona-aromalari`,
    categorySlug: "xona-aromalari",
  },
  {
    id: "sale",
    labelKey: "nav.sale",
    href: `${ROUTES.PRODUCTS}?on_sale=true`,
    categorySlug: null,
  },
  {
    id: "sets",
    labelKey: "nav.sets",
    href: `${ROUTES.PRODUCTS}?category_slug=gift-box`,
    categorySlug: "gift-box",
  },
] as const;

/* ── Top-level header destinations ───────────────────────────────────────── */

/**
 * "Yangiliklar" has no dedicated news page in this build, so it points at the
 * newest-first product listing — the same URL the "Yangi kolleksiya" shelf
 * links to. That keeps the item real instead of routing to a 404.
 */
export const NEW_ARRIVALS_HREF = `${ROUTES.PRODUCTS}?sort_by=created_at&sort_order=desc`;

export interface PrimaryNavItem {
  id: string;
  labelKey: MessageKey;
  href: string;
  /** Hovering opens the catalogue mega menu; clicking still follows `href`. */
  hasMegaMenu?: boolean;
}

export const PRIMARY_NAV: readonly PrimaryNavItem[] = [
  { id: "home",     labelKey: "nav.home",     href: ROUTES.HOME },
  { id: "catalog",  labelKey: "nav.catalog",  href: ROUTES.PRODUCTS, hasMegaMenu: true },
  { id: "about",    labelKey: "nav.about",    href: ROUTES.ABOUT },
  { id: "delivery", labelKey: "nav.delivery", href: ROUTES.DELIVERY },
  { id: "sale",     labelKey: "nav.sale",     href: `${ROUTES.PRODUCTS}?on_sale=true` },
  { id: "news",     labelKey: "nav.news",     href: NEW_ARRIVALS_HREF },
] as const;
