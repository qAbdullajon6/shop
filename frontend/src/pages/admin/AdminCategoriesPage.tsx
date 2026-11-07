import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "@/types";
import { adminCategoriesService } from "@/services/admin/adminCategories.service";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { imgUrl } from "@/constants";

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-white/5 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function DragHandle() {
  return (
    <svg
      className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors cursor-grab active:cursor-grabbing"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

interface SortableRowProps {
  cat: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

function SortableRow({ cat, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  } as React.CSSProperties;

  const thumb = imgUrl(cat.image_uz);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
    >
      {/* Drag handle */}
      <td className="pl-3 pr-1 py-3 w-8">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing"
          title="Tortib joylashtiring"
        >
          <DragHandle />
        </div>
      </td>

      {/* Thumbnail */}
      <td className="px-3 py-3">
        {thumb ? (
          <img
            src={thumb}
            alt={cat.name_uz}
            className="w-[46px] h-[56px] object-cover rounded-lg"
          />
        ) : (
          <div className="w-[46px] h-[56px] rounded-lg bg-gradient-to-br from-[#C9A45C]/15 to-[#C9A45C]/5 border border-white/5" />
        )}
      </td>

      {/* Name */}
      <td className="px-3 py-3">
        <span className="text-white font-medium text-sm">{cat.name_uz}</span>
        {cat.name_ru && (
          <span className="block text-white/40 text-xs mt-0.5">{cat.name_ru}</span>
        )}
      </td>

      {/* Slug */}
      <td className="px-3 py-3">
        <span className="text-white/50 font-mono text-xs">{cat.slug}</span>
      </td>

      {/* Sort order */}
      <td className="px-3 py-3 text-center">
        <span className="text-white/50 text-sm tabular-nums">{cat.sort_order}</span>
      </td>

      {/* Status badge */}
      <td className="px-3 py-3">
        {cat.is_active ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Faol
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            Nofaol
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(cat)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            title="Tahrirlash"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(cat.id)}
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
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCategoriesService.getAll();
      // Sort by sort_order ascending
      setCategories([...data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update — reorder locally and reassign sort_order = index + 1
    const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, i) => ({
      ...cat,
      sort_order: i + 1,
    }));
    setCategories(reordered);

    // Persist only the ones whose sort_order changed
    setSaving(true);
    try {
      const original = categories;
      const changed = reordered.filter((cat, i) => cat.sort_order !== original[i]?.sort_order || cat.id !== original[i]?.id);
      await Promise.all(
        changed.map((cat) => {
          const fd = new FormData();
          fd.append("sort_order", String(cat.sort_order));
          return adminCategoriesService.update(cat.id, fd);
        })
      );
    } catch {
      // rollback on error
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreate = () => { setEditTarget(null); setModalOpen(true); };
  const handleOpenEdit = (cat: Category) => { setEditTarget(cat); setModalOpen(true); };

  const handleSave = async (formData: FormData) => {
    if (editTarget) {
      await adminCategoriesService.update(editTarget.id, formData);
    } else {
      await adminCategoriesService.create(formData);
    }
    await fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await adminCategoriesService.remove(deleteConfirmId);
      setDeleteConfirmId(null);
      await fetchCategories();
    } catch {
      /* keep modal open */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Kategoriyalar</h2>
          {saving && (
            <span className="text-xs text-white/40 animate-pulse">Saqlanmoqda...</span>
          )}
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A45C] text-black font-semibold rounded-lg text-sm hover:bg-[#d4b06a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yangi kategoriya
        </button>
      </div>

      {/* Hint */}
      {!loading && categories.length > 1 && (
        <p className="text-xs text-white/30 mb-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
          Qatorlarni tortib joylashtirib tartibini o'zgartiring
        </p>
      )}

      {/* Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pl-3 pr-1 py-3 w-8" />
                <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Rasm</th>
                <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Nomi</th>
                <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Slug</th>
                <th className="text-center px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Tartib</th>
                <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Holati</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-white/30 text-sm">
                    Kategoriyalar mavjud emas
                  </td>
                </tr>
              ) : (
                <SortableContext
                  items={categories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {categories.map((cat) => (
                    <SortableRow
                      key={cat.id}
                      cat={cat}
                      onEdit={handleOpenEdit}
                      onDelete={setDeleteConfirmId}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </div>
      </DndContext>

      {/* Create/Edit modal */}
      {modalOpen && (
        <CategoryFormModal
          category={editTarget}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-white/50 text-sm mb-6">
              Bu kategoriyani o'chirsangiz, uni qayta tiklash mumkin emas.
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
                onClick={handleDeleteConfirm}
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
