import { useEffect, useState } from "react";
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types";

/**
 * Session-scoped category cache.
 *
 * The category tree is read by three surfaces at once (homepage strip, desktop
 * mega menu, mobile catalog sheet). Without a shared cache each mount fires its
 * own GET /categories. A module-level promise collapses concurrent callers into
 * a single in-flight request and serves every later mount from memory.
 *
 * Categories change rarely and are already CDN/HTTP cacheable, so a per-session
 * cache is the right trade-off — no invalidation logic to get wrong.
 */
let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

function loadCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = categoriesService
      .getAll()
      .then((data) => {
        cache = data;
        return data;
      })
      .catch((err) => {
        // Clear the in-flight handle so a later mount can retry.
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: boolean;
}

/** Returns active root categories (and their children) from the shared cache. */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache) return;
    let alive = true;

    loadCategories()
      .then((data) => {
        if (alive) setCategories(data);
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { categories, loading, error };
}

/** Root-level active categories, sorted by the backend's sort_order. */
export function useRootCategories(): UseCategoriesResult {
  const { categories, loading, error } = useCategories();
  return {
    categories: categories
      .filter((c) => c.is_active && !c.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order),
    loading,
    error,
  };
}
