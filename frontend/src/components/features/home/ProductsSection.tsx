import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productsService } from "@/services/products.service";
import { ProductCard } from "@/components/features/products/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { useT, type MessageKey } from "@/i18n";
import type { Product, ProductFilter } from "@/types";

interface ProductsSectionProps {
  /** Literal eyebrow — prefer `eyebrowKey` for anything user-visible. */
  eyebrow?: string;
  /** Localized eyebrow; takes precedence over `eyebrow`. */
  eyebrowKey?: MessageKey;
  /** Literal title — prefer `titleKey` for anything user-visible. */
  title?: string;
  /** Localized title; takes precedence over `title`. */
  titleKey?: MessageKey;
  filters: ProductFilter;
  viewAllHref?: string;
  sectionClassName?: string;
  headerVariant?: "sans" | "serif";
  headerAlign?: "left" | "center";
  cardBadge?: "auto" | "new" | "bestseller";
  /**
   * Below `sm`, show only the first four cards (2×2) and offer a "Ko'proq
   * ko'rish" link instead of a long scroll. Cards 5+ are hidden with CSS rather
   * than sliced out, so no second render pass is needed when the viewport grows.
   */
  collapseOnMobile?: boolean;
}

export function ProductsSection({
  eyebrow,
  eyebrowKey,
  title,
  titleKey,
  filters,
  viewAllHref,
  sectionClassName,
  headerVariant = "serif",
  headerAlign = "left",
  cardBadge = "auto",
  collapseOnMobile = false,
}: ProductsSectionProps) {
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    setError(false);
    productsService
      .getAll({ ...filters, limit: filters.limit ?? 8 })
      .then((res) => setProducts(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const href = viewAllHref ?? ROUTES.PRODUCTS;
  const resolvedTitle = titleKey ? t(titleKey) : title ?? "";
  const resolvedEyebrow = eyebrowKey ? t(eyebrowKey) : eyebrow;

  return (
    <section className={cn("py-7 sm:py-12", sectionClassName ?? "bg-store-bg")} aria-label={resolvedTitle}>
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow={resolvedEyebrow}
          title={resolvedTitle}
          href={href}
          variant={headerVariant}
          align={headerAlign}
        />

        {loading && <ProductGridSkeleton count={filters.limit ?? 6} />}
        {!loading && error && <ErrorState onRetry={fetchProducts} />}
        {!loading && !error && products.length === 0 && <EmptyState />}
        {!loading && !error && products.length > 0 && (
          <>
            {/* 2 cols on mobile (never 1), 3 on tablet, 6 in a single row from
                the 1280px desktop breakpoint — every step divides the 6-item
                limit evenly, so no row is ever left with orphans.
                `:flex` (not `:block`) restores ProductCard's flex column when
                the hidden cards come back at sm. */}
            <div
              className={cn(
                "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 sm:gap-4",
                collapseOnMobile &&
                  "[&>*:nth-child(n+5)]:hidden sm:[&>*:nth-child(n+5)]:flex"
              )}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} badge={cardBadge} />
              ))}
            </div>

            {collapseOnMobile && products.length > 4 && (
              <Link
                to={href}
                className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 rounded-md border border-store-gold/50 text-[13px] font-medium text-store-gold transition-colors active:bg-store-gold active:text-white sm:hidden"
              >
                {t("home.showMore")}
                <ArrowRight size={14} />
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
