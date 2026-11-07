import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { notificationsService } from "@/services/notifications.service";
import { formatDate, cn } from "@/lib/utils";
import type { Notification } from "@/types";

export function NotificationsTab() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    notificationsService
      .getAll({ limit: 30 })
      .then((res) => setItems(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const unread = items.filter((n) => !n.is_read).length;

  const handleRead = async (n: Notification) => {
    if (n.is_read) return;
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
    try {
      await notificationsService.markRead(n.id);
    } catch {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: false } : i)));
    }
  };

  const handleReadAll = async () => {
    if (busy || unread === 0) return;
    setBusy(true);
    const snapshot = items;
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    try {
      await notificationsService.markAllRead();
    } catch {
      setItems(snapshot);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-xl border border-store-border bg-store-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-store-border bg-store-card py-16 text-center">
        <p className="text-[13px] text-store-text-muted">Xabarlarni yuklab bo&apos;lmadi.</p>
        <button onClick={load} className="mt-3 text-[12.5px] font-medium text-store-gold hover:underline">
          Qayta urinish
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-store-border bg-store-card py-20 text-center">
        <div className="rounded-full border border-store-border bg-store-surface p-5">
          <Bell size={34} strokeWidth={1.4} className="text-store-text-dim" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-[22px] font-medium text-store-text">Xabarlar yo&apos;q</h2>
          <p className="text-[13px] text-store-text-muted">
            Buyurtma holati o&apos;zgarganda shu yerda xabar chiqadi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[12.5px] text-store-text-muted">{unread} ta o&apos;qilmagan xabar</p>
          <button
            onClick={handleReadAll}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-store-gold transition-opacity hover:opacity-75 disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Barchasini o&apos;qilgan deb belgilash
          </button>
        </div>
      )}

      {items.map((n) => (
        <button
          key={n.id}
          onClick={() => handleRead(n)}
          className={cn(
            "flex w-full items-start gap-4 rounded-xl border bg-store-card px-5 py-4 text-left transition-colors",
            n.is_read
              ? "border-store-border"
              : "border-store-gold/40 hover:border-store-gold"
          )}
        >
          <span
            className={cn(
              "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
              n.is_read ? "bg-store-border" : "bg-store-gold"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className={cn("text-[13px] leading-snug", n.is_read ? "text-store-text-muted" : "font-medium text-store-text")}>
              {n.title}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-store-text-muted">{n.body}</p>
            <p className="mt-1.5 text-[11.5px] text-store-text-dim">{formatDate(n.created_at)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
