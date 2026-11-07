import { apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Brand } from "@/types";

export const brandsService = {
  getAll: () =>
    apiGet<Brand[]>(API_ENDPOINTS.BRANDS.LIST),

  getBySlug: (slug: string) =>
    apiGet<Brand>(API_ENDPOINTS.BRANDS.DETAIL(slug)),
};
