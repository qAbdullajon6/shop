import type { ProductVariant } from "./product.types";
import type { CartProduct } from "./cart.types";

export interface WishlistItem {
  variantId: string;
  variant: Pick<ProductVariant, "id" | "sku" | "price" | "stock" | "volume">;
  product: CartProduct;
}

export interface Wishlist {
  items: WishlistItem[];
}
