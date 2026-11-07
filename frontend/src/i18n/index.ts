/**
 * Localization runtime.
 *
 * Deliberately dependency-free: the project already ships zustand + persist for
 * every other cross-cutting concern (theme, auth, cart), so the locale reuses
 * that exact pattern instead of pulling in i18next. Swapping to a heavier
 * library later only requires reimplementing `useT` — call sites stay valid.
 */

import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  LOCALES,
  MESSAGES,
  type Locale,
  type MessageKey,
} from "./messages";

export {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  DEFAULT_LOCALE,
  type Locale,
  type MessageKey,
} from "./messages";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        // Keep the document language in sync for screen readers and for
        // Telegram's in-app browser, which reads <html lang> for hyphenation.
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
        }
        set({ locale });
      },
    }),
    {
      name: "zahabi-locale",
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.lang = state.locale;
        }
      },
    }
  )
);

/** Current locale only — use when you need the value but not the translator. */
export const useLocale = (): Locale => useLocaleStore((s) => s.locale);

/**
 * Returns a stable `t(key)` translator bound to the active locale.
 * Falls back to Uzbek, then to the raw key, so a missing translation degrades
 * to readable text instead of an empty node.
 */
export function useT(): (key: MessageKey) => string {
  const locale = useLocaleStore((s) => s.locale);
  return useCallback(
    (key: MessageKey) => MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key,
    [locale]
  );
}

/** Non-reactive lookup for use outside React (route builders, services). */
export function translate(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
}

/* ── Backend content localization ─────────────────────────────────────────── */

/**
 * Picks the field matching the active locale from a backend record that carries
 * `*_uz` / `*_ru` / `*_en` variants (categories, products, brands, banners).
 * Falls through the remaining locales so a partially-translated catalogue still
 * renders a name rather than an empty string.
 */
export function pickLocalized(
  values: { uz?: string | null; ru?: string | null; en?: string | null },
  locale: Locale
): string {
  const ordered: Locale[] = [locale, ...LOCALES.filter((l) => l !== locale)];
  for (const l of ordered) {
    const value = values[l];
    if (value) return value;
  }
  return "";
}

/** Convenience wrapper for the common `{ name_uz, name_ru, name_en }` shape. */
export function localizedName(
  record: { name_uz?: string | null; name_ru?: string | null; name_en?: string | null },
  locale: Locale
): string {
  return pickLocalized(
    { uz: record.name_uz, ru: record.name_ru, en: record.name_en },
    locale
  );
}
