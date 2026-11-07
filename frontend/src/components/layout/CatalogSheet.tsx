import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import { CATALOG_NAV, imgUrl, ROUTES } from "@/constants";
import { useRootCategories } from "@/hooks/useCategories";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

interface CatalogSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Drag distance (px) past which releasing dismisses the sheet. */
const DISMISS_THRESHOLD = 90;

/**
 * Mobile catalogue bottom sheet.
 *
 * Opens from the "Kataloglar" tab in the bottom navigation instead of
 * navigating straight to a category. Lists the same seven hubs as the desktop
 * navbar (shared `CATALOG_NAV`), each linking to its existing product-filter
 * route, and closes on navigation.
 *
 * Native-feel details: swipe-down-to-dismiss, backdrop tap, Escape, background
 * scroll lock, and safe-area padding so the last row clears the home indicator.
 */
export function CatalogSheet({ open, onClose }: CatalogSheetProps) {
  const t = useT();
  const { categories } = useRootCategories();

  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  /* Escape to close. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Lock background scroll while the sheet is up. Restores the exact previous
     value rather than hardcoding "" so nested locks can't clobber each other. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Reset any residual drag offset when reopening. */
  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  if (!open) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    // Only track downward drags — upward stays pinned.
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    if (dragY > DISMISS_THRESHOLD) onClose();
    else setDragY(0);
    dragStartY.current = null;
  };

  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  return (
    <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label={t("catalog.title")}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("catalog.close")}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-[2px]"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="animate-sheet-in max-h-sheet absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-2xl border-t border-store-border bg-store-card shadow-[0_-8px_40px_rgba(0,0,0,0.24)]"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragStartY.current === null ? "transform 220ms cubic-bezier(0.32,0.72,0,1)" : undefined,
        }}
      >
        {/* Drag handle + header */}
        <div
          className="flex-shrink-0 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-center pb-1 pt-2.5">
            <span className="h-1 w-10 rounded-full bg-store-border" />
          </div>

          <div className="flex items-center justify-between px-5 pb-3 pt-1">
            <h2 className="font-serif text-[19px] font-medium text-store-text">
              {t("catalog.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("catalog.close")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-store-text-dim transition-colors hover:bg-store-surface hover:text-store-text"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category list */}
        <nav className="pb-safe-sheet min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
          <ul>
            {CATALOG_NAV.map((item) => {
              const cat = item.categorySlug ? bySlug.get(item.categorySlug) : undefined;
              const image = cat
                ? imgUrl(cat.image_uz) ?? imgUrl(cat.image_ru) ?? imgUrl(cat.image_en)
                : null;
              /* Use the hub's own label, not the backend category name: the
                 sheet must read identically to the desktop navbar
                 ("Ayollar uchun", not the raw category "Ayollar atiri"). */
              const label = t(item.labelKey);

              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 transition-colors active:bg-store-surface"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full",
                        image ? "bg-store-surface" : "bg-store-gold/10"
                      )}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          aria-hidden
                          loading="lazy"
                          className="h-full w-full object-contain p-2"
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                        />
                      ) : (
                        <span className="text-[13px] font-semibold text-store-gold">
                          {label.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-[14.5px] text-store-text">
                      {label}
                    </span>

                    <ChevronRight size={17} className="flex-shrink-0 text-store-text-dim" />
                  </Link>
                </li>
              );
            })}

            {/* Escape hatch to the unfiltered catalogue. */}
            <li className="mt-1 border-t border-store-border pt-1">
              <Link
                to={ROUTES.PRODUCTS}
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-3.5 transition-colors active:bg-store-surface"
              >
                <span className="text-[14px] font-medium text-store-gold">
                  {t("catalog.viewAll")}
                </span>
                <ChevronRight size={17} className="text-store-gold" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
