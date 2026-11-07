export interface Banner {
  id: string;
  sort_order: number;
  link: string | null;
  title_uz: string | null;
  title_ru: string | null;
  title_en: string | null;
  image_uz: string | null;
  image_ru: string | null;
  image_en: string | null;
  is_active: boolean;
  created_at: string;
}
