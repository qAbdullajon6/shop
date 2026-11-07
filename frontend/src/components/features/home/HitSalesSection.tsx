import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { productsService } from "@/services/products.service";
import { ProductCard } from "@/components/features/products/ProductCard";
import { MOCK_PRODUCTS } from "./mockProducts";
import type { Product } from "@/types";

export function HitSalesSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsService
      .getAll({ sort_by: "best_seller", best_seller_period: "month", limit: 8 })
      .then((res) => {
        const data = res?.data ?? [];
        setProducts(data.length > 0 ? data : MOCK_PRODUCTS.slice(0, 8));
      })
      .catch(() => setProducts(MOCK_PRODUCTS.slice(0, 8)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="mx-auto max-w-content px-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-store-text">Bestseller atirlar</h2>
          </div>
          <div className="mb-4 border-t border-store-border" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-store-card border border-store-border" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-content px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-store-text">Bestseller atirlar</h2>
          <Link
            to={`${ROUTES.PRODUCTS}?sort_by=best_seller`}
            className="flex items-center gap-1 text-sm text-store-red hover:underline"
          >
            Barcha mahsulotlar <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mb-4 border-t border-store-border" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to={`${ROUTES.PRODUCTS}?sort_by=best_seller`}
            className="inline-flex items-center gap-2 rounded border border-store-border px-8 py-2.5 text-sm font-medium text-store-text hover:border-store-red hover:text-store-red transition-colors"
          >
            Barcha bestseller atirlarni ko'rish <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
