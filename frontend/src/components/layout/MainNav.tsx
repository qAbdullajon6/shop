import { Link, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useThemeStore } from "@/store/themeStore";

const NAV_LINKS = [
  { label: "Biz haqimizda", href: "/about" },
  { label: "Yetkazib berish", href: "/delivery" },
  { label: "Kafolat va qaytarish", href: "/warranty" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontaktlar", href: "/contacts" },
  { label: "Hamkorlik", href: "/partnership" },
];

export function MainNav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <nav className="bg-store-nav border-b border-store-border sticky top-0 z-40">
      <div className="mx-auto max-w-content px-4">
        <div className="flex h-14 items-center justify-between gap-8">

          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex-shrink-0 select-none flex flex-col items-start leading-none"
            aria-label="Zahabi Parfüm"
          >
            <span
              className="text-2xl font-semibold tracking-[0.12em] text-store-text"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              ZAHABI
            </span>
            <span
              className="text-[9px] tracking-[0.42em] text-store-red uppercase font-medium -mt-0.5"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              parfüm
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex flex-1 items-center justify-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  "text-sm whitespace-nowrap transition-colors",
                  pathname === href
                    ? "text-store-text font-medium"
                    : "text-store-text-muted hover:text-store-text"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side: theme toggle */}
          <div className="flex flex-shrink-0 items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-store-border bg-store-input transition-all duration-200 hover:border-store-red hover:bg-store-card"
            >
              <Sun
                size={15}
                className={`absolute transition-all duration-300 ease-in-out text-yellow-400 ${
                  isDark
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-50 opacity-0"
                }`}
              />
              <Moon
                size={15}
                className={`absolute transition-all duration-300 ease-in-out text-store-text-muted ${
                  isDark
                    ? "-rotate-90 scale-50 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
