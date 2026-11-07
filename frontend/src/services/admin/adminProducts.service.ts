import { adminApiClient } from "@/lib/adminApi";
import type { Product, ProductsResponse } from "@/types";

export const adminProductsService = {
  getAll: async (page = 1, limit = 100): Promise<ProductsResponse> => {
    const res = await adminApiClient.get<ProductsResponse>("/products", {
      params: { include_inactive: true, page, limit, sort_by: "created_at", sort_order: "desc" },
    });
    return res.data;
  },

  create: async (formData: FormData): Promise<Product> => {
    const res = await adminApiClient.post<Product>("/products", formData);
    return res.data;
  },

  update: async (id: string, formData: FormData): Promise<Product> => {
    const res = await adminApiClient.patch<Product>(`/products/${id}`, formData);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/products/${id}`);
  },

  toggleBestseller: async (id: string, value: boolean): Promise<Product> => {
    const fd = new FormData();
    fd.append("is_bestseller", String(value));
    const res = await adminApiClient.patch<Product>(`/products/${id}`, fd);
    return res.data;
  },
};
