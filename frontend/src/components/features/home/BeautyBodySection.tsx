import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { categoriesService } from "@/services/categories.service";
import { imgUrl, ROUTES } from "@/constants";
import type { Category } from "@/types";

/* Referens: 4 ta keng karta — rasm tepada, nomi va tavsifi pastda, o'ngda gold strelka.
   Rasmlar backenddagi kategoriya rasmlaridan olinadi; tavsif shu yerda saqlanadi. */
const BEAUTY_SLUGS = ["body-mist", "dush-geli", "xushboy-sovun", "soch-parfum"] as const;

const DESCRIPTIONS: Record<string, string> = {
  "body-mist":         "Yengil tana aromalari",
  "dush-geli":         "Xushbo'y kundalik parvarish",
  "xushboy-sovun":     "Hashamatli sovunlar",
  "soch-parfum": "Sochlaringiz uchun nozik aroma",
};

function BeautyCard({ category }: { category: Category }) {
  const image =
    imgUrl(category.image_uz) ??
    imgUrl(category.image_ru) ??
    imgUrl(category.image_en);

  return (
    <Link
      to={`${ROUTES.PRODUCTS}?category_slug=${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-store-surface transition-shadow duration-300 hover:shadow-md focus-visible:outline-none"
    >
      <div className="aspect-[16/10] w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={category.name_uz}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-store-bg" />
        )}
      </div>

      <div className="flex items-center gap-3 px-4 pb-4 pt-1">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[13px] font-semibold text-store-text transition-colors group-hover:text-store-gold">
            {category.name_uz}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-store-text-dim">
            {DESCRIPTIONS[category.slug] ?? ""}
          </p>
        </div>
        <ArrowRight
          size={15}
          className="flex-shrink-0 text-store-gold transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function BeautyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-store-surface">
      <div className="aspect-[16/10] w-full animate-pulse bg-store-bg" />
      <div className="px-4 pb-4 pt-1">
        <div className="mx-auto h-3 w-24 animate-pulse rounded bg-store-bg" />
        <div className="mx-auto mt-2 h-2.5 w-32 animate-pulse rounded bg-store-bg" />
      </div>
    </div>
  );
}

export function BeautyBodySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesService
      .getAll()
      .then((data: Category[]) => {
        const bySlug = new Map(data.map((c) => [c.slug, c]));
        setCategories(
          BEAUTY_SLUGS.map((s) => bySlug.get(s)).filter((c): c is Category => Boolean(c))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 bg-store-bg" aria-label="Beauty va tana mahsulotlari">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Beauty & Body"
          title="Parfyumdan ko'ra ko'proq"
          href={`${ROUTES.PRODUCTS}?category_slug=body-mist`}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <BeautyCardSkeleton key={i} />)
            : categories.map((cat) => <BeautyCard key={cat.id} category={cat} />)}
        </div>
      </div>
    </section>
  );
}
