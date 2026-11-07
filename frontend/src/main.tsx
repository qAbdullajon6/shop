import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { App } from "./App";
import "./styles/globals.css";
import { THEME_COLORS } from "./store/themeStore";
import type { Theme } from "./store/themeStore";

// localStorage → system preference tartibida tema aniqlanadi
const saved = localStorage.getItem("zahabi-theme");
const savedTheme = saved ? JSON.parse(saved)?.state?.theme : null;
const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
const initialTheme: Theme =
  savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme;

// React render bo'lishidan oldin CSS o'zgaruvchilarni qo'llash (miltillamaslik uchun)
const root = document.documentElement;
Object.entries(THEME_COLORS[initialTheme]).forEach(([k, v]) =>
  root.style.setProperty(k, v)
);
root.classList.toggle("dark", initialTheme === "dark");

const appRoot = document.getElementById("root");
if (!appRoot) throw new Error("Root element not found");

createRoot(appRoot).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
