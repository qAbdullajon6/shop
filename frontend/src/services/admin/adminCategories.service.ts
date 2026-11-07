import { adminApiClient } from "@/lib/adminApi";
import type { Category } from "@/types";

export const adminCategoriesService = {
  // GET /categories/all — admin only, includes inactive
  getAll: async (): Promise<Category[]> => {
    const response = await adminApiClient.get<Category[]>("/categories/all");
    return response.data;
  },

  create: async (formData: FormData): Promise<Category> => {
    const response = await adminApiClient.post<Category>("/categories", formData);
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<Category> => {
    const response = await adminApiClient.patch<Category>(`/categories/${id}`, formData);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/categories/${id}`);
  },
};
