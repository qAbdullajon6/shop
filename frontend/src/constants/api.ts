export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
export const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN ?? "";

export const imgUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_ORIGIN}/${path}`;
};

export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    TELEGRAM: "/auth/telegram",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  USERS: {
    ME: "/users/me",
    UPDATE_ME: "/users/me",
  },
  BANNERS: {
    LIST: "/banners",
    DETAIL: (id: string) => `/banners/${id}`,
  },
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (slug: string) => `/categories/${slug}`,
  },
  BRANDS: {
    LIST: "/brands",
    DETAIL: (slug: string) => `/brands/${slug}`,
  },
  CATEGORY_ATTRIBUTES: "/category-attributes",
  PRODUCTS: {
    LIST: "/products",
    FACETS: "/products/facets",
    DETAIL: (slug: string) => `/products/${slug}`,
    SIMILAR: (slug: string) => `/products/${slug}/similar`,
  },
  REVIEWS: {
    LIST: "/reviews",
    CREATE: "/reviews",
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  CART: {
    GET: "/cart",
    ADD: "/cart/items",
    UPDATE: (variantId: string) => `/cart/items/${variantId}`,
    REMOVE: (variantId: string) => `/cart/items/${variantId}`,
    CLEAR: "/cart",
    SYNC: "/cart/sync",
  },
  WISHLIST: {
    GET: "/wishlist",
    ADD: "/wishlist/items",
    REMOVE: (variantId: string) => `/wishlist/items/${variantId}`,
    CLEAR: "/wishlist",
  },
  ADDRESSES: {
    LIST: "/addresses",
    CREATE: "/addresses",
    DETAIL: (id: string) => `/addresses/${id}`,
    UPDATE: (id: string) => `/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/addresses/${id}/default`,
    DELETE: (id: string) => `/addresses/${id}`,
  },
  ORDERS: {
    LIST: "/orders/my",
    CREATE: "/orders",
    DETAIL: (id: string) => `/orders/my/${id}`,
    CANCEL: (id: string) => `/orders/my/${id}/cancel`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },
} as const;
