import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoriesService } from "@/services/categories.service";
import { imgUrl, ROUTES } from "@/constants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Category } from "@/types";

const PLACEHOLDER_GRADIENTS = [
  "from-stone-900 to-stone-800",
  "from-zinc-900 to-zinc-800",
  "from-neutral-900 to-neutral-800",
  "from-gray-900 to-gray-800",
];

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const image = imgUrl(category.image_uz) ?? imgUrl(category.image_ru) ?? imgUrl(category.image_en);

  return (
    <Link
      to={`${ROUTES.PRODUCTS}?category_slug=${category.slug}`}
      className="group relative block overflow-hidden aspect-[3/4]"
    >
      {image ? (
        <img
          src={image}
          alt={category.name_uz}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-b ${PLACEHOLDER_GRADIENTS[index % 4]}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="font-serif text-xl text-white leading-tight">{category.name_uz}</p>
        <div className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-store-gold opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Ko'rish <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    setError(false);
    categoriesService
      .getAll()
      .then((data) => {
        const roots = data.filter((c) => !c.parent_id && c.is_active);
        setCategories(roots.slice(0, 4));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  return (
    <section className="py-16 bg-store-bg" aria-label="Kategoriyalar">
      <div className="mx-auto max-w-content px-4">
        <SectionHeader
          eyebrow="Kategoriyalar"
          title="Parfüm kategoriyalari"
          href={ROUTES.PRODUCTS}
        />

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        )}
        {!loading && error && <ErrorState onRetry={fetchCategories} />}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
