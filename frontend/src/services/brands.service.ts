import type { Brand } from "@/types";
import { staticBrands } from "@/data/static-data";

export const brandsService = {
  getAll: (): Promise<Brand[]> => Promise.resolve(staticBrands),
  getBySlug: (slug: string): Promise<Brand> => {
    const brand = staticBrands.find(b => b.slug === slug);
    if (!brand) return Promise.reject(new Error("Not found"));
    return Promise.resolve(brand);
  },
};
