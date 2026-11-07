import { Link } from "react-router-dom";
import { ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useCartStore } from "@/store/cartStore";

export function CartSummary() {
  const { total, items } = useCartStore();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const shipping = total > 500000 ? 0 : 30000;
  const grandTotal = total + shipping;
  const freeShippingLeft = 500000 - total;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-store-border bg-store-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Truck size={16} className="flex-shrink-0 text-store-gold" />
          <span className="text-sm text-store-text">
            {shipping === 0
              ? "Yetkazib berish bepul!"
              : `${formatPrice(freeShippingLeft)} ga yetsa — yetkazish bepul`}
          </span>
        </div>
        <Link to={ROUTES.PRODUCTS} className="text-store-gold hover:underline">
          <span className="text-lg leading-none">›</span>
        </Link>
      </div>

      <div className="rounded-xl border border-store-border bg-store-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-store-text-muted" />
          <h2 className="text-base font-bold text-store-text">Buyurtmangiz</h2>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-store-text-muted">Mahsulotlar ({itemCount} ta)</span>
            <span className="font-medium text-store-text">{formatPrice(total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-store-text-muted">Yetkazib berish</span>
            <span className={shipping === 0 ? "font-medium text-green-500" : "font-medium text-store-text"}>
              {shipping === 0 ? "Bepul" : formatPrice(shipping)}
            </span>
          </div>
          {shipping > 0 && (
            <p className="rounded-lg bg-store-gold/[0.07] px-3 py-2 text-xs text-store-text-muted">
              {formatPrice(500000)} dan oshsa — yetkazish bepul
            </p>
          )}
        </div>

        <div className="border-t border-store-border pt-3 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-store-text">Jami</span>
            <span className="text-xl font-bold text-store-gold">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <Link to={ROUTES.CHECKOUT} className="block">
          <Button className="w-full" size="lg">
            Rasmiylashtirish
          </Button>
        </Link>
      </div>
    </div>
  );
}
