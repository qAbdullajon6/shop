import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown, Loader2 } from "lucide-react";
import { ordersService } from "@/services/orders.service";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { imgUrl, ROUTES } from "@/constants";
import type { Order, OrderStatus } from "@/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:            "Kutilmoqda",
  CONFIRMED:          "Tasdiqlandi",
  PROCESSING:         "Tayyorlanmoqda",
  READY_FOR_DELIVERY: "Yuborishga tayyor",
  OUT_FOR_DELIVERY:   "Yo'lda",
  DELIVERED:          "Yetkazildi",
  CANCELLED:          "Bekor qilindi",
  RETURNED:           "Qaytarildi",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING:            "bg-amber-500/10 text-amber-600 border-amber-500/25",
  CONFIRMED:          "bg-store-gold/10 text-store-gold border-store-gold/30",
  PROCESSING:         "bg-store-gold/10 text-store-gold border-store-gold/30",
  READY_FOR_DELIVERY: "bg-sky-500/10 text-sky-600 border-sky-500/25",
  OUT_FOR_DELIVERY:   "bg-sky-500/10 text-sky-600 border-sky-500/25",
  DELIVERED:          "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
  CANCELLED:          "bg-red-500/10 text-red-500 border-red-500/25",
  RETURNED:           "bg-red-500/10 text-red-500 border-red-500/25",
};

/* Bekor qilish faqat yo'lga chiqmagan buyurtmalarda mumkin */
const CANCELLABLE: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING"];

const num = (v: string | number) => parseFloat(String(v)) || 0;

function OrderCard({ order, onCancelled }: { order: Order; onCancelled: (o: Order) => void }) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    setError("");
    try {
      const updated = await ordersService.cancel(order.id);
      onCancelled(updated);
    } catch {
      setError("Bekor qilib bo'lmadi. Qo'llab-quvvatlash bilan bog'laning.");
    } finally {
      setCancelling(false);
    }
  };

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-store-border bg-store-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-store-surface/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[13px] font-medium text-store-text">
              № {order.order_number}
            </span>
            <span
              className={cn(
                "rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                STATUS_STYLE[order.status]
              )}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-store-text-muted">
            {formatDate(order.created_at)} · {itemCount} ta mahsulot
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="text-[15px] font-bold text-store-text">
            {formatPrice(num(order.total_amount))}
          </span>
          <ChevronDown
            size={16}
            className={cn("text-store-text-dim transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-store-border px-5 py-5">
          <ul className="space-y-4">
            {order.items.map((item) => {
              const image = imgUrl(item.image_url) ?? "/placeholder.svg";
              const productHref = item.product_slug ? `${ROUTES.PRODUCTS}/${item.product_slug}` : "#";
              return (
                <li key={item.id} className="flex items-center gap-4">
                  <Link
                    to={productHref}
                    className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-store-border bg-store-surface"
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-1.5"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={productHref}
                      className="line-clamp-2 text-[13px] font-medium text-store-text transition-colors hover:text-store-gold"
                    >
                      {item.product_name}
                    </Link>
                    <p className="mt-0.5 text-[11.5px] text-store-text-dim">
                      {item.quantity} × {formatPrice(num(item.unit_price))}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[13px] font-medium text-store-text">
                    {formatPrice(num(item.unit_price) * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 space-y-1.5 border-t border-store-border pt-4 text-[12.5px]">
            {order.address && (
              <div className="flex justify-between gap-4">
                <span className="flex-shrink-0 text-store-text-muted">Yetkazib berish manzili</span>
                <span className="text-right text-store-text">
                  {order.address.city}
                  {order.address.district ? `, ${order.address.district}` : ""}, {order.address.street}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-store-text-muted">Qabul qiluvchi</span>
              <span className="text-right text-store-text">
                {[order.user.name, order.user.last_name].filter(Boolean).join(" ") || "—"} ·{" "}
                {order.user.phone_number}
              </span>
            </div>
            {num(order.shipping_fee) > 0 && (
              <div className="flex justify-between">
                <span className="text-store-text-muted">Yetkazib berish</span>
                <span className="text-store-text">{formatPrice(num(order.shipping_fee))}</span>
              </div>
            )}
            {num(order.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-store-text-muted">Chegirma</span>
                <span className="text-store-gold">− {formatPrice(num(order.discount_amount))}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex justify-between gap-4">
                <span className="flex-shrink-0 text-store-text-muted">Izoh</span>
                <span className="text-right text-store-text">{order.notes}</span>
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-[12.5px] text-red-500">{error}</p>}

          {CANCELLABLE.includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-red-500/40 px-5 text-[12.5px] font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              {cancelling && <Loader2 size={14} className="animate-spin" />}
              Buyurtmani bekor qilish
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    ordersService
      .getAll({ limit: 20 })
      .then((res) => setOrders(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancelled = (updated: Order) =>
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-xl border border-store-border bg-store-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-store-border bg-store-card py-16 text-center">
        <p className="text-[13px] text-store-text-muted">Buyurtmalarni yuklab bo&apos;lmadi.</p>
        <button onClick={load} className="mt-3 text-[12.5px] font-medium text-store-gold hover:underline">
          Qayta urinish
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-store-border bg-store-card py-20 text-center">
        <div className="rounded-full border border-store-border bg-store-surface p-5">
          <Package size={34} strokeWidth={1.4} className="text-store-text-dim" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-[22px] font-medium text-store-text">
            Hali buyurtmalaringiz yo&apos;q
          </h2>
          <p className="text-[13px] text-store-text-muted">
            Birinchi buyurtmangizni katalogdan boshlang
          </p>
        </div>
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex h-11 items-center rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} onCancelled={handleCancelled} />
      ))}
    </div>
  );
}
