import { Link } from "react-router-dom";
import { imgUrl, ROUTES } from "@/constants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useRootCategories } from "@/hooks/useCategories";
import { useT, useLocale, localizedName } from "@/i18n";
import type { Category } from "@/types";

function CategoryCard({ category }: { category: Category }) {
  const locale = useLocale();
  const image =
    imgUrl(category.image_uz) ??
    imgUrl(category.image_ru) ??
    imgUrl(category.image_en);
  const name = localizedName(category, locale);

  return (
    /* Tile and label are separate blocks — the label sits on the page ground
       below the tile, which keeps the tiles small and the row scannable. */
    <Link
      to={`${ROUTES.PRODUCTS}?category_slug=${category.slug}`}
      className="group block focus-visible:outline-none"
    >
      <div className="aspect-square overflow-hidden rounded-xl border border-transparent bg-store-surface transition-all duration-300 group-hover:border-store-gold/30 group-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] sm:rounded-2xl">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105 sm:p-2.5"
          />
        ) : (
          <div className="h-full w-full bg-store-bg" />
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-center text-[10px] leading-tight text-store-text-muted transition-colors group-hover:text-store-gold sm:text-[11.5px]">
        {name}
      </p>
    </Link>
  );
}

function CategoryCardSkeleton() {
  return (
    <div>
      <div className="aspect-square animate-pulse rounded-xl bg-store-surface sm:rounded-2xl" />
      <div className="mx-auto mt-2 h-2.5 w-12 animate-pulse rounded bg-store-surface" />
    </div>
  );
}

/** Placeholder count while loading — matches the seeded catalogue size. */
const SKELETON_COUNT = 12;

export function CategoryDiscoverySection() {
  const t = useT();
  const { categories, loading } = useRootCategories();

  return (
    <section aria-label={t("home.categories")} className="bg-store-bg pb-4 pt-5 sm:py-10">
      {/* Reuses the shared shelf header so type and spacing match the product
          sections below it. */}
      <div className="mx-auto max-w-content px-4 sm:px-6 xl:px-10">
        <SectionHeader title={t("home.categories")} href={ROUTES.PRODUCTS} variant="sans" />
      </div>

      {/* Desktop/tablet: two tidy rows at lg, a single row from xl.
          A wrapping grid keeps working if the catalogue outgrows 12 entries. */}
      <div className="mx-auto hidden max-w-content gap-3 px-6 lg:grid lg:grid-cols-6 xl:grid-cols-12 xl:gap-4 xl:px-10">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CategoryCardSkeleton key={i} />)
          : categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
      </div>

      {/* Mobile/tablet: horizontal scroll. Tiles stay small so roughly five are
          in view at 390px and the strip never dominates the first screen. */}
      <div className="scrollbar-hide overflow-x-auto px-4 sm:px-6 lg:hidden">
        <div className="flex w-max gap-2.5 sm:gap-3">
          {(loading ? Array.from({ length: SKELETON_COUNT }) : categories).map((cat, i) => (
            <div key={loading ? i : (cat as Category).id} className="w-[68px] flex-none sm:w-[86px]">
              {loading ? <CategoryCardSkeleton /> : <CategoryCard category={cat as Category} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
