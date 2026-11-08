import type { Product, ProductFilter, ProductsResponse, ProductFacets, Category, CategoryAttribute } from "@/types";
import { staticProducts, staticCategories, getStaticProductsResponse, getStaticFacets } from "@/data/static-data";

export const productsService = {
  getAll: (filters?: ProductFilter): Promise<ProductsResponse> =>
    Promise.resolve(getStaticProductsResponse(filters as Parameters<typeof getStaticProductsResponse>[0])),

  getFacets: (_categorySlug?: string): Promise<ProductFacets> =>
    Promise.resolve(getStaticFacets()),

  getBySlug: (slug: string): Promise<Product> => {
    const product = staticProducts.find(p => p.slug === slug);
    if (!product) return Promise.reject(new Error("Not found"));
    return Promise.resolve(product);
  },

  getSimilar: (slug: string): Promise<Product[]> => {
    const product = staticProducts.find(p => p.slug === slug);
    if (!product) return Promise.resolve([]);
    return Promise.resolve(
      staticProducts.filter(p => p.slug !== slug && p.category.slug === product.category.slug).slice(0, 8)
    );
  },

  getCategories: (): Promise<Category[]> => Promise.resolve(staticCategories),

  getCategoryBySlug: (slug: string): Promise<Category> => {
    const cat = staticCategories.find(c => c.slug === slug);
    if (!cat) return Promise.reject(new Error("Not found"));
    return Promise.resolve(cat);
  },

  getCategoryAttributes: (_category_id: string): Promise<CategoryAttribute[]> =>
    Promise.resolve([]),
};
