import type { Banner } from "@/types";
import { staticBanners } from "@/data/static-data";

export const bannersService = {
  getAll: (): Promise<Banner[]> => Promise.resolve(staticBanners),
  getById: (id: string): Promise<Banner> => {
    const banner = staticBanners.find(b => b.id === id);
    if (!banner) return Promise.reject(new Error("Not found"));
    return Promise.resolve(banner);
  },
};
