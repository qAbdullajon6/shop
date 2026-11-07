import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATALOG_NAV, imgUrl, ROUTES } from "@/constants";
import { useT } from "@/i18n";
import type { Category } from "@/types";

interface CategoryMegaMenuProps {
  /** Live category list, used only to resolve real thumbnails. */
  categories: Category[];
  onNavigate: () => void;
}

/**
 * The "Kataloglar" mega menu.
 *
 * Renders the seven shopping categories from `CATALOG_NAV` — the same list the
 * mobile bottom sheet uses — as a thumbnail grid, plus a panel linking to the
 * unfiltered catalogue.
 *
 * Thumbnails come from the backend category records; entries with no matching
 * category (Aksiyalar) fall back to a lettered tile rather than a broken image.
 */
export function CategoryMegaMenu({ categories, onNavigate }: CategoryMegaMenuProps) {
  const t = useT();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  return (
    <div
      className="animate-menu-in overflow-hidden rounded-b-2xl border border-t-0 border-store-border bg-store-card shadow-[0_24px_56px_-24px_rgba(0,0,0,0.30)]"
      role="menu"
      aria-label={t("nav.catalog")}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_280px]">

        {/* ── Category grid ──────────────────────────────────── */}
        <div className="px-8 py-7">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-store-text-dim">
            {t("megaMenu.categories")}
          </p>

          {/* All seven on one row — keeps the panel short so it reads as a menu
              rather than a page takeover. */}
          <ul className="grid grid-cols-7 gap-x-2">
            {CATALOG_NAV.map((item) => {
              const cat = item.categorySlug ? bySlug.get(item.categorySlug) : undefined;
              const image = cat
                ? imgUrl(cat.image_uz) ?? imgUrl(cat.image_ru) ?? imgUrl(cat.image_en)
                : null;
              const label = t(item.labelKey);

              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    role="menuitem"
                    className="group/link flex flex-col items-center gap-2 rounded-xl px-1 py-2.5 transition-colors hover:bg-store-surface"
                  >
                    <span className="flex aspect-square w-full max-w-[84px] items-center justify-center overflow-hidden rounded-lg bg-store-surface transition-colors group-hover/link:bg-store-bg">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          aria-hidden
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover/link:scale-105"
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                        />
                      ) : (
                        <span className="font-serif text-[22px] font-medium text-store-gold">
                          {label.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="line-clamp-2 text-center text-[11.5px] leading-tight text-store-text-muted transition-colors group-hover/link:text-store-text">
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Panel: whole catalogue ─────────────────────────── */}
        <Link
          to={ROUTES.PRODUCTS}
          onClick={onNavigate}
          role="menuitem"
          className="group/promo flex flex-col justify-end border-l border-store-border bg-store-surface p-7"
        >
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-store-gold">
            {t("megaMenu.featured")}
          </p>
          <p className="font-serif text-[24px] font-medium leading-tight text-store-text">
            {t("catalog.viewAll")}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-store-text-muted transition-colors group-hover/promo:text-store-gold">
            {t("home.viewAll")}
            <ArrowRight size={13} className="transition-transform duration-200 group-hover/promo:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
