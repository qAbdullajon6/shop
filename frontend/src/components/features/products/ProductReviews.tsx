import { useEffect, useState, useMemo, type FormEvent } from "react";
import { Star, BadgeCheck, Loader2, MessageSquarePlus } from "lucide-react";
import { reviewsService } from "@/services/reviews.service";
import { ordersService } from "@/services/orders.service";
import { useAuthStore } from "@/store/authStore";
import { usePhoneAuthStore } from "@/store/phoneAuthStore";
import { formatDate, cn } from "@/lib/utils";
import type { Review } from "@/types";

const PAGE_SIZE = 10;

/* Tailwind arbitrary kengliklar build vaqtida statik bo'lishi kerak, shuning uchun
   foiz 5% qadamga yaxlitlanib, tayyor sinflardan biri tanlanadi. */
const BAR_WIDTH = [
  "w-0",      "w-[5%]",  "w-[10%]", "w-[15%]", "w-[20%]",
  "w-[25%]",  "w-[30%]", "w-[35%]", "w-[40%]", "w-[45%]",
  "w-[50%]",  "w-[55%]", "w-[60%]", "w-[65%]", "w-[70%]",
  "w-[75%]",  "w-[80%]", "w-[85%]", "w-[90%]", "w-[95%]", "w-full",
] as const;

const barWidth = (pct: number) => BAR_WIDTH[Math.round(Math.min(100, Math.max(0, pct)) / 5)];


function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? "fill-store-gold text-store-gold" : "text-store-border"}
        />
      ))}
    </div>
  );
}

/* ── Baho qoldirish formasi ────────────────────────────────────────────── */
function ReviewForm({
  orderItemId,
  onCreated,
  onCancel,
}: {
  orderItemId: string;
  onCreated: (r: Review) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rating || saving) return;
    setSaving(true);
    setError("");
    try {
      const created = await reviewsService.create({
        order_item_id: orderItemId,
        rating,
        comment: comment.trim() || undefined,
      });
      onCreated(created);
    } catch {
      setError(
        "Baho qoldirib bo'lmadi. Bu mahsulotni yetkazib berilgan buyurtmada sotib olgan bo'lishingiz va avval baho bermagan bo'lishingiz kerak."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-store-gold/40 bg-store-card p-6">
      <h3 className="text-[14px] font-medium text-store-text">Bahoyingizni qoldiring</h3>

      <div className="mt-4 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} yulduz`}
            className="p-0.5"
          >
            <Star
              size={26}
              className={
                n <= (hover || rating)
                  ? "fill-store-gold text-store-gold"
                  : "text-store-border"
              }
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-[13px] text-store-text-muted">{rating} / 5</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Mahsulot haqida fikringiz (ixtiyoriy)"
        className="mt-4 w-full resize-none rounded-md border border-store-border bg-store-input px-4 py-3 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
      />

      {error && <p className="mt-3 text-[12.5px] leading-relaxed text-red-500">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={!rating || saving}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Yuborish
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-md border border-store-border px-5 text-[13px] text-store-text-muted transition-colors hover:text-store-text"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}

export function ProductReviews({
  productId,
  avgRating,
  reviewCount,
}: {
  productId: string;
  avgRating: number | null;
  reviewCount: number;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  const openAuth = usePhoneAuthStore((s) => s.open);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(reviewCount);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  /* Baho berish huquqi: mahsulot DELIVERED buyurtmada bo'lishi va hali baho
     berilmagan bo'lishi shart. Backend ham shu shartni majburlaydi; bu yerda
     mos keladigan order_item_id topiladi va formaga uzatiladi. */
  const [reviewableItemId, setReviewableItemId] = useState<string | null>(null);
  const canReview = reviewableItemId !== null;

  useEffect(() => {
    setLoading(true);
    reviewsService
      .getByProduct(productId, page, PAGE_SIZE)
      .then((res) => {
        setReviews((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, page]);

  useEffect(() => {
    if (!isAuthenticated) { setReviewableItemId(null); return; }
    ordersService
      .getAll({ limit: 50 })
      .then((res) => {
        /* Yetkazilgan buyurtmadagi, shu mahsulotga tegishli va hali baho
           berilmagan birinchi order item — aynan shuni baholash mumkin. */
        let itemId: string | null = null;
        for (const o of res.data) {
          if (o.status !== "DELIVERED") continue;
          const item = o.items.find((i) => i.product_id === productId && !i.review);
          if (item) { itemId = item.id; break; }
        }
        setReviewableItemId(itemId);
      })
      .catch(() => setReviewableItemId(null));
  }, [isAuthenticated, productId]);

  const alreadyReviewed = useMemo(
    () => Boolean(userId) && reviews.some((r) => r.user.id === userId),
    [reviews, userId]
  );

  /* Yulduzlar taqsimoti — yuklangan sahifalar asosida */
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1] += 1; });
    return counts;
  }, [reviews]);

  const handleCreated = (r: Review) => {
    setReviews((prev) => [r, ...prev]);
    setTotal((t) => t + 1);
    setFormOpen(false);
    setReviewableItemId(null); // bu xarid endi baholangan
  };

  const showForm = formOpen && canReview && !alreadyReviewed;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
      <div className="min-w-0 space-y-6">
        {/* ── Umumiy baho ─────────────────────────────────────────── */}
        <div className="grid gap-6 rounded-xl border border-store-border bg-store-card p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8">
          <div className="text-center sm:text-left">
            <p className="font-serif text-[44px] leading-none text-store-text">
              {avgRating ? avgRating.toFixed(1) : "—"}
            </p>
            <div className="mt-2 flex justify-center sm:justify-start">
              <Stars value={avgRating ?? 0} size={16} />
            </div>
            <p className="mt-2 text-[12px] text-store-text-muted">
              {total} ta baho asosida
            </p>
          </div>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const c = distribution[star - 1];
              const pct = reviews.length ? Math.round((c / reviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="flex w-7 items-center gap-1 text-[12px] text-store-text-muted">
                    {star}
                    <Star size={11} className="fill-store-gold text-store-gold" />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-store-surface">
                    <div className={cn("h-full rounded-full bg-store-gold", barWidth(pct))} />
                  </div>
                  <span className="w-10 text-right text-[11.5px] tabular-nums text-store-text-dim">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[12px] leading-relaxed text-store-text-dim">
          Fikrlar faqat mahsulotni sotib olgan va buyurtmasi yetkazib berilgan mijozlar tomonidan qoldiriladi.
        </p>

        {/* ── Baho qoldirish ──────────────────────────────────────── */}
        {showForm && reviewableItemId ? (
          <ReviewForm orderItemId={reviewableItemId} onCreated={handleCreated} onCancel={() => setFormOpen(false)} />
        ) : (
          <div className="rounded-xl border border-store-border bg-store-card p-5">
            {!isAuthenticated ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-store-text-muted">
                  Baho qoldirish uchun tizimga kiring.
                </p>
                <button
                  onClick={openAuth}
                  className="inline-flex h-10 items-center rounded-md border border-store-gold px-5 text-[12.5px] font-medium text-store-gold transition-colors hover:bg-store-gold hover:text-white"
                >
                  Tizimga kirish
                </button>
              </div>
            ) : alreadyReviewed ? (
              <p className="text-[13px] text-store-text-muted">
                Siz bu mahsulotga allaqachon baho bergansiz.
              </p>
            ) : canReview ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-store-text">
                  Buyurtmangiz yetkazib berildi — mahsulot yoqdimi?
                </p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-store-gold px-5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageSquarePlus size={15} />
                  Fikr qoldirish
                </button>
              </div>
            ) : (
              <p className="text-[13px] text-store-text-muted">
                Baho qoldirish uchun bu mahsulotni sotib olishingiz va buyurtma yetkazib berilishi kerak.
              </p>
            )}
          </div>
        )}

        {/* ── Fikrlar ro'yxati ────────────────────────────────────── */}
        {loading && reviews.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[110px] animate-pulse rounded-xl border border-store-border bg-store-card" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-store-border bg-store-card py-14 text-center">
            <p className="text-[13px] text-store-text-muted">
              Bu mahsulotga hali fikr bildirilmagan.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => {
              const author = [r.user.name, r.user.last_name].filter(Boolean).join(" ") || "Mijoz";
              const initial = (r.user.name?.[0] ?? "M").toUpperCase();
              return (
                <li key={r.id} className="rounded-xl border border-store-border bg-store-card p-5">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-store-surface text-[14px] font-medium text-store-text-muted">
                      {initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                        <span className="text-[13px] font-medium text-store-text">{author}</span>
                        {r.is_verified && (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                            <BadgeCheck size={11} />
                            Tasdiqlangan xaridor
                          </span>
                        )}
                        <Stars value={r.rating} />
                        <span className="ml-auto text-[11.5px] text-store-text-dim">
                          {formatDate(r.created_at)}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="mt-2.5 text-[13px] leading-relaxed text-store-text-muted">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {page < totalPages && (
          <div className="flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className={cn(
                "inline-flex h-11 items-center rounded-md border border-store-border bg-store-card px-6 text-[13px] text-store-text transition-colors",
                "hover:border-store-gold hover:text-store-gold disabled:opacity-50"
              )}
            >
              {loading ? "Yuklanmoqda..." : "Yana fikrlarni ko'rish"}
            </button>
          </div>
        )}
      </div>

      {/* ── Yon blok ──────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-store-border bg-store-card p-5">
          <h3 className="text-[13px] font-medium text-store-text">
            Mahsulot haqida savolingiz bormi?
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-store-text-muted">
            Operatorlarimiz ish kunlari 09:00 — 21:00 oralig&apos;ida javob beradi.
          </p>
          <a
            href="tel:+998712345678"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-store-border text-[12.5px] text-store-text transition-colors hover:border-store-gold hover:text-store-gold"
          >
            +998 71 234-56-78
          </a>
          <a
            href="https://t.me/zahabi_uz"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-store-gold text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Telegram orqali savol berish
          </a>
        </div>
      </aside>
    </div>
  );
}
