import type { Category } from "@/types";
import { staticCategories } from "@/data/static-data";

export const categoriesService = {
  getAll: (): Promise<Category[]> => Promise.resolve(staticCategories),
  getBySlug: (slug: string): Promise<Category> => {
    const cat = staticCategories.find(c => c.slug === slug);
    if (!cat) return Promise.reject(new Error("Not found"));
    return Promise.resolve(cat);
  },
};
