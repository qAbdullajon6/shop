import { apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Banner } from "@/types";

export const bannersService = {
  getAll: () =>
    apiGet<Banner[]>(API_ENDPOINTS.BANNERS.LIST),

  getById: (id: string) =>
    apiGet<Banner>(API_ENDPOINTS.BANNERS.DETAIL(id)),
};
