import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, ChevronRight, Trash2 } from "lucide-react";
import { CartItem } from "@/components/features/cart/CartItem";
import { CartSummary } from "@/components/features/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cartService } from "@/services/cart.service";
import { ROUTES } from "@/constants";

export function CartPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items, clearCart, setCart } = useCartStore();

  const handleClearCart = async () => {
    if (isAuthenticated) {
      try {
        const cart = await cartService.clearCart();
        setCart(cart.items, cart.total);
        return;
      } catch {
        // fallthrough
      }
    }
    clearCart();
  };

  return (
    <>
      <Helmet>
        <title>Savatcha — Zahabi Parfüm</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-10">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-store-text-muted">
          <Link to={ROUTES.HOME} className="hover:text-store-gold transition-colors">
            Bosh sahifa
          </Link>
          <ChevronRight size={12} />
          <span className="text-store-text">Savatcha</span>
        </nav>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="rounded-full border border-store-border bg-store-card p-6">
              <ShoppingCart size={40} className="text-store-text-dim" />
            </div>
            <div className="space-y-1">
              <h1 className="font-serif text-[26px] font-medium text-store-text">Savatcha bo'sh</h1>
              <p className="text-sm text-store-text-muted">
                Buyurtma berish uchun mahsulotlar qo'shing
              </p>
            </div>
            <Link to={ROUTES.PRODUCTS}>
              <Button>Katalogga o'tish</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-6 flex items-baseline gap-2.5 font-serif text-[28px] font-medium text-store-text">
              Savatingiz
              <span className="font-sans text-[13px] font-normal text-store-text-muted">
                {items.length} ta mahsulot
              </span>
            </h1>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-xl border border-store-border bg-store-card">
                  <div className="flex items-center justify-between border-b border-store-border px-5 py-3">
                    <span className="text-sm text-store-text-muted">
                      Barcha mahsulotlar
                    </span>
                    <button
                      onClick={handleClearCart}
                      className="flex items-center gap-1.5 text-xs text-store-text-dim transition-colors hover:text-store-gold"
                    >
                      <Trash2 size={12} />
                      Barchasini o'chirish
                    </button>
                  </div>

                  <div className="divide-y divide-store-border px-5">
                    {items.map((item) => (
                      <CartItem key={item.variantId} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-24 lg:self-start">
                <CartSummary />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
