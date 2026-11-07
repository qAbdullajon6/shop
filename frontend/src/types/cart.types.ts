import type { ProductVariant } from "./product.types";

export interface CartProduct {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  images: { id: string; url: string; sort_order: number }[];
}

export interface CartItem {
  variantId: string;
  quantity: number;
  variant: ProductVariant;
  product: CartProduct;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
}

export interface LocalCartItem {
  variantId: string;
  quantity: number;
}
