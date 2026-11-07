import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Moon, Sun, X } from "lucide-react";
import { NEW_ARRIVALS_HREF, ROUTES } from "@/constants";
import { useThemeStore } from "@/store/themeStore";
import { useT, type MessageKey } from "@/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Secondary navigation for mobile/tablet.
 *
 * Deliberately does NOT repeat the seven catalogue hubs — those live in the
 * bottom sheet behind the "Kataloglar" tab.
 *
 * `PRIMARY_LINKS` mirrors the desktop header's non-catalogue destinations,
 * which the five-tab bottom bar has no room for. `SECONDARY_LINKS` carries the
 * remaining informational pages.
 */
const PRIMARY_LINKS: readonly { labelKey: MessageKey; href: string }[] = [
  { labelKey: "nav.about",    href: ROUTES.ABOUT },
  { labelKey: "nav.delivery", href: ROUTES.DELIVERY },
  { labelKey: "nav.sale",     href: `${ROUTES.PRODUCTS}?on_sale=true` },
  { labelKey: "nav.news",     href: NEW_ARRIVALS_HREF },
];

const SECONDARY_LINKS: readonly { labelKey: MessageKey; href: string }[] = [
  { labelKey: "menu.warranty",    href: ROUTES.WARRANTY },
  { labelKey: "menu.faq",         href: ROUTES.FAQ },
  { labelKey: "menu.contacts",    href: ROUTES.CONTACTS },
  { labelKey: "menu.partnership", href: ROUTES.PARTNERSHIP },
];

export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  const t = useT();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label={t("menu.title")}>
      <button
        type="button"
        aria-label={t("catalog.close")}
        onClick={onClose}
        className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-[2px]"
      />

      <div className="animate-drawer-in absolute inset-y-0 left-0 flex w-[84%] max-w-[320px] flex-col border-r border-store-border bg-store-card shadow-2xl">

        <div className="flex flex-shrink-0 items-center justify-between border-b border-store-border px-5 py-4">
          <img src="/logo.png" alt="Zahabi Parfüm" className="h-9 w-auto object-contain" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("catalog.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-store-text-dim transition-colors hover:bg-store-surface hover:text-store-text"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <ul>
            {PRIMARY_LINKS.map(({ labelKey, href }) => (
              <li key={href}>
                <Link
                  to={href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-[14.5px] font-medium text-store-text transition-colors active:bg-store-surface"
                >
                  {t(labelKey)}
                  <ChevronRight size={16} className="text-store-text-dim" />
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-2 border-t border-store-border pt-2">
            {SECONDARY_LINKS.map(({ labelKey, href }) => (
              <li key={href}>
                <Link
                  to={href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] text-store-text-muted transition-colors active:bg-store-surface"
                >
                  {t(labelKey)}
                  <ChevronRight size={15} className="text-store-text-dim" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pb-safe-sheet flex-shrink-0 space-y-3 border-t border-store-border px-5 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-store-text-dim">
            {t("menu.settings")}
          </p>

          <LanguageSwitcher variant="segmented" />

          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg border border-store-border bg-store-surface px-4 py-3 text-[13px] text-store-text-muted transition-colors hover:text-store-text"
          >
            {isDark ? t("header.lightMode") : t("header.darkMode")}
            {isDark ? <Sun size={16} className="text-store-gold" /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
