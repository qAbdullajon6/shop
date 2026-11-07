import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types";
import { adminProductsService } from "@/services/admin/adminProducts.service";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { imgUrl } from "@/constants";
import { cn } from "@/lib/utils";

function getThumb(p: Product): string | null {
  return imgUrl(p.images[0]?.url ?? null);
}

function getPrice(p: Product): string {
  const price = p.variants[0]?.price;
  if (!price) return "—";
  return Number(price).toLocaleString("ru-RU") + " so'm";
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductsService.getAll();
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleToggleBestseller = async (product: Product) => {
    if (togglingId) return;
    setTogglingId(product.id);
    const prev = [...products];
    setProducts((ps) =>
      ps.map((p) => (p.id === product.id ? { ...p, is_bestseller: !p.is_bestseller } : p))
    );
    try {
      await adminProductsService.toggleBestseller(product.id, !product.is_bestseller);
    } catch {
      setProducts(prev);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminProductsService.remove(deleteConfirmId);
      setDeleteConfirmId(null);
      await fetchProducts();
    } catch {
      /* keep dialog open */
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    if (editTarget) {
      await adminProductsService.update(editTarget.id, formData);
    } else {
      await adminProductsService.create(formData);
    }
    await fetchProducts();
  };

  const bestsellersCount = products.filter((p) => p.is_bestseller).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Mahsulotlar</h2>
          {!loading && (
            <span className="text-xs text-white/30">
              {products.length} ta •{" "}
              <span className="text-[#C9A45C]">{bestsellersCount} bestseller</span>
            </span>
          )}
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A45C] text-black font-semibold rounded-lg text-sm hover:bg-[#d4b06a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yangi mahsulot
        </button>
      </div>

      <p className="text-xs text-white/30 mb-4 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-[#C9A45C]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        Yulduzcha bosib mahsulotni bosh sahifadagi Bestseller bo'limiga qo'shing yoki olib tashlang
      </p>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider w-14">Rasm</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Nomi</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Kategoriya</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Narxi</th>
              <th className="text-center px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider w-24">Bestseller</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Holati</th>
              <th className="px-3 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-white/30 text-sm">
                  Mahsulotlar mavjud emas
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const thumb = getThumb(product);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Thumb */}
                    <td className="px-3 py-2.5">
                      {thumb ? (
                        <img src={thumb} alt={product.name_uz} className="w-10 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-10 h-12 rounded-lg bg-white/5 border border-white/10" />
                      )}
                    </td>

                    {/* Name + brand */}
                    <td className="px-3 py-2.5 max-w-[220px]">
                      <span className="text-white font-medium text-sm line-clamp-2 block">{product.name_uz}</span>
                      {product.brand && (
                        <span className="text-white/40 text-xs">{product.brand.name}</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-3 py-2.5">
                      <span className="text-white/50 text-xs">{product.category.name_uz}</span>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-2.5">
                      <span className="text-white/70 text-sm tabular-nums whitespace-nowrap">{getPrice(product)}</span>
                    </td>

                    {/* Bestseller star */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => handleToggleBestseller(product)}
                        disabled={togglingId === product.id}
                        title={product.is_bestseller ? "Bestseller — bosing o'chirish uchun" : "Bestseller qilish"}
                        className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                          product.is_bestseller
                            ? "text-[#C9A45C] hover:bg-[#C9A45C]/10"
                            : "text-white/20 hover:text-white/50 hover:bg-white/5",
                          togglingId === product.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill={product.is_bestseller ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      {product.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />Nofaol
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditTarget(product); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                          title="Tahrirlash"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                          title="O'chirish"
                        >
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

      {/* Form modal */}
      {modalOpen && (
        <ProductFormModal
          product={editTarget}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-white/50 text-sm mb-6">
              Bu mahsulotni o'chirsangiz, uni qayta tiklash mumkin emas.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/20 font-semibold rounded-lg text-sm hover:bg-red-500/25 transition-colors disabled:opacity-60"
              >
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
