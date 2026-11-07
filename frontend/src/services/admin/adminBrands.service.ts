import { adminApiClient } from "@/lib/adminApi";
import type { Brand } from "@/types";

export const adminBrandsService = {
  getAll: async (): Promise<Brand[]> => {
    const res = await adminApiClient.get<Brand[]>("/brands/all");
    return res.data;
  },

  create: async (formData: FormData): Promise<Brand> => {
    const res = await adminApiClient.post<Brand>("/brands", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (id: string, formData: FormData): Promise<Brand> => {
    const res = await adminApiClient.patch<Brand>(`/brands/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/brands/${id}`);
  },
};
