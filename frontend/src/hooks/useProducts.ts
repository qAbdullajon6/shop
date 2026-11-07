import { useState, useEffect, useCallback } from "react";
import { productsService } from "@/services";
import type { Product, ProductFilter, ProductsResponse } from "@/types";

export function useProducts(initialFilters?: ProductFilter) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilter>(initialFilters ?? {});

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productsService.getAll(filters);
      setData(result);
    } catch {
      setError("Mahsulotlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.total_pages ?? 0,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchProducts,
  };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    productsService
      .getBySlug(slug)
      .then(setProduct)
      .catch(() => setError("Mahsulotni yuklashda xatolik yuz berdi"))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return { product, isLoading, error };
}
