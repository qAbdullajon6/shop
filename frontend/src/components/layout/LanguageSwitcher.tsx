import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  useLocaleStore,
  useT,
  type Locale,
} from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Locale switcher.
 *
 * `dropdown` sits in the desktop header; `segmented` renders as a full-width
 * three-way control inside the mobile drawer where a popover would be awkward.
 */
export function LanguageSwitcher({ variant = "dropdown" }: { variant?: "dropdown" | "segmented" }) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Close on outside click / Escape. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "segmented") {
    return (
      <div
        className="flex gap-1 rounded-lg border border-store-border bg-store-surface p-1"
        role="group"
        aria-label={t("header.language")}
      >
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            className={cn(
              "flex-1 rounded-md py-2 text-[12.5px] font-medium transition-colors",
              locale === l
                ? "bg-store-card text-store-gold shadow-sm"
                : "text-store-text-muted hover:text-store-text"
            )}
          >
            {LOCALE_SHORT[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("header.language")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-1.5 rounded-md px-2 text-store-text-muted transition-colors hover:text-store-text"
      >
        <Globe size={18} />
        <span className="text-[12px] font-medium tracking-wide">{LOCALE_SHORT[locale]}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-menu-in absolute right-0 top-full z-50 mt-1 min-w-[168px] overflow-hidden rounded-lg border border-store-border bg-store-card py-1 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)]"
        >
          {LOCALES.map((l: Locale) => (
            <button
              key={l}
              type="button"
              role="menuitem"
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-store-surface",
                locale === l ? "text-store-gold" : "text-store-text-muted"
              )}
            >
              {LOCALE_LABELS[l]}
              {locale === l && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
