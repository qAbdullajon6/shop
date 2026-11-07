import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import {
  productName,
  productImage,
  productImageHover,
  productPrice,
  productInStock,
  productIsNew,
  productVolume,
  toCartItem,
  toCartProduct,
} from "@/lib/product";
import { useT, useLocale, localizedName } from "@/i18n";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  size?: "sm" | "md";
  badge?: "auto" | "new" | "bestseller";
  /* compact: badge va savat tugmasisiz — showcase bloklari uchun */
  compact?: boolean;
  /* showRating: yulduzli reyting (faqat sharh mavjud bo'lsa chiqadi) */
  showRating?: boolean;
}

type AddState = "idle" | "loading" | "added";

export function ProductCard({ product, badge = "auto", compact = false, showRating = false }: ProductCardProps) {
  const [addState, setAddState] = useState<AddState>("idle");
  const t = useT();
  const locale = useLocale();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { addItem: addToCart, setCart } = useCartStore();
  const { addLocalItem, removeLocalItem, hasItem, setWishlist } = useWishlistStore();

  /* Prefer the active locale's name; `productName` supplies the uz-first
     fallback chain so a partially translated catalogue still renders. */
  const name = localizedName(product, locale) || productName(product);
  const categoryName = product.category ? localizedName(product.category, locale) : "";
  const primaryImg = productImage(product);
  const hoverImg = productImageHover(product);
  const price = productPrice(product);
  const inStock = productInStock(product);
  const isNew = productIsNew(product);
  const isBestseller = product.is_bestseller;
  const volume = productVolume(product);
  const firstVariantId = product.variants[0]?.id ?? "";
  const stock = product.variants[0]?.stock ?? 0;
  const isWishlisted = hasItem(firstVariantId);
  const cartQty = useCartStore((s) => s.items.find((i) => i.variantId === firstVariantId)?.quantity ?? 0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (addState !== "idle" || !inStock) return;
    const item = toCartItem(product, 0, 1);
    if (!item) return;
    setAddState("loading");
    try {
      if (isAuthenticated) {
        const cart = await cartService.addItem(item.variantId, 1);
        setCart(cart.items, cart.total);
      } else {
        addToCart(item);
      }
      setAddState("added");
    } catch {
      addToCart(item);
      setAddState("added");
    } finally {
      setTimeout(() => setAddState("idle"), 2200);
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartQty >= stock) return;
    if (isAuthenticated) {
      try {
        const cart = await cartService.addItem(firstVariantId, 1);
        setCart(cart.items, cart.total);
        return;
      } catch { /* fallthrough */ }
    }
    const item = toCartItem(product, 0, 1);
    if (item) addToCart(item);
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    const newQty = cartQty - 1;
    if (isAuthenticated) {
      try {
        const cart = newQty <= 0
          ? await cartService.removeItem(firstVariantId)
          : await cartService.updateItem(firstVariantId, newQty);
        setCart(cart.items, cart.total);
        return;
      } catch { /* fallthrough */ }
    }
    if (newQty <= 0) {
      useCartStore.getState().removeItem(firstVariantId);
    } else {
      useCartStore.getState().updateQuantity(firstVariantId, newQty);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const variant = product.variants[0];
    if (!variant) return;
    if (isAuthenticated) {
      try {
        if (isWishlisted) {
          const wl = await wishlistService.removeItem(variant.id);
          setWishlist(wl.items);
        } else {
          const wl = await wishlistService.addItem(variant.id);
          setWishlist(wl.items);
        }
        return;
      } catch { /* fallthrough to local */ }
    }
    if (isWishlisted) {
      removeLocalItem(variant.id);
    } else {
      addLocalItem({
        variantId: variant.id,
        variant: {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          volume: variant.volume,
        },
        product: toCartProduct(product),
      });
    }
  };

  return (
    <article className="group relative flex flex-col bg-store-card border border-store-border rounded-xl overflow-hidden transition-all duration-300 hover:border-store-gold/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]">

      {/* ── Image area ─────────────────────────────────────────── */}
      <Link
        to={`${ROUTES.PRODUCTS}/${product.slug}`}
        className="relative block overflow-hidden"
        tabIndex={-1}
      >
        {/* Badge row — top left: faqat bitta badge ko'rinadi */}
        {!compact && (() => {
          const showBestseller =
            badge === "bestseller" ||
            (badge === "auto" && isBestseller);
          const showNew =
            badge === "new"
              ? isNew
              : badge === "auto" && !isBestseller && isNew;
          if (!showBestseller && !showNew) return null;
          return (
            <div className="absolute left-3 top-3 z-10">
              <span className="inline-flex items-center rounded border border-store-gold/30 bg-store-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-store-gold sm:px-2 sm:text-[10px]">
                {showBestseller ? t("product.bestseller") : t("product.new")}
              </span>
            </div>
          );
        })()}

        {/* Image canvas — square, uniform across all cards.
            Subtle scale on hover reads as premium without cropping the bottle. */}
        <div className="relative aspect-square w-full overflow-hidden bg-store-card">
          {/* Primary image */}
          <img
            src={primaryImg}
            alt={name}
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-all duration-500 lg:group-hover:scale-[1.04]",
              hoverImg ? "group-hover:opacity-0" : ""
            )}
            loading="lazy"
            decoding="async"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          {/* Hover image — crossfade when a second image exists */}
          {hoverImg && (
            <img
              src={hoverImg}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-all duration-500 group-hover:opacity-100 lg:group-hover:scale-[1.04]"
              loading="lazy"
              decoding="async"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
      </Link>

      {/* Wishlist — top right, always visible */}
      <button
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? t("product.removeFromWishlist") : t("product.addToWishlist")}
        className={cn(
          "absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 sm:right-3 sm:top-3",
          isWishlisted
            ? "bg-store-card border-store-gold/60 text-store-gold"
            : "bg-store-card/80 border-store-border text-store-text-dim hover:border-store-gold/50 hover:text-store-gold"
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill={isWishlisted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>


      {/* ── Info ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-1 gap-1">

        {/* Brand */}
        {product.brand && (
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-store-text-dim">
            {product.brand.name}
          </p>
        )}

        {/* Product name */}
        <Link to={`${ROUTES.PRODUCTS}/${product.slug}`} className="block">
          <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-store-text hover:text-store-text-muted transition-colors">
            {name}
          </p>
        </Link>

        {/* Category · Volume */}
        {(categoryName || volume) && (
          <p className="truncate text-[10.5px] text-store-text-dim">
            {categoryName}
            {categoryName && volume ? " · " : ""}
            {volume}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          <span className="text-[14px] font-bold text-store-text">
            {formatPrice(price)}
          </span>
        </div>

        {/* Reyting — backendda sharh bo'lmasa umuman chiqmaydi */}
        {showRating && product.review_count > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.round(product.avg_rating ?? 0)
                      ? "fill-store-gold text-store-gold"
                      : "text-store-border"
                  }
                />
              ))}
            </div>
            <span className="text-[11px] text-store-text-dim">({product.review_count})</span>
          </div>
        )}

        {/* Cart controls */}
        {compact ? null : cartQty > 0 ? (
          <div className="mt-1 flex w-full items-center overflow-hidden rounded-md border border-store-gold">
            <button
              onClick={handleDecrease}
              aria-label={t("product.decrease")}
              className="flex h-9 w-10 flex-shrink-0 items-center justify-center text-base font-bold text-store-gold transition-colors hover:bg-store-gold hover:text-white"
            >
              −
            </button>
            <span className="flex-1 select-none text-center text-sm font-bold text-store-text">
              {cartQty}
            </span>
            <button
              onClick={handleIncrease}
              aria-label={t("product.increase")}
              disabled={cartQty >= stock}
              className="flex h-9 w-10 flex-shrink-0 items-center justify-center text-base font-bold text-store-gold transition-colors hover:bg-store-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addState === "loading"}
            className={cn(
              "mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-[10px] font-medium tracking-wide transition-all duration-200",
              !inStock
                ? "border border-store-border text-store-text-dim cursor-not-allowed opacity-40"
                : addState === "added"
                  ? "bg-store-gold/10 border border-store-gold text-store-gold cursor-default"
                  : addState === "loading"
                    ? "border border-store-gold/50 text-store-gold opacity-60 cursor-wait"
                    : "border border-store-gold/50 text-store-gold hover:bg-store-gold hover:text-white hover:border-store-gold"
            )}
          >
            {addState === "loading" ? (
              <>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                {t("product.adding")}
              </>
            ) : addState === "added" ? (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t("product.added")}
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span className="truncate">
                  {inStock ? t("product.addToCart") : t("product.outOfStock")}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
