import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { imgUrl } from "@/constants";
import { productName } from "@/lib/product";
import { useCartStore } from "@/store/cartStore";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { cartService } from "@/services/cart.service";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { removeItem, updateQuantity, setCart } = useCartStore();
  const { variant, product, quantity } = item;
  const price = parseFloat(String(variant.price));
  const total = price * quantity;
  const image = imgUrl(product.images[0]?.url) ?? "/placeholder.svg";
  const name = productName(product);

  const handleRemove = async () => {
    if (isAuthenticated) {
      try {
        const cart = await cartService.removeItem(item.variantId);
        setCart(cart.items, cart.total);
        return;
      } catch {
        // fallthrough to local
      }
    }
    removeItem(item.variantId);
  };

  const handleQty = async (qty: number) => {
    if (qty <= 0) { handleRemove(); return; }
    if (isAuthenticated) {
      try {
        const cart = await cartService.updateItem(item.variantId, qty);
        setCart(cart.items, cart.total);
        return;
      } catch {
        // fallthrough to local
      }
    }
    updateQuantity(item.variantId, qty);
  };

  return (
    <div className="flex items-start gap-4 py-5">
      <Link to={`${ROUTES.PRODUCTS}/${product.slug}`} className="flex-shrink-0">
        <div className="h-[90px] w-[90px] overflow-hidden rounded-xl border border-store-border bg-store-surface">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Link to={`${ROUTES.PRODUCTS}/${product.slug}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-store-text transition-colors hover:text-store-gold">
              {name}
            </h3>
          </Link>
          {variant.volume && (
            <span className="mr-1 inline-block rounded bg-store-input px-1.5 py-0.5 text-[10px] text-store-text-muted">
              {variant.volume}
            </span>
          )}
          <p className="text-xs text-store-text-muted">
            {formatPrice(price)} / dona
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-3">
          <button
            onClick={handleRemove}
            className="flex items-center gap-1 text-[11px] text-store-text-dim transition-colors hover:text-store-gold"
          >
            <Trash2 size={12} />
            O'chirish
          </button>

          <p className="text-base font-bold text-store-text">
            {formatPrice(total)}
          </p>

          <div className="flex items-center overflow-hidden rounded-lg border border-store-border">
            <button
              onClick={() => handleQty(quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-lg text-store-text-muted transition-colors hover:bg-store-gold hover:text-white"
            >
              −
            </button>
            <span className="w-9 select-none text-center text-sm font-semibold text-store-text">
              {quantity}
            </span>
            <button
              onClick={() => handleQty(quantity + 1)}
              disabled={quantity >= variant.stock}
              className="flex h-8 w-8 items-center justify-center text-lg text-store-text-muted transition-colors hover:bg-store-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
