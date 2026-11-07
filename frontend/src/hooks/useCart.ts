import { useCartStore } from "@/store";

export function useCart() {
  const store = useCartStore();
  const itemCount = store.items.reduce((s, i) => s + i.quantity, 0);
  const isInCart = (variantId: string) => store.items.some((i) => i.variantId === variantId);
  const getQuantity = (variantId: string) =>
    store.items.find((i) => i.variantId === variantId)?.quantity ?? 0;

  return { ...store, itemCount, isInCart, getQuantity };
}
