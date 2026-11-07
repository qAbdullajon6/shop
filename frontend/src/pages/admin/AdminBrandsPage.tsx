import { useState, useEffect, useCallback, type FormEvent } from "react";
import { adminBrandsService } from "@/services/admin/adminBrands.service";
import type { Brand } from "@/types";
import { imgUrl } from "@/constants";
import { cn } from "@/lib/utils";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

interface BrandFormData {
  name: string;
  slug: string;
  country: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  is_active: boolean;
  logo: File | null;
}

const EMPTY_FORM: BrandFormData = {
  name: "", slug: "", country: "",
  description_uz: "", description_ru: "", description_en: "",
  is_active: true, logo: null,
};

function BrandFormModal({
  brand,
  onClose,
  onSave,
}: {
  brand: Brand | null;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
}) {
  const [form, setForm] = useState<BrandFormData>(() =>
    brand ? {
      name: brand.name, slug: brand.slug, country: brand.country ?? "",
      description_uz: brand.description_uz ?? "", description_ru: brand.description_ru ?? "",
      description_en: brand.description_en ?? "", is_active: brand.is_active, logo: null,
    } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const logoPreview = brand?.logo ? imgUrl(brand.logo) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Brend nomi kiritilishi shart"); return; }
    setSaving(true);
    setError("");
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("slug", form.slug.trim() || slugify(form.name.trim()));
    if (form.country) fd.append("country", form.country);
    if (form.description_uz) fd.append("description_uz", form.description_uz);
    if (form.description_ru) fd.append("description_ru", form.description_ru);
    if (form.description_en) fd.append("description_en", form.description_en);
    fd.append("is_active", String(form.is_active));
    if (form.logo) fd.append("logo", form.logo);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1A1A1A]">
          <h3 className="text-white font-semibold">{brand ? "Brendni tahrirlash" : "Yangi brend"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Logo (ixtiyoriy)</label>
            {logoPreview && !form.logo && (
              <img src={logoPreview} alt="" className="w-16 h-16 object-contain rounded-lg bg-white/5 border border-white/10 mb-2" />
            )}
            <input
              type="file" accept="image/*"
              onChange={(e) => setForm((f) => ({ ...f, logo: e.target.files?.[0] ?? null }))}
              className="w-full text-xs text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#C9A45C]/15 file:text-[#C9A45C] file:text-xs cursor-pointer"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Nomi *</label>
            <input
              required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
              className="w-full px-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-[#C9A45C]/50"
              placeholder="Chanel"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              className="w-full px-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm text-white/60 placeholder-white/20 outline-none focus:border-[#C9A45C]/50 font-mono"
              placeholder="chanel"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Mamlakat</label>
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-[#C9A45C]/50"
              placeholder="Fransiya"
            />
          </div>

          {/* Description UZ */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Tavsif (UZ)</label>
            <textarea
              value={form.description_uz} rows={2}
              onChange={(e) => setForm((f) => ({ ...f, description_uz: e.target.value }))}
              className="w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-[#C9A45C]/50 resize-none"
            />
          </div>

          {/* is_active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-[#C9A45C]"
            />
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

export function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Brand | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      setBrands(await adminBrandsService.getAll());
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleSave = async (fd: FormData) => {
    if (editTarget) {
      await adminBrandsService.update(editTarget.id, fd);
    } else {
      await adminBrandsService.create(fd);
    }
    await fetchBrands();
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminBrandsService.remove(deleteConfirmId);
      setDeleteConfirmId(null);
      await fetchBrands();
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
          <h2 className="text-xl font-semibold text-white">Brendlar</h2>
          {!loading && <span className="text-xs text-white/30">{brands.length} ta</span>}
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A45C] text-black font-semibold rounded-lg text-sm hover:bg-[#d4b06a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yangi brend
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider w-12">Logo</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Nomi</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Mamlakat</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Holati</th>
              <th className="px-3 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-3 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : brands.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-white/30 text-sm">Brendlar mavjud emas</td></tr>
            ) : (
              brands.map((brand) => {
                const logo = brand.logo ? imgUrl(brand.logo) : null;
                return (
                  <tr key={brand.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5">
                      {logo ? (
                        <img src={logo} alt="" className="w-9 h-9 object-contain rounded-lg bg-white/5 border border-white/10" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-white/20 text-xs font-bold">{brand.name[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-white font-medium">{brand.name}</span>
                      <span className="text-white/30 text-xs block font-mono">{brand.slug}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-white/50 text-sm">{brand.country ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {brand.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />Nofaol
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditTarget(brand); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" title="Tahrirlash">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteConfirmId(brand.id)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors" title="O'chirish">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <BrandFormModal brand={editTarget} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">Brendni o'chirish</h3>
            <p className="text-white/50 text-sm mb-6">
              Brendga tegishli mahsulotlar mavjud bo'lsa, o'chirish rad etiladi.
            </p>
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
