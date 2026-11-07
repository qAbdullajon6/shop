import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "@/types";

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setCart: (items: CartItem[], total: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      isLoading: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.items, item];
          const total = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
          return { items, total };
        }),

      removeItem: (variantId) =>
        set((state) => {
          const items = state.items.filter((i) => i.variantId !== variantId);
          const total = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
          return { items, total };
        }),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity } : i
                );
          const total = items.reduce((s, i) => s + parseFloat(String(i.variant.price)) * i.quantity, 0);
          return { items, total };
        }),

      setCart: (items, total) => set({ items, total }),

      clearCart: () => set({ items: [], total: 0 }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "zahabi-cart",
      /* Faqat items saqlanadi — total undan kelib chiqadi, shuning uchun sahifa
         qayta yuklanganda qayta hisoblanadi (aks holda 0 bo'lib qolardi). */
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.total = state.items.reduce(
          (sum, i) => sum + parseFloat(String(i.variant.price)) * i.quantity,
          0
        );
      },
    }
  )
);
