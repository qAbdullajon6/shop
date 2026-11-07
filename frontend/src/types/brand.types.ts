export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  is_active: boolean;
  is_featured: boolean;
  country: string | null;
  sort_order: number;
  created_at: string;
}
