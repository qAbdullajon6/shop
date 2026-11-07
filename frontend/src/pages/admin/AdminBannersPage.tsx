import { useState, useEffect, useCallback, type FormEvent } from "react";
import { adminBannersService } from "@/services/admin/adminBanners.service";
import type { Banner } from "@/types";
import { imgUrl } from "@/constants";
import { cn } from "@/lib/utils";

interface BannerFormData {
  title_uz: string;
  title_ru: string;
  title_en: string;
  subtitle_uz: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  image_uz: File | null;
  image_ru: File | null;
  image_en: File | null;
}

const EMPTY_FORM: BannerFormData = {
  title_uz: "", title_ru: "", title_en: "", subtitle_uz: "", link: "",
  sort_order: 0, is_active: true,
  image_uz: null, image_ru: null, image_en: null,
};

function BannerFormModal({
  banner,
  onClose,
  onSave,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
}) {
  const [form, setForm] = useState<BannerFormData>(() =>
    banner ? {
      title_uz: banner.title_uz ?? "", title_ru: banner.title_ru ?? "",
      title_en: banner.title_en ?? "", subtitle_uz: "",
      link: banner.link ?? "", sort_order: banner.sort_order, is_active: banner.is_active,
      image_uz: null, image_ru: null, image_en: null,
    } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData();
    if (form.title_uz) fd.append("title_uz", form.title_uz);
    if (form.title_ru) fd.append("title_ru", form.title_ru);
    if (form.title_en) fd.append("title_en", form.title_en);
    if (form.subtitle_uz) fd.append("subtitle_uz", form.subtitle_uz);
    if (form.link) fd.append("link", form.link);
    fd.append("sort_order", String(form.sort_order));
    fd.append("is_active", String(form.is_active));
    if (form.image_uz) fd.append("image_uz", form.image_uz);
    if (form.image_ru) fd.append("image_ru", form.image_ru);
    if (form.image_en) fd.append("image_en", form.image_en);
    try {
      await onSave(fd);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Xato yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, value, onChange, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-[#C9A45C]/50" />
    </div>
  );

  const FileField = ({ label, onChange, current }: {
    label: string; onChange: (f: File | null) => void; current: string | null;
  }) => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      {current && (
        <img src={imgUrl(current) ?? ""} alt="" className="h-16 w-full object-cover rounded-lg bg-white/5 border border-white/10 mb-1.5" />
      )}
      <input type="file" accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full text-xs text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#C9A45C]/15 file:text-[#C9A45C] file:text-xs cursor-pointer" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1A1A1A]">
          <h3 className="text-white font-semibold">{banner ? "Bannerni tahrirlash" : "Yangi banner"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FileField label="Rasm (UZ)" onChange={(f) => setForm((v) => ({ ...v, image_uz: f }))} current={banner?.image_uz ?? null} />
          <FileField label="Rasm (RU)" onChange={(f) => setForm((v) => ({ ...v, image_ru: f }))} current={banner?.image_ru ?? null} />
          <FileField label="Rasm (EN)" onChange={(f) => setForm((v) => ({ ...v, image_en: f }))} current={banner?.image_en ?? null} />

          <Field label="Sarlavha (UZ)" value={form.title_uz} onChange={(v) => setForm((f) => ({ ...f, title_uz: v }))} placeholder="Yozgi chegirmalar" />
          <Field label="Sarlavha (RU)" value={form.title_ru} onChange={(v) => setForm((f) => ({ ...f, title_ru: v }))} placeholder="Летние скидки" />
          <Field label="Havola" value={form.link} onChange={(v) => setForm((f) => ({ ...f, link: v }))} placeholder="/products?sale=true" />

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Tartibi</label>
            <input type="number" value={form.sort_order} min={0}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              className="w-24 px-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm text-white outline-none focus:border-[#C9A45C]/50" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-[#C9A45C]" />
            <span className="text-sm text-white/70">Faol</span>
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#C9A45C] text-black font-semibold rounded-lg text-sm hover:bg-[#d4b06a] transition-colors disabled:opacity-60">
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      setBanners(await adminBannersService.getAll());
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleSave = async (fd: FormData) => {
    if (editTarget) {
      await adminBannersService.update(editTarget.id, fd);
    } else {
      await adminBannersService.create(fd);
    }
    await fetchBanners();
  };

  const handleToggleActive = async (banner: Banner) => {
    if (togglingId) return;
    setTogglingId(banner.id);
    const prev = [...banners];
    setBanners((bs) => bs.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b)));
    try {
      const fd = new FormData();
      fd.append("is_active", String(!banner.is_active));
      await adminBannersService.update(banner.id, fd);
    } catch {
      setBanners(prev);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminBannersService.remove(deleteConfirmId);
      setDeleteConfirmId(null);
      await fetchBanners();
    } catch {
      /* keep dialog open */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Bannerlar</h2>
          {!loading && <span className="text-xs text-white/30">{banners.length} ta</span>}
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A45C] text-black font-semibold rounded-lg text-sm hover:bg-[#d4b06a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yangi banner
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[140px] bg-[#1A1A1A] border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm">Bannerlar mavjud emas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {banners.map((banner) => {
            const thumb = banner.image_uz ? imgUrl(banner.image_uz) : null;
            return (
              <div key={banner.id} className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative h-[120px] bg-white/5">
                  {thumb ? (
                    <img src={thumb} alt={banner.title_uz ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">Rasm yo'q</div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                      banner.is_active
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-white/10 text-white/40 border-white/10"
                    )}>
                      {banner.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex items-center justify-between gap-2 flex-1">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{banner.title_uz ?? "—"}</p>
                    {banner.link && (
                      <p className="text-white/30 text-xs truncate font-mono">{banner.link}</p>
                    )}
                    <p className="text-white/20 text-[11px]">Tartib: {banner.sort_order}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(banner)} disabled={togglingId === banner.id}
                      title={banner.is_active ? "O'chirish" : "Yoqish"}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors disabled:opacity-50",
                        banner.is_active
                          ? "text-white/30 hover:text-red-400 hover:bg-red-400/5"
                          : "text-white/30 hover:text-green-400 hover:bg-green-400/5"
                      )}
                    >
                      {banner.is_active ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    <button onClick={() => { setEditTarget(banner); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" title="Tahrirlash">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteConfirmId(banner.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors" title="O'chirish">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <BannerFormModal banner={editTarget} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">Bannerni o'chirish</h3>
            <p className="text-white/50 text-sm mb-6">Barcha rasmlari ham serverdan o'chiriladi.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className={cn("px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/20 font-semibold rounded-lg text-sm hover:bg-red-500/25 transition-colors", deleting && "opacity-60")}>
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
