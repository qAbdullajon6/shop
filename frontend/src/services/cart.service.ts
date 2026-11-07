import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Cart, CartItem, LocalCartItem } from "@/types";

/* ── Backend cart shape (CartResponseDto) ──────────────────────────────────
   Backend savat javobi frontend `Cart` shaklidan farq qiladi:
   - `total_price` (string) ↔ `total` (number)
   - item.`variant_id` ↔ `variantId`
   - mahsulot `variant.product` ichida joylashgan va `image_url` (bitta string),
     frontend esa top-level `product.images[]` (massiv) kutadi.
   Shu sabab har bir javob shu yerda frontend shakliga o'giriladi. */
interface ServerCartProduct {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  image_url: string | null;
}

interface ServerCartVariant {
  id: string;
  sku: string;
  volume: string | null;
  color: string | null;
  color_hex: string | null;
  price: string;
  compare_at_price: string | null;
  discount_percent: number | null;
  stock: number;
  product: ServerCartProduct;
}

interface ServerCartItem {
  id: string;
  variant_id: string;
  quantity: number;
  line_total: string;
  is_available: boolean;
  available_stock: number;
  variant: ServerCartVariant;
}

interface ServerCart {
  id: string;
  session_token: string | null;
  items: ServerCartItem[];
  total_items: number;
  total_price: string;
  total_savings: string;
  has_unavailable_items: boolean;
}

function mapServerItem(item: ServerCartItem): CartItem {
  const p = item.variant.product;
  return {
    variantId: item.variant_id,
    quantity: item.quantity,
    variant: {
      id: item.variant.id,
      sku: item.variant.sku,
      volume: item.variant.volume,
      color: item.variant.color,
      color_hex: item.variant.color_hex,
      price: item.variant.price,
      stock: item.variant.stock,
      is_active: true,
    },
    product: {
      id: p.id,
      slug: p.slug,
      name_uz: p.name_uz,
      name_ru: p.name_ru,
      name_en: p.name_en,
      images: p.image_url ? [{ id: `${p.id}-0`, url: p.image_url, sort_order: 0 }] : [],
    },
  };
}

export function mapServerCart(raw: ServerCart): Cart {
  return {
    items: (raw.items ?? []).map(mapServerItem),
    total: parseFloat(raw.total_price ?? "0") || 0,
  };
}

export const cartService = {
  getCart: () =>
    apiGet<ServerCart>(API_ENDPOINTS.CART.GET).then(mapServerCart),

  addItem: (variantId: string, quantity: number) =>
    apiPost<ServerCart>(API_ENDPOINTS.CART.ADD, { variant_id: variantId, quantity }).then(mapServerCart),

  updateItem: (variantId: string, quantity: number) =>
    apiPatch<ServerCart>(API_ENDPOINTS.CART.UPDATE(variantId), { quantity }).then(mapServerCart),

  removeItem: (variantId: string) =>
    apiDelete<ServerCart>(API_ENDPOINTS.CART.REMOVE(variantId)).then(mapServerCart),

  clearCart: () =>
    apiDelete<ServerCart>(API_ENDPOINTS.CART.CLEAR).then(mapServerCart),

  syncCart: (items: LocalCartItem[]) =>
    apiPost<ServerCart>(API_ENDPOINTS.CART.SYNC, {
      items: items.map(({ variantId, quantity }) => ({ variant_id: variantId, quantity })),
    }).then(mapServerCart),
};
