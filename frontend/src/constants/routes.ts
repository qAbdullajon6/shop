export type ProfileTabId = "profile" | "orders" | "addresses" | "notifications";

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT: (id: string) => `/products/${id}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  /** Returns the canonical URL for a profile tab. "profile" → /profile (no param). */
  PROFILE_TAB: (tab: ProfileTabId = "profile"): string =>
    tab === "profile" ? "/profile" : `/profile?tab=${tab}`,
  WISHLIST: "/wishlist",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  DELIVERY: "/delivery",
  WARRANTY: "/warranty",
  CONTACTS: "/contacts",
  FAQ: "/faq",
  PARTNERSHIP: "/partnership",
} as const;
