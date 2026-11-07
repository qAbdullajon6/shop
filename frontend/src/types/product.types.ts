// ─── Images (belong to Product, NOT ProductVariant) ─────────────────────────
export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

// ─── Variant ─────────────────────────────────────────────────────────────────
// NOTE: price is a Decimal string from backend (e.g. "285000.00")
export interface ProductVariant {
  id: string;
  sku: string;
  volume: string | null;
  color: string | null;
  color_hex: string | null;
  price: string;
  stock: number;
  is_active: boolean;
}

// ─── Attribute value ─────────────────────────────────────────────────────────
export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  slug: string;
  type: string;
  unit: string | null;
  value: string;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
export interface ProductTag {
  id: string;
  name: string;
  slug: string;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface ProductCategory {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
}

// ─── Brand ───────────────────────────────────────────────────────────────────
export interface ProductBrand {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
}

// ─── Product (matches backend ProductResponseDto exactly) ────────────────────
export interface Product {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  category: ProductCategory;
  brand: ProductBrand | null;
  images: ProductImage[];
  attributes: ProductAttributeValue[];
  tags: ProductTag[];
  variants: ProductVariant[];
  is_active: boolean;
  is_bestseller: boolean;
  view_count: number;
  review_count: number;
  avg_rating: number | null;
  created_at: string;
  updated_at: string;
}

// ─── CategoryAttribute ───────────────────────────────────────────────────────
export interface CategoryAttribute {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "MULTI_SELECT";
  unit: string | null;
  options: string[] | null;
  category_id: string;
}

// ─── Filters (matches backend ProductQueryDto) ───────────────────────────────
export interface ProductFilter {
  search?: string;
  category_slug?: string;
  brand_slug?: string;
  min_price?: number;
  max_price?: number;
  volumes?: string;             // comma-separated, e.g. "50ml,100ml"
  tag_ids?: string;             // comma-separated tag IDs
  attributes?: string;          // JSON string {"slug":"value"}
  date_from?: string;
  date_to?: string;
  min_rating?: number;
  min_review_count?: number;
  sort_by?: "name" | "price" | "created_at" | "view_count" | "rating" | "best_seller";
  sort_order?: "asc" | "desc";
  best_seller_period?: "week" | "month" | "year" | "all";
  is_bestseller?: boolean;
  include_inactive?: boolean;
  page?: number;
  limit?: number;
}

// ─── Products list response (flat, matches backend ProductListResponseDto) ────
export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── Catalog facets (matches backend ProductFacetsDto) ────────────────────────
export interface ProductFacetBrand {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface ProductFacetCategory {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  count: number;
}

export interface ProductFacets {
  min_price: number;
  max_price: number;
  total: number;
  volumes: string[];
  brands: ProductFacetBrand[];
  categories: ProductFacetCategory[];
}
