import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productsService } from "@/services/products.service";
import { ProductCard } from "@/components/features/products/ProductCard";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/* Referens layout: chapda 3 ta ixcham mahsulot kartasi, o'ngda katta vizual.
   O'ng ustun uchta variantdan biri bo'ladi:
     - image + cross-links (pastda tugmalar)
     - faqat image
     - promo paneli (rasm o'rniga matn + CTA) */

export interface CrossLink {
  label: string;
  href: string;
}

interface CategoryShowcaseSectionProps {
  eyebrow: string;
  title: string;
  categorySlug: string;
  /** O'ng ustundagi rasm (public/ ichidagi yo'l). Yo'q bo'lsa gradient fon ko'rinadi. */
  image?: string;
  imageAlt?: string;
  crossLinks?: CrossLink[];
  /** Rasm o'rniga promo paneli ko'rsatish uchun */
  promo?: { eyebrow: string; title: ReactNode; cta: CrossLink };
  className?: string;
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-store-border bg-store-card">
      <div className="aspect-square animate-pulse bg-store-border/40" />
      <div className="space-y-2 px-3 pb-3 pt-2">
        <div className="h-2 w-12 animate-pulse rounded bg-store-border/60" />
        <div className="h-3 w-full animate-pulse rounded bg-store-border/40" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-store-border/30" />
        <div className="h-3.5 w-24 animate-pulse rounded bg-store-border/40" />
      </div>
    </div>
  );
}

function VisualPanel({
  image,
  imageAlt,
  promo,
}: Pick<CategoryShowcaseSectionProps, "image" | "imageAlt" | "promo">) {
  if (promo) {
    /* Rasm butun panel foni; chapga qarab surface rangi bilan hiralashadi,
       shu sababli matn har qanday fotoda o'qiladi. */
    return (
      <div className="relative h-full min-h-[260px] overflow-hidden rounded-xl bg-store-surface">
        {image && (
          <img
            src={image}
            alt={imageAlt ?? ''}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Chapdan o'ngga so'nuvchi parda */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#F3EFE7] via-[#F3EFE7]/85 to-[#F3EFE7]/0 dark:from-[#0D0D0D] dark:via-[#0D0D0D]/85 dark:to-[#0D0D0D]/0"
        />

        <div className="relative flex h-full max-w-[58%] flex-col justify-center p-7 lg:p-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-store-gold">
            {promo.eyebrow}
          </p>
          <h3 className="mt-3 font-serif text-[24px] leading-tight text-store-text lg:text-[28px]">
            {promo.title}
          </h3>
          <Link
            to={promo.cta.href}
            className="group mt-6 inline-flex h-11 w-fit items-center gap-3 rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {promo.cta.label}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[260px] overflow-hidden rounded-xl bg-store-surface">
      {image && (
        <img
          src={image}
          alt={imageAlt ?? ""}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}

export function CategoryShowcaseSection({
  eyebrow,
  title,
  categorySlug,
  image,
  imageAlt,
  crossLinks,
  promo,
  className,
}: CategoryShowcaseSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const viewAllHref = `${ROUTES.PRODUCTS}?category_slug=${categorySlug}`;

  useEffect(() => {
    productsService
      .getAll({ category_slug: categorySlug, limit: 3, sort_by: "created_at", sort_order: "desc" })
      .then((res) => setProducts(res.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug]);

  /* Mahsulot yo'q kategoriya bo'sh blok ko'rsatmaydi */
  if (!loading && products.length === 0) return null;

  return (
    <section className={cn("py-8 sm:py-10 bg-store-bg", className)} aria-label={title}>
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">

          {/* ── Chap: sarlavha + 3 ta mahsulot ─────────────────── */}
          <div className="flex flex-col">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-store-gold">
                  {eyebrow}
                </p>
                <h2 className="font-serif text-[26px] font-medium leading-tight text-store-text lg:text-[30px]">
                  {title}
                </h2>
              </div>
              <Link
                to={viewAllHref}
                className="group flex flex-shrink-0 items-center gap-1.5 text-[12px] text-store-text-muted transition-colors hover:text-store-gold"
              >
                Barchasini ko'rish
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                : products.map((p) => <ProductCard key={p.id} product={p} compact />)}
            </div>
          </div>

          {/* ── O'ng: vizual / promo ────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <VisualPanel image={image} imageAlt={imageAlt} promo={promo} />
            </div>

            {crossLinks && crossLinks.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {crossLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    to={href}
                    className="group flex h-11 items-center justify-center gap-2 rounded-md border border-store-border bg-store-card px-4 text-[12px] text-store-text-muted transition-colors hover:border-store-gold/50 hover:text-store-gold"
                  >
                    {label}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
