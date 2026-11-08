import type { Category, Brand, Banner, Product, ProductsResponse, ProductFacets } from "@/types";

import categoriesRaw from "./categories.json";
import brandsRaw from "./brands.json";
import bannersRaw from "./banners.json";
import productsRaw from "./products.json";

// ── Type mapping helpers ─────────────────────────────────────────────────────

function mapCategory(c: Record<string, unknown>): Category {
  return {
    id: c.id as string,
    name_uz: (c.name_uz as string) ?? "",
    name_ru: (c.name_ru as string) ?? "",
    name_en: (c.name_en as string) ?? "",
    slug: c.slug as string,
    description_uz: (c.description_uz as string | null) ?? null,
    description_ru: null,
    description_en: null,
    image_uz: (c.image_uz as string | null) ?? null,
    image_ru: (c.image_ru as string | null) ?? null,
    image_en: (c.image_en as string | null) ?? null,
    parent_id: null,
    sort_order: 0,
    is_active: true,
    created_at: "",
    children: [],
  };
}

function mapBrand(b: Record<string, unknown>): Brand {
  return {
    id: b.id as string,
    slug: b.slug as string,
    name: b.name as string,
    logo: (b.logo as string | null) ?? null,
    description_uz: (b.description_uz as string | null) ?? null,
    description_ru: null,
    description_en: null,
    is_active: true,
    is_featured: false,
    country: null,
    sort_order: 0,
    created_at: "",
  };
}

function mapBanner(b: Record<string, unknown>): Banner {
  return {
    id: b.id as string,
    sort_order: (b.sort_order as number) ?? 0,
    link: (b.link as string | null) ?? null,
    title_uz: (b.title_uz as string | null) ?? null,
    title_ru: (b.title_ru as string | null) ?? null,
    title_en: (b.title_en as string | null) ?? null,
    image_uz: (b.image_uz as string | null) ?? null,
    image_ru: (b.image_ru as string | null) ?? null,
    image_en: (b.image_en as string | null) ?? null,
    is_active: true,
    created_at: "",
  };
}

function mapProduct(p: Record<string, unknown>): Product {
  const variants = ((p.variants as Record<string, unknown>[]) ?? []).map((v) => ({
    id: v.id as string,
    sku: v.sku as string,
    volume: (v.volume as string | null) ?? null,
    color: null,
    color_hex: null,
    price: (v.price as string) ?? "0",
    stock: (v.stock as number) ?? 0,
    is_active: true,
  }));

  const images = ((p.images as Record<string, unknown>[]) ?? []).map((img) => ({
    id: (img.url as string),
    url: img.url as string,
    is_primary: (img.is_primary as boolean) ?? false,
    sort_order: (img.sort_order as number) ?? 0,
  }));

  return {
    id: p.id as string,
    slug: p.slug as string,
    name_uz: (p.name_uz as string) ?? "",
    name_ru: (p.name_ru as string) ?? "",
    name_en: (p.name_en as string) ?? "",
    description_uz: (p.description_uz as string | null) ?? null,
    description_ru: null,
    description_en: null,
    category: {
      id: p.id as string,
      slug: p.category_slug as string,
      name_uz: p.category_name as string,
      name_ru: p.category_name as string,
      name_en: p.category_name as string,
    },
    brand: p.brand_slug ? {
      id: p.id as string,
      slug: p.brand_slug as string,
      name: p.brand_name as string,
      logo: null,
    } : null,
    images,
    attributes: [],
    tags: [],
    variants,
    is_active: (p.is_active as boolean) ?? true,
    is_bestseller: (p.is_bestseller as boolean) ?? false,
    view_count: 0,
    review_count: 0,
    avg_rating: null,
    created_at: "",
    updated_at: "",
  };
}

// ── Exported static data ─────────────────────────────────────────────────────

export const staticCategories: Category[] =
  (categoriesRaw as Record<string, unknown>[]).map(mapCategory);

export const staticBrands: Brand[] =
  (brandsRaw as Record<string, unknown>[]).map(mapBrand);

export const staticBanners: Banner[] =
  (bannersRaw as Record<string, unknown>[]).map(mapBanner);

export const staticProducts: Product[] =
  (productsRaw as Record<string, unknown>[]).map(mapProduct);

// ── Helper functions matching backend filter/pagination ──────────────────────

export function getStaticProductsResponse(filters: {
  category_slug?: string;
  brand_slug?: string;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
  q?: string;
} = {}): ProductsResponse {
  let items = [...staticProducts];

  if (filters.category_slug)
    items = items.filter(p => p.category.slug === filters.category_slug);
  if (filters.brand_slug)
    items = items.filter(p => p.brand?.slug === filters.brand_slug);
  if (filters.is_bestseller)
    items = items.filter(p => p.is_bestseller);
  if (filters.is_new_arrival)
    items = items.filter(p => !p.is_bestseller);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(p =>
      p.name_uz?.toLowerCase().includes(q) ||
      p.name_ru?.toLowerCase().includes(q) ||
      p.brand?.name?.toLowerCase().includes(q)
    );
  }

  if (filters.sort_by === "price") {
    items.sort((a, b) => {
      const pa = parseFloat(a.variants[0]?.price ?? "0");
      const pb = parseFloat(b.variants[0]?.price ?? "0");
      return filters.sort_order === "desc" ? pb - pa : pa - pb;
    });
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const total = items.length;
  const data = items.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
}

export function getStaticFacets(): ProductFacets {
  const categories = staticCategories.map(c => ({ slug: c.slug, name_uz: c.name_uz, count: staticProducts.filter(p => p.category.slug === c.slug).length })).filter(c => c.count > 0);
  const brands = staticBrands.map(b => ({ slug: b.slug, name: b.name, count: staticProducts.filter(p => p.brand?.slug === b.slug).length })).filter(b => b.count > 0);
  return { categories, brands, price_min: 0, price_max: 5000000, attributes: [] } as unknown as ProductFacets;
}
