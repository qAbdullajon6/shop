import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Tag,
  Percent,
  Settings2,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { ROUTES, imgUrl } from "@/constants";
import { categoriesService } from "@/services/categories.service";
import { brandsService } from "@/services/brands.service";
import type { Category, Brand } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  toggleButtonRef?: React.RefObject<HTMLButtonElement>;
}

const STATIC_TOP = [
  { id: "brands-link", label: "Brendlar", icon: Tag, highlight: false },
  { id: "sales-link", label: "Chegirmalar va aksiyalar", icon: Percent, highlight: true },
];

export function CatalogMegaMenu({ open, onClose, toggleButtonRef }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;

    categoriesService.getAll().then((data) => {
      setCategories(data);
      const firstWithChildren = data.find((c) => c.children.length > 0);
      if (firstWithChildren) setActiveSlug(firstWithChildren.slug);
    });

    brandsService.getAll().then(setBrands);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !toggleButtonRef?.current?.contains(target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, toggleButtonRef]);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <div
      ref={menuRef}
      className={[
        "absolute left-0 top-full z-50 w-full",
        "transition-all duration-200 ease-out",
        open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <div className="mx-auto max-w-content bg-store-nav border border-t-0 border-store-border shadow-2xl rounded-b-lg overflow-hidden">

        {/* Top action buttons */}
        <div className="flex items-center gap-3 border-b border-store-border px-4 py-2.5">
          <button className="flex items-center gap-2 rounded border border-store-border px-4 py-2 text-xs text-store-text hover:border-store-red hover:text-store-red transition-colors">
            <Settings2 size={15} className="text-store-red" />
            Onlayn konfigurator yordamida kompyuter yarating
          </button>
          <button className="flex items-center gap-2 rounded border border-store-border px-4 py-2 text-xs text-store-text hover:border-store-red hover:text-store-red transition-colors">
            <LayoutGrid size={15} className="text-store-red" />
            Konfiguratsiya katalogi
          </button>
        </div>

        <div className="flex" style={{ minHeight: 400, maxHeight: 520 }}>

          {/* Left: categories */}
          <div className="w-60 flex-shrink-0 border-r border-store-border overflow-y-auto py-1">
            {STATIC_TOP.map(({ id, label, icon: Icon, highlight }) => (
              <button
                key={id}
                onClick={onClose}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-store-text-muted hover:bg-store-card hover:text-store-text transition-colors"
              >
                <Icon size={16} className={highlight ? "text-store-red flex-shrink-0" : "opacity-60 flex-shrink-0"} />
                <span className={highlight ? "font-medium text-store-red" : ""}>{label}</span>
              </button>
            ))}

            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug && cat.children.length > 0;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => cat.children.length > 0 && setActiveSlug(cat.slug)}
                  onClick={() => { if (cat.children.length === 0) onClose(); }}
                  className={[
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-store-card text-store-text"
                      : "text-store-text-muted hover:bg-store-card hover:text-store-text",
                  ].join(" ")}
                >
                  <Layers
                    size={16}
                    className={[
                      "flex-shrink-0",
                      isActive ? "text-store-red" : "opacity-60",
                    ].join(" ")}
                  />
                  <span className="flex-1 leading-tight">{cat.name_uz}</span>
                  {cat.children.length > 0 && (
                    <ChevronRight size={13} className="flex-shrink-0 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Center: children of active category */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeCategory && activeCategory.children.length > 0 ? (
              <div className="columns-3 gap-6">
                {activeCategory.children.map((child) => (
                  <div key={child.id} className="mb-4 break-inside-avoid">
                    <Link
                      to={`${ROUTES.PRODUCTS}?category_slug=${child.slug}`}
                      onClick={onClose}
                      className="block text-sm font-semibold text-store-text hover:text-store-red transition-colors"
                    >
                      {child.name_uz}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-store-text-muted">
                <p>Tez kunda...</p>
              </div>
            )}
          </div>

          {/* Right: brands */}
          <div className="w-52 flex-shrink-0 border-l border-store-border p-3 overflow-y-auto">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-store-text-muted">
              Brendlar
            </p>
            <div className="grid grid-cols-2 gap-2">
              {brands.map((brand) => {
                const logo = imgUrl(brand.logo);
                return (
                  <Link
                    key={brand.id}
                    to={`${ROUTES.PRODUCTS}?brand_slug=${brand.slug}`}
                    onClick={onClose}
                    className="flex h-10 items-center justify-center rounded border border-store-border bg-store-card hover:border-store-red transition-colors overflow-hidden px-1"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={brand.name}
                        className="max-h-7 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-store-text">{brand.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
