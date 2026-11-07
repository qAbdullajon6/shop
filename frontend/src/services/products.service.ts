import { apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Product, ProductFilter, ProductsResponse, ProductFacets, Category, CategoryAttribute } from "@/types";

export const productsService = {
  getAll: (filters?: ProductFilter) =>
    apiGet<ProductsResponse>(API_ENDPOINTS.PRODUCTS.LIST, { params: filters }),

  getFacets: (categorySlug?: string) =>
    apiGet<ProductFacets>(API_ENDPOINTS.PRODUCTS.FACETS, {
      params: categorySlug ? { category_slug: categorySlug } : undefined,
    }),

  getBySlug: (slug: string) =>
    apiGet<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(slug)),

  getSimilar: (slug: string) =>
    apiGet<Product[]>(API_ENDPOINTS.PRODUCTS.SIMILAR(slug)),

  getCategories: () =>
    apiGet<Category[]>(API_ENDPOINTS.CATEGORIES.LIST),

  getCategoryBySlug: (slug: string) =>
    apiGet<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(slug)),

  getCategoryAttributes: (category_id: string) =>
    apiGet<CategoryAttribute[]>(API_ENDPOINTS.CATEGORY_ATTRIBUTES, { params: { category_id } }),
};
