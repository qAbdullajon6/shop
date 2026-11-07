import type { Product, CartItem, CartProduct } from "@/types";
import { imgUrl } from "@/constants";

export const productName = (p: Pick<Product, "name_uz" | "name_ru" | "name_en">): string =>
  p.name_uz || p.name_ru || p.name_en || "Mahsulot";

export const productImage = (p: Pick<Product, "images">): string =>
  imgUrl(p.images[0]?.url) ?? "/placeholder.svg";

// Second image for card hover effect
export const productImageHover = (p: Pick<Product, "images">): string | null => {
  const second = p.images[1] ?? p.images[0];
  return second ? (imgUrl(second.url) ?? null) : null;
};

export const productFirstVariant = (p: Pick<Product, "variants">) =>
  p.variants[0] ?? null;

// price is a Decimal string from backend ("285000.00") — parse to number
export const productPrice = (p: Pick<Product, "variants">): number =>
  parseFloat(String(p.variants[0]?.price ?? 0)) || 0;

// compare_price does not exist in backend schema — always null
export const productComparePrice = (_p: Pick<Product, "variants">): number | null => null;

// Discount is never available from real API (no compare_price in backend)
export const productDiscount = (_p: Pick<Product, "variants">): number | null => null;

export const productInStock = (p: Pick<Product, "variants">): boolean =>
  (p.variants[0]?.stock ?? 0) > 0;

export const productVolume = (p: Pick<Product, "variants">): string | null =>
  p.variants[0]?.volume ?? null;

// "New" if created within last 60 days
export const productIsNew = (p: Pick<Product, "created_at">): boolean => {
  const created = new Date(p.created_at).getTime();
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
  return created > cutoff;
};

export const toCartProduct = (p: Product): CartProduct => ({
  id: p.id,
  slug: p.slug,
  name_uz: p.name_uz,
  name_ru: p.name_ru,
  name_en: p.name_en,
  images: p.images,
});

export const toCartItem = (p: Product, variantIdx = 0, quantity = 1): CartItem | null => {
  const variant = p.variants[variantIdx];
  if (!variant) return null;
  return { variantId: variant.id, quantity, variant, product: toCartProduct(p) };
};
