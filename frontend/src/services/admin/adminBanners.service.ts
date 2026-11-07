import { adminApiClient } from "@/lib/adminApi";
import type { Banner } from "@/types";

export const adminBannersService = {
  getAll: async (): Promise<Banner[]> => {
    const res = await adminApiClient.get<Banner[]>("/banners/all");
    return res.data;
  },

  create: async (formData: FormData): Promise<Banner> => {
    const res = await adminApiClient.post<Banner>("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (id: string, formData: FormData): Promise<Banner> => {
    const res = await adminApiClient.patch<Banner>(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/banners/${id}`);
  },
};
