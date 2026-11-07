import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

interface WishlistActions {
  setWishlist: (items: WishlistItem[]) => void;
  addLocalItem: (item: WishlistItem) => void;
  removeLocalItem: (variantId: string) => void;
  clearWishlist: () => void;
  hasItem: (variantId: string) => boolean;
  setLoading: (loading: boolean) => void;
}

export const useWishlistStore = create<WishlistState & WishlistActions>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setWishlist: (items) => set({ items }),

      addLocalItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.variantId === item.variantId)) return state;
          return { items: [...state.items, item] };
        }),

      removeLocalItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      clearWishlist: () => set({ items: [] }),

      hasItem: (variantId) => get().items.some((i) => i.variantId === variantId),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "zahabi-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
