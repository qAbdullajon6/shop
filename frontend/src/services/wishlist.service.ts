import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Wishlist } from "@/types";

export const wishlistService = {
  getWishlist: () =>
    apiGet<Wishlist>(API_ENDPOINTS.WISHLIST.GET),

  addItem: (variantId: string) =>
    apiPost<Wishlist>(API_ENDPOINTS.WISHLIST.ADD, { variant_id: variantId }),

  removeItem: (variantId: string) =>
    apiDelete<Wishlist>(API_ENDPOINTS.WISHLIST.REMOVE(variantId)),

  clearWishlist: () =>
    apiDelete<Wishlist>(API_ENDPOINTS.WISHLIST.CLEAR),
};
