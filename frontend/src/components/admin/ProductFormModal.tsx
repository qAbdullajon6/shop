import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Product, Category, Brand } from "@/types";
import { imgUrl } from "@/constants";
import { categoriesService } from "@/services/categories.service";
import { brandsService } from "@/services/brands.service";

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

function genSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function genSku(slug: string): string {
  return slug.replace(/-/g, "-").toUpperCase().substring(0, 24);
}

export function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const isEdit = product !== null;

  const [nameUz, setNameUz] = useState(product?.name_uz ?? "");
  const [nameRu, setNameRu] = useState(product?.name_ru ?? "");
  const [nameEn, setNameEn] = useState(product?.name_en ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEdit);
  const [descUz, setDescUz] = useState(product?.description_uz ?? "");
  const [categoryId, setCategoryId] = useState(product?.category.id ?? "");
  const [brandId, setBrandId] = useState(product?.brand?.id ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);

  // Variant fields (create only — edit mode skips these)
  const [sku, setSku] = useState("");
  const [volume, setVolume] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesService.getAll().then(setCategories).catch(() => {});
    brandsService.getAll().then(setBrands).catch(() => {});
  }, []);

  // Auto-slug from name_uz
  useEffect(() => {
    if (!slugManual) {
      const s = genSlug(nameUz);
      setSlug(s);
      if (!isEdit && !sku.trim()) setSku(genSku(s));
    }
  }, [nameUz, slugManual, isEdit]);

  const handleNameUz = (v: string) => {
    setNameUz(v);
    if (!slugManual) {
      const s = genSlug(v);
      setSlug(s);
      if (!isEdit) setSku(genSku(s));
    }
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) { setError("Kategoriya tanlang"); return; }
    if (!isEdit && !price) { setError("Narxni kiriting"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name_uz", nameUz);
      if (nameRu) fd.append("name_ru", nameRu);
      if (nameEn) fd.append("name_en", nameEn);
      fd.append("slug", slug);
      if (descUz) fd.append("description_uz", descUz);
      fd.append("category_id", categoryId);
      if (brandId) fd.append("brand_id", brandId);
      fd.append("is_active", String(isActive));
      fd.append("is_bestseller", String(isBestseller));

      if (!isEdit) {
        const variant = {
          sku: sku || genSku(slug),
          price,
          stock: Number(stock),
          ...(volume ? { volume } : {}),
          is_active: true,
        };
        fd.append("variants", JSON.stringify([variant]));
      }

      if (imageFile) fd.append("images", imageFile);

      await onSave(fd);
      onClose();
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { message?: string | string[]; detail?: string } } };
      const msg = ae?.response?.data?.detail
        ?? (Array.isArray(ae?.response?.data?.message)
          ? ae.response!.data!.message!.join("; ")
          : ae?.response?.data?.message)
        ?? "Xatolik yuz berdi";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const existingThumb = product?.images?.[0]?.url
    ? imgUrl(product.images[0].url)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-semibold text-base">
            {isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Nomi (uz) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nameUz}
                  onChange={(e) => handleNameUz(e.target.value)}
                  required
                  className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Nomi (ru)</label>
                <input
                  type="text"
                  value={nameRu}
                  onChange={(e) => setNameRu(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Nomi (en)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                />
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                className="w-full bg-[#111111] border border-white/15 text-white/80 rounded-lg px-3 py-2 text-sm font-mono placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Tavsif (uz)</label>
              <textarea
                value={descUz}
                onChange={(e) => setDescUz(e.target.value)}
                rows={3}
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors resize-none"
              />
            </div>

            {/* Category + Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Kategoriya <span className="text-red-400">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                >
                  <option value="">— tanlang —</option>
                  {categories
                    .filter((c) => c.is_active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name_uz}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Brend</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                >
                  <option value="">— yo'q —</option>
                  {brands
                    .filter((b) => b.is_active)
                    .map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Variant fields — create only */}
            {!isEdit && (
              <div className="border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Asosiy variant</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      SKU <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required={!isEdit}
                      placeholder="CHANEL-NO5-50ML"
                      className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm font-mono placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Hajm</label>
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="50ml"
                      className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Narx (so'm) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required={!isEdit}
                      min={0}
                      placeholder="350000"
                      className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Qoldiq (dona)</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min={0}
                      className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-medium text-white/60">Faol</label>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={[
                    "relative w-10 h-6 rounded-full transition-colors shrink-0",
                    isActive ? "bg-[#C9A45C]" : "bg-white/15",
                  ].join(" ")}
                >
                  <span className={["absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", isActive ? "translate-x-4" : "translate-x-0"].join(" ")} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#C9A45C]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  Bestseller
                </label>
                <button
                  type="button"
                  onClick={() => setIsBestseller((v) => !v)}
                  className={[
                    "relative w-10 h-6 rounded-full transition-colors shrink-0",
                    isBestseller ? "bg-[#C9A45C]" : "bg-white/15",
                  ].join(" ")}
                >
                  <span className={["absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", isBestseller ? "translate-x-4" : "translate-x-0"].join(" ")} />
                </button>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                {isEdit ? "Yangi rasm (ixtiyoriy)" : "Rasm"}
              </label>
              <div className="flex items-start gap-4">
                {(imagePreview || existingThumb) && (
                  <img
                    src={imagePreview ?? existingThumb!}
                    alt="preview"
                    className="w-16 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                  />
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-white/15 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {imageFile ? imageFile.name : "Fayl tanlash"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="mt-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
                    >
                      Olib tashlash
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#C9A45C] text-black font-semibold rounded-lg text-sm hover:bg-[#d4b06a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
