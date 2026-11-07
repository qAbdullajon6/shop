import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* `<alpha-value>` lets Tailwind's opacity modifiers work against CSS
           variables (`bg-store-card/95`). It requires the variables in
           globals.css to hold space-separated RGB channels — see the comment
           there before changing either side. */
        store: {
          topbar:        "rgb(var(--color-topbar) / <alpha-value>)",
          nav:           "rgb(var(--color-nav) / <alpha-value>)",
          bg:            "rgb(var(--color-bg) / <alpha-value>)",
          surface:       "rgb(var(--color-surface) / <alpha-value>)",
          card:          "rgb(var(--color-card) / <alpha-value>)",
          border:        "rgb(var(--color-border) / <alpha-value>)",
          red:           "#C4647A",
          "red-hover":   "#A84E62",
          gold:          "rgb(var(--color-gold) / <alpha-value>)",
          "gold-light":  "rgb(var(--color-gold-light) / <alpha-value>)",
          "gold-dark":   "rgb(var(--color-gold-dark) / <alpha-value>)",
          hero:          "rgb(var(--color-hero) / <alpha-value>)",
          text:          "rgb(var(--color-text) / <alpha-value>)",
          "text-muted":  "rgb(var(--color-text-muted) / <alpha-value>)",
          "text-dim":    "rgb(var(--color-text-dim) / <alpha-value>)",
          input:         "rgb(var(--color-input) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
