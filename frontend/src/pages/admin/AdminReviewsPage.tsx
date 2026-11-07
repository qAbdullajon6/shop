import { useState, useEffect, useCallback } from "react";
import { adminReviewsService } from "@/services/admin/adminReviews.service";
import type { Review, ReviewStatus } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

const STATUS_COLORS: Record<ReviewStatus, string> = {
  PENDING:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_FILTER_OPTIONS: Array<{ value: ReviewStatus | ""; label: string }> = [
  { value: "", label: "Barchasi" },
  { value: "PENDING", label: "Kutilmoqda" },
  { value: "APPROVED", label: "Tasdiqlangan" },
  { value: "REJECTED", label: "Rad etilgan" },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="text-[#C9A45C] text-xs">{"★".repeat(value)}{"☆".repeat(5 - value)}</span>
  );
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "">("");
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminReviewsService.getAll({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setReviews(res.data);
      setTotal(res.total);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleModerate = async (review: Review, status: ReviewStatus) => {
    if (moderatingId) return;
    setModeratingId(review.id);
    try {
      const updated = await adminReviewsService.moderate(review.id, status);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      /* keep as-is */
    } finally {
      setModeratingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminReviewsService.remove(deleteConfirmId);
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirmId));
      setTotal((t) => t - 1);
      setDeleteConfirmId(null);
    } catch {
      /* keep dialog open */
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const authorName = (r: Review) => [r.user.name, r.user.last_name].filter(Boolean).join(" ") || "Mijoz";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Sharhlar</h2>
          {!loading && <span className="text-xs text-white/30">{total} ta</span>}
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

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-[88px] bg-[#1A1A1A] border border-white/10 rounded-xl animate-pulse" />
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl py-16 text-center">
            <p className="text-white/30 text-sm">Sharhlar topilmadi</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-4">
                {/* Left: author + rating + comment */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-white text-sm font-medium">{authorName(review)}</span>
                    {review.is_verified && (
                      <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        ✓ Tasdiqlangan xaridor
                      </span>
                    )}
                    <Stars value={review.rating} />
                    {review.product && (
                      <span className="text-white/40 text-xs">{review.product.name_uz}</span>
                    )}
                    <span className="ml-auto text-white/30 text-xs">{formatDate(review.created_at)}</span>
                  </div>

                  {review.title && (
                    <p className="text-white/80 text-sm font-medium mb-0.5">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{review.comment}</p>
                  )}
                </div>

                {/* Right: status + actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_COLORS[review.status])}>
                    {STATUS_LABELS[review.status]}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {review.status !== "APPROVED" && (
                      <button
                        onClick={() => handleModerate(review, "APPROVED")}
                        disabled={moderatingId === review.id}
                        title="Tasdiqlash"
                        className="p-1.5 rounded-lg text-white/30 hover:text-green-400 hover:bg-green-400/5 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    {review.status !== "REJECTED" && (
                      <button
                        onClick={() => handleModerate(review, "REJECTED")}
                        disabled={moderatingId === review.id}
                        title="Rad etish"
                        className="p-1.5 rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-400/5 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(review.id)}
                      title="O'chirish"
                      className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/30">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">←</button>
            <span className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/70 select-none">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">→</button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">Sharhni o'chirish</h3>
            <p className="text-white/50 text-sm mb-6">Bu sharhni o'chirsangiz, uni qayta tiklash mumkin emas.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/20 font-semibold rounded-lg text-sm hover:bg-red-500/25 transition-colors disabled:opacity-60">
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
