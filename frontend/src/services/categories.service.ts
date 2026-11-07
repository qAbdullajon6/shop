import { apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Category } from "@/types";

export const categoriesService = {
  getAll: () => apiGet<Category[]>(API_ENDPOINTS.CATEGORIES.LIST),
  getBySlug: (slug: string) => apiGet<Category>(API_ENDPOINTS.CATEGORIES.DETAIL(slug)),
};
