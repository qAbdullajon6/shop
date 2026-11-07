import { useState, useEffect, useCallback } from "react";
import { adminOrdersService } from "@/services/admin/adminOrders.service";
import type { Order, OrderStatus, PaymentStatus } from "@/types";
import { cn } from "@/lib/utils";
import { imgUrl } from "@/constants";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  PROCESSING: "Tayyorlanmoqda",
  READY_FOR_DELIVERY: "Yetkazishga tayyor",
  OUT_FOR_DELIVERY: "Yo'lda",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi",
  RETURNED: "Qaytarildi",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED:          "bg-sky-500/10 text-sky-400 border-sky-500/20",
  PROCESSING:         "bg-blue-500/10 text-blue-400 border-blue-500/20",
  READY_FOR_DELIVERY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OUT_FOR_DELIVERY:   "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED:          "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED:          "bg-red-500/10 text-red-400 border-red-500/20",
  RETURNED:           "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "To'lanmagan",
  PAID: "To'langan",
  PARTIALLY_PAID: "Qisman to'langan",
  REFUNDED: "Qaytarildi",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  UNPAID:         "text-red-400",
  PAID:           "text-green-400",
  PARTIALLY_PAID: "text-yellow-400",
  REFUNDED:       "text-orange-400",
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:            ["CONFIRMED", "CANCELLED"],
  CONFIRMED:          ["PROCESSING", "CANCELLED"],
  PROCESSING:         ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY:   ["DELIVERED"],
  DELIVERED:          [],
  CANCELLED:          [],
  RETURNED:           [],
};

const STATUS_FILTER_OPTIONS: Array<{ value: OrderStatus | ""; label: string }> = [
  { value: "", label: "Barchasi" },
  { value: "PENDING", label: "Yangi" },
  { value: "CONFIRMED", label: "Tasdiqlangan" },
  { value: "PROCESSING", label: "Tayyorlanmoqda" },
  { value: "READY_FOR_DELIVERY", label: "Yetkazishga tayyor" },
  { value: "OUT_FOR_DELIVERY", label: "Yo'lda" },
  { value: "DELIVERED", label: "Yetkazildi" },
  { value: "CANCELLED", label: "Bekor qilindi" },
];

function formatAmount(v: string | undefined) {
  if (!v) return "—";
  return Number(v).toLocaleString("ru-RU") + " so'm";
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrdersService.getAll({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setOrders(res.data);
      setTotal(res.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (updatingId) return;
    setUpdatingId(order.id);
    try {
      const updated = await adminOrdersService.updateStatus(order.id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch {
      /* keep order as-is */
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (order: Order, payment_status: PaymentStatus) => {
    if (updatingId) return;
    setUpdatingId(order.id);
    try {
      const updated = await adminOrdersService.updatePaymentStatus(order.id, payment_status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch {
      /* keep order as-is */
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Buyurtmalar</h2>
          {!loading && (
            <span className="text-xs text-white/30">{total} ta</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              statusFilter === opt.value
                ? "bg-[#C9A45C]/15 text-[#C9A45C] border-[#C9A45C]/30"
                : "text-white/50 border-white/10 hover:text-white hover:bg-white/5"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Raqam</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Mijoz</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Summa</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Holat</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">To'lov</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Sana</th>
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-white/30 text-sm">
                  Buyurtmalar topilmadi
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-[#C9A45C] font-mono text-xs">{order.order_number}</span>
                    </td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <span className="text-white text-sm block">{order.customer_name || order.user.name || "—"}</span>
                      <span className="text-white/40 text-xs">{order.customer_phone}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-white text-sm tabular-nums">{formatAmount(order.total_amount)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_COLORS[order.status])}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-xs font-medium", PAYMENT_STATUS_COLORS[order.payment_status])}>
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-white/40 text-xs">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <svg
                        className={cn("w-4 h-4 text-white/30 transition-transform", expandedId === order.id && "rotate-180")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>

                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`} className="border-b border-white/10 bg-[#111111]">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {/* Items */}
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Mahsulotlar</p>
                            <ul className="space-y-2">
                              {order.items.map((item) => (
                                <li key={item.id} className="flex items-center gap-2.5">
                                  {item.image_url && (
                                    <img src={imgUrl(item.image_url) ?? ""} alt="" className="w-8 h-8 rounded object-cover bg-white/5" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-white text-xs truncate">{item.product_name}</p>
                                    <p className="text-white/40 text-[11px]">
                                      {item.variant_volume && `${item.variant_volume} · `}
                                      {item.quantity} dona · {formatAmount(item.unit_price)}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Address */}
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Manzil</p>
                            {order.ship_city ? (
                              <p className="text-white/70 text-xs leading-relaxed">
                                {[order.ship_city, order.ship_district, order.ship_street].filter(Boolean).join(", ")}
                              </p>
                            ) : (
                              <p className="text-white/30 text-xs">Manzil ko'rsatilmagan</p>
                            )}
                            {order.delivery_name && (
                              <p className="text-white/40 text-[11px] mt-1">{order.delivery_name}</p>
                            )}
                            {order.notes && (
                              <p className="text-white/50 text-xs mt-2 italic">"{order.notes}"</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Holat o'zgartirish</p>
                            <div className="space-y-2">
                              {STATUS_TRANSITIONS[order.status].length > 0 ? (
                                STATUS_TRANSITIONS[order.status].map((nextStatus) => (
                                  <button
                                    key={nextStatus}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(order, nextStatus); }}
                                    disabled={updatingId === order.id}
                                    className={cn(
                                      "w-full px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors text-left disabled:opacity-50",
                                      nextStatus === "CANCELLED"
                                        ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                        : "border-[#C9A45C]/30 text-[#C9A45C] hover:bg-[#C9A45C]/10"
                                    )}
                                  >
                                    → {STATUS_LABELS[nextStatus]}
                                  </button>
                                ))
                              ) : (
                                <p className="text-white/30 text-xs">Holat yakuniy</p>
                              )}

                              {/* Payment status */}
                              {order.payment_status === "UNPAID" && order.status === "DELIVERED" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePaymentStatusChange(order, "PAID"); }}
                                  disabled={updatingId === order.id}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                                >
                                  ✓ To'langan deb belgilash
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/30">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
            >
              ←
            </button>
            <span className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/70 select-none">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
