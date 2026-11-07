export interface Category {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  image_uz: string | null;
  image_ru: string | null;
  image_en: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  children: Category[];
}
