import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User as UserIcon, Package, MapPin, Bell, Heart, LogOut, ChevronRight } from "lucide-react";
import { ProfileInfoTab } from "@/components/features/profile/ProfileInfoTab";
import { OrdersTab } from "@/components/features/profile/OrdersTab";
import { AddressesTab } from "@/components/features/profile/AddressesTab";
import { NotificationsTab } from "@/components/features/profile/NotificationsTab";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { usePhoneAuthStore } from "@/store/phoneAuthStore";
import { authService } from "@/services/auth.service";
import { ROUTES, type ProfileTabId } from "@/constants";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile"       as ProfileTabId, label: "Shaxsiy ma'lumotlar", Icon: UserIcon },
  { id: "orders"        as ProfileTabId, label: "Buyurtmalarim",       Icon: Package },
  { id: "addresses"     as ProfileTabId, label: "Manzillarim",         Icon: MapPin },
  { id: "notifications" as ProfileTabId, label: "Xabarlar",            Icon: Bell },
] as const;

type TabId = ProfileTabId;

const isTabId = (v: string | null): v is TabId =>
  TABS.some((t) => t.id === v);

export function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, setUser } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openAuth = usePhoneAuthStore((s) => s.open);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const active: TabId = isTabId(tabParam) ? tabParam : "profile";

  /* Sahifa ochilganda profil ma'lumoti serverdan yangilanadi */
  useEffect(() => {
    if (!isAuthenticated) return;
    authService.getMe().then(setUser).catch(() => {});
  }, [isAuthenticated, setUser]);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    authService.logout().catch(() => {}).finally(() => {
      logout();
      navigate(ROUTES.HOME, { replace: true });
    });
  };

  // replace: true — tab switches must NOT pollute browser history.
  // Back/forward should navigate between pages, not cycle through tab states.
  const setTab = (id: TabId) =>
    setSearchParams(id === "profile" ? {} : { tab: id }, { replace: true });

  /* ── Auth tiklanmoqda (TelegramAutoAuth / token refresh) ─────── */
  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-content items-center justify-center px-4 py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-store-border border-t-store-gold" />
      </div>
    );
  }

  /* ── Kirmagan foydalanuvchi ────────────────────────────────── */
  if (!isAuthenticated || !user) {
    return (
      <>
        <Helmet>
          <title>Shaxsiy kabinet — Zahabi Parfüm</title>
          <meta name="robots" content="noindex" />
        </Helmet>

        <div className="mx-auto flex w-full max-w-content flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
          <div className="rounded-full border border-store-border bg-store-card p-6">
            <UserIcon size={38} strokeWidth={1.4} className="text-store-text-dim" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-[26px] font-medium text-store-text">
              Shaxsiy kabinet
            </h1>
            <p className="text-[13px] text-store-text-muted">
              Buyurtmalaringiz va manzillaringizni ko&apos;rish uchun tizimga kiring
            </p>
          </div>
          <button
            onClick={openAuth}
            className="inline-flex h-12 items-center rounded-md bg-store-gold px-7 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Tizimga kirish
          </button>
        </div>
      </>
    );
  }

  const displayName =
    [user.name, user.last_name].filter(Boolean).join(" ") || "Xush kelibsiz";
  const initials =
    (user.name?.[0] ?? user.last_name?.[0] ?? "U").toUpperCase();

  return (
    <>
      <Helmet>
        <title>Shaxsiy kabinet — Zahabi Parfüm</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-10">
        <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-store-text-muted">
          <Link to={ROUTES.HOME} className="transition-colors hover:text-store-gold">
            Bosh sahifa
          </Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Shaxsiy kabinet</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">

          {/* ── Yon panel ────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-store-border bg-store-card p-5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-store-gold text-[17px] font-semibold text-white">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-store-text">{displayName}</p>
                  <p className="mt-0.5 truncate text-[12px] text-store-text-muted">
                    {user.phone_number}
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-4 space-y-1">
              {TABS.map(({ id, label, Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-4 py-3 text-[13px] transition-colors",
                      active === id
                        ? "bg-store-gold/10 font-medium text-store-gold"
                        : "text-store-text-muted hover:bg-store-surface hover:text-store-text"
                    )}
                  >
                    <Icon size={17} strokeWidth={1.7} />
                    {label}
                  </button>
                </li>
              ))}

              <li>
                <Link
                  to={ROUTES.WISHLIST}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-[13px] text-store-text-muted transition-colors hover:bg-store-surface hover:text-store-text"
                >
                  <Heart size={17} strokeWidth={1.7} />
                  Sevimlilarim
                  {wishlistCount > 0 && (
                    <span className="ml-auto rounded-full bg-store-gold px-2 py-0.5 text-[10px] font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </li>

              <li className="pt-1">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-[13px] text-store-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                >
                  <LogOut size={17} strokeWidth={1.7} />
                  Chiqish
                </button>
              </li>
            </ul>
          </aside>

          {/* ── Kontent ──────────────────────────────────────── */}
          <div className="min-w-0">
            {active === "profile"       && <ProfileInfoTab user={user} />}
            {active === "orders"        && <OrdersTab />}
            {active === "addresses"     && <AddressesTab />}
            {active === "notifications" && <NotificationsTab />}
          </div>

        </div>
      </div>
    </>
  );
}
