import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import type { Category } from "@/types";
import { imgUrl } from "@/constants";

interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function CategoryFormModal({ category, onClose, onSave }: CategoryFormModalProps) {
  const isEdit = category !== null;

  const [nameUz, setNameUz] = useState(category?.name_uz ?? "");
  const [nameRu, setNameRu] = useState(category?.name_ru ?? "");
  const [nameEn, setNameEn] = useState(category?.name_en ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEdit);
  const [sortOrder, setSortOrder] = useState(String(category?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugManual) {
      setSlug(generateSlug(nameUz));
    }
  }, [nameUz, slugManual]);

  const handleNameUzChange = (val: string) => {
    setNameUz(val);
    if (!slugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setSlug(val);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("name_uz", nameUz);
      if (nameRu) fd.append("name_ru", nameRu);
      if (nameEn) fd.append("name_en", nameEn);
      fd.append("slug", slug);
      fd.append("sort_order", sortOrder);
      fd.append("is_active", String(isActive));
      if (imageFile) {
        fd.append("image_uz", imageFile);
      }

      await onSave(fd);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
      const message =
        axiosErr?.response?.data?.detail ??
        axiosErr?.response?.data?.message ??
        "Xatolik yuz berdi";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const existingImageUrl = category?.image_uz ? imgUrl(category.image_uz) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-semibold text-base">
            {isEdit ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
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

        {/* Form wraps both body and footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* name_uz */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Nomi (uz) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nameUz}
                onChange={(e) => handleNameUzChange(e.target.value)}
                required
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {/* name_ru */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Nomi (ru)</label>
              <input
                type="text"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {/* name_en */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Nomi (en)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {/* slug */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full bg-[#111111] border border-white/15 text-white/80 rounded-lg px-3 py-2 text-sm font-mono placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {/* sort_order */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Tartib raqami</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                min={0}
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {/* is_active toggle */}
            <div className="flex items-center justify-between py-1">
              <label className="text-xs font-medium text-white/60">Faol</label>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={[
                  "relative w-10 h-6 rounded-full transition-colors shrink-0",
                  isActive ? "bg-[#C9A45C]" : "bg-white/15",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                    isActive ? "translate-x-4" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Rasm (uz)</label>
              <div className="flex items-start gap-4">
                {(imagePreview || existingImageUrl) && (
                  <div className="shrink-0">
                    <img
                      src={imagePreview ?? existingImageUrl!}
                      alt="preview"
                      className="w-[80px] h-[100px] object-cover rounded-lg border border-white/10"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-white/15 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {imageFile ? imageFile.name : "Fayl tanlash"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
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
