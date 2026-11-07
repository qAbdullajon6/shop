import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, ShoppingCart, X, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { wishlistService } from "@/services/wishlist.service";
import { cartService } from "@/services/cart.service";
import { formatPrice } from "@/lib/utils";
import { imgUrl, ROUTES } from "@/constants";
import { productName } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { WishlistItem } from "@/types";

function WishlistCard({ item }: { item: WishlistItem }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { removeLocalItem, setWishlist } = useWishlistStore();
  const { addItem: addToCart, setCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const name = productName(item.product);
  const image = imgUrl(item.product.images[0]?.url) ?? "/placeholder.svg";
  const price = parseFloat(String(item.variant.price));
  const inStock = item.variant.stock > 0;

  const handleRemove = async () => {
    if (isAuthenticated) {
      try {
        const wl = await wishlistService.removeItem(item.variantId);
        setWishlist(wl.items);
        return;
      } catch { /* fallthrough to local */ }
    }
    removeLocalItem(item.variantId);
  };

  const handleAddToCart = async () => {
    if (!inStock || added) return;
    if (isAuthenticated) {
      try {
        const cart = await cartService.addItem(item.variantId, 1);
        setCart(cart.items, cart.total);
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
        return;
      } catch { /* fallthrough to local */ }
    }
    addToCart({
      variantId: item.variantId,
      quantity: 1,
      variant: item.variant as never,
      product: item.product,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-store-border bg-store-card transition-all duration-300 hover:border-store-gold/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
      <button
        onClick={handleRemove}
        aria-label="Sevimlilardan olib tashlash"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-store-border bg-store-card/80 text-store-text-dim transition-colors hover:border-store-gold hover:text-store-gold"
      >
        <X size={14} />
      </button>

      <Link to={`${ROUTES.PRODUCTS}/${item.product.slug}`} className="block" tabIndex={-1}>
        <div className="aspect-square w-full overflow-hidden bg-store-card">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-1">
        <Link to={`${ROUTES.PRODUCTS}/${item.product.slug}`}>
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-store-text transition-colors hover:text-store-gold">
            {name}
          </h3>
        </Link>

        {item.variant.volume && (
          <p className="text-[11px] text-store-text-dim">{item.variant.volume}</p>
        )}

        <div className="mt-auto pt-3">
          <p className="text-[15px] font-bold text-store-text">{formatPrice(price)}</p>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              "mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md py-2.5 text-[11px] font-medium transition-all duration-200",
              !inStock
                ? "cursor-not-allowed border border-store-border text-store-text-dim opacity-50"
                : added
                  ? "cursor-default border border-store-gold bg-store-gold/10 text-store-gold"
                  : "border border-store-gold/50 text-store-gold hover:bg-store-gold hover:text-white"
            )}
          >
            {added ? <Check size={14} /> : <ShoppingCart size={14} />}
            {!inStock ? "Tugagan" : added ? "Savatchada" : "Savatchaga qo'shish"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function WishlistPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items, setWishlist, clearWishlist } = useWishlistStore();
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistService.getWishlist().then((wl) => setWishlist(wl.items)).catch(() => {});
  }, [isAuthenticated, setWishlist]);

  const handleClear = async () => {
    setClearing(true);
    if (isAuthenticated) {
      try {
        await wishlistService.clearWishlist();
        setWishlist([]);
        setClearing(false);
        return;
      } catch { /* fallthrough to local */ }
    }
    clearWishlist();
    setClearing(false);
  };

  return (
    <>
      <Helmet>
        <title>Sevimlilar — Zahabi Parfüm</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-10">
        <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-store-text-muted">
          <Link to={ROUTES.HOME} className="transition-colors hover:text-store-gold">
            Bosh sahifa
          </Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Sevimlilar</span>
        </nav>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="rounded-full border border-store-border bg-store-card p-6">
              <Heart size={38} strokeWidth={1.4} className="text-store-text-dim" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-serif text-[26px] font-medium text-store-text">
                Sevimlilar ro&apos;yxati bo&apos;sh
              </h1>
              <p className="text-[13px] text-store-text-muted">
                Yoqqan atirlarni yurakcha tugmasi bilan saqlab qo&apos;ying
              </p>
            </div>
            <Link to={ROUTES.PRODUCTS}>
              <Button size="lg">Katalogga o&apos;tish</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h1 className="flex items-baseline gap-2.5 font-serif text-[28px] font-medium text-store-text">
                Sevimlilar
                <span className="font-sans text-[13px] font-normal text-store-text-muted">
                  {items.length} ta mahsulot
                </span>
              </h1>
              <button
                onClick={handleClear}
                disabled={clearing}
                className="flex flex-shrink-0 items-center gap-1.5 text-[12px] text-store-text-dim transition-colors hover:text-store-gold disabled:opacity-50"
              >
                <X size={13} />
                Ro&apos;yxatni tozalash
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {items.map((item) => (
                <WishlistCard key={item.variantId} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
