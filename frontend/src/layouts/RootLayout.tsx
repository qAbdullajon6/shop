import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CatalogSheet } from "@/components/layout/CatalogSheet";
import { MobileMenuDrawer } from "@/components/layout/MobileMenuDrawer";
import { useThemeStore } from "@/store/themeStore";

export function RootLayout() {
  const applyTheme = useThemeStore((s) => s.applyTheme);
  const { pathname, search } = useLocation();

  /* The layout owns both mobile overlays so only one can be open at a time. */
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  /* Any navigation dismisses the overlays. Links inside them already close on
     click; this also covers the Telegram BackButton and browser back/forward. */
  useEffect(() => {
    setCatalogOpen(false);
    setMenuOpen(false);
  }, [pathname, search]);

  const openMenu = useCallback(() => {
    setCatalogOpen(false);
    setMenuOpen(true);
  }, []);

  const toggleCatalog = useCallback(() => {
    setMenuOpen(false);
    setCatalogOpen((v) => !v);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-store-bg text-store-text">
      <Header onOpenMenu={openMenu} />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <Footer />

      {/* Reserves space for the fixed bottom nav (and the iPhone home
          indicator) so the footer is never clipped. Collapses to 0 on lg+. */}
      <div className="pb-bottom-nav" aria-hidden />

      <MobileBottomNav catalogOpen={catalogOpen} onToggleCatalog={toggleCatalog} />
      <CatalogSheet open={catalogOpen} onClose={() => setCatalogOpen(false)} />
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
