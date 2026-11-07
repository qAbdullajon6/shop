import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { productsService } from "@/services/products.service";
import { ProductCard } from "@/components/features/products/ProductCard";
import { MOCK_PRODUCTS } from "./mockProducts";
import type { Product } from "@/types";

const CATEGORY_TABS = [
  { label: "Barcha toifalar", slug: "" },
  { label: "Ayollar uchun", slug: "ayollar-uchun" },
  { label: "Erkaklar uchun", slug: "erkaklar-uchun" },
  { label: "Unisex", slug: "unisex" },
  { label: "Sovg'a to'plamlari", slug: "sovga-toplamlari" },
  { label: "Tana parvarishi", slug: "tana-parvarishi" },
  { label: "Uy xushbo'ylari", slug: "uy-xushboylari" },
];

export function NewProductsSection() {
  const [activeTab, setActiveTab] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    productsService
      .getAll({
        sort_by: "created_at",
        sort_order: "desc",
        limit: 12,
        ...(activeTab ? { category_slug: activeTab } : {}),
      })
      .then((res) => {
        const data = res?.data ?? [];
        if (data.length > 0) {
          setProducts(data);
          setTotal(res?.total ?? 0);
        } else {
          const filtered = activeTab
            ? MOCK_PRODUCTS.filter((p) => p.category.slug === activeTab)
            : MOCK_PRODUCTS;
          setProducts(filtered.slice(0, 12));
          setTotal(filtered.length);
        }
      })
      .catch(() => {
        const filtered = activeTab
          ? MOCK_PRODUCTS.filter((p) => p.category.slug === activeTab)
          : MOCK_PRODUCTS;
        setProducts(filtered.slice(0, 12));
        setTotal(filtered.length);
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <section className="mt-10 mb-10">
      <div className="mx-auto max-w-content px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-lg font-bold text-store-text">
            Yangi mahsulotlar
            {!isLoading && (
              <span className="text-sm font-normal text-store-text-muted">{total}</span>
            )}
          </h2>
          <Link
            to={`${ROUTES.PRODUCTS}?sort_by=created_at&sort_order=desc`}
            className="flex items-center gap-1 text-sm text-store-red hover:underline"
          >
            Barcha yangi atirlar <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex items-end gap-0 overflow-x-auto border-b border-store-border">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={[
                "flex-shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-xs font-medium transition-colors whitespace-nowrap",
                activeTab === tab.slug
                  ? "border-store-red text-store-text"
                  : "border-transparent text-store-text-muted hover:text-store-text",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-lg bg-store-card border border-store-border" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-store-text-muted">
              Bu toifada mahsulotlar mavjud emas
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
