import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

/**
 * Runtime palette, written to inline styles on <html> so the theme applies
 * before React's first paint (no flash).
 *
 * VALUES ARE SPACE-SEPARATED RGB CHANNELS, NOT HEX — and must stay byte-for-byte
 * in sync with the `:root` / `html.dark` blocks in src/styles/globals.css.
 * These inline styles override that stylesheet, so a hex value here silently
 * breaks every Tailwind opacity utility (`bg-store-card/95`, `bg-store-gold/15`)
 * app-wide: `rgb(#FFFDF9 / 0.95)` is invalid CSS and resolves to transparent.
 */
export const THEME_COLORS: Record<Theme, Record<string, string>> = {
  dark: {
    "--color-topbar":     "5 5 5",
    "--color-nav":        "11 11 11",
    "--color-bg":         "5 5 5",
    "--color-surface":    "13 13 13",
    "--color-card":       "17 17 17",
    "--color-border":     "36 36 36",
    "--color-text":       "245 243 238",
    "--color-text-muted": "168 163 154",
    "--color-text-dim":   "119 115 108",
    "--color-input":      "26 26 26",
    "--color-gold":       "201 164 92",
    "--color-gold-light": "224 194 122",
    "--color-gold-dark":  "143 107 50",
  },
  light: {
    "--color-topbar":     "23 23 23",
    "--color-nav":        "255 255 255",
    "--color-bg":         "250 247 241",
    "--color-surface":    "243 239 231",
    "--color-card":       "255 253 249",
    "--color-border":     "232 226 214",
    "--color-text":       "23 23 23",
    "--color-text-muted": "105 100 93",
    "--color-text-dim":   "154 149 141",
    "--color-input":      "240 238 233",
    "--color-gold":       "184 138 59",
    "--color-gold-light": "212 168 82",
    "--color-gold-dark":  "143 107 50",
  },
};

export function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  Object.entries(THEME_COLORS[theme]).forEach(([k, v]) =>
    root.style.setProperty(k, v)
  );
  root.classList.toggle("dark", theme === "dark");
}


interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        applyThemeToDOM(next);
      },
      applyTheme: () => applyThemeToDOM(get().theme),
    }),
    { name: "zahabi-theme" }
  )
);
