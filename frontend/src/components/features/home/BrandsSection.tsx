import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { brandsService } from "@/services/brands.service";
import { imgUrl, ROUTES } from "@/constants";
import type { Brand } from "@/types";

const SCROLL_STEP = 480;

export function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    brandsService
      .getAll()
      .then((data: Brand[]) => setBrands(data.filter((b) => b.is_active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  if (!loading && brands.length === 0) return null;

  return (
    <section className="py-8 bg-store-nav" aria-label="Brendlar">
      <div className="mx-auto flex max-w-content items-center gap-6 px-4 sm:px-6 lg:px-10">

        <Link
          to={`${ROUTES.PRODUCTS}?view=brands`}
          className="hidden flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-store-gold transition-opacity hover:opacity-75 lg:block"
        >
          Premium brendlar
        </Link>

        {/* Brend qatori */}
        <div
          ref={trackRef}
          className="scrollbar-hide flex flex-1 items-center gap-8 overflow-x-auto sm:gap-12"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-7 w-28 flex-shrink-0 animate-pulse rounded bg-store-surface" />
              ))
            : brands.map((brand) => {
                const logo = imgUrl(brand.logo);
                return (
                  <Link
                    key={brand.id}
                    to={`${ROUTES.PRODUCTS}?brand_slug=${brand.slug}`}
                    className="group flex h-10 flex-shrink-0 items-center"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={brand.name}
                        loading="lazy"
                        className="max-h-8 w-auto object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    ) : (
                      <span className="whitespace-nowrap text-[15px] font-semibold uppercase tracking-wide text-store-text transition-colors group-hover:text-store-gold sm:text-[17px]">
                        {brand.name}
                      </span>
                    )}
                  </Link>
                );
              })}
        </div>

        {/* Strelkalar */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Oldingi brendlar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-store-border text-store-text-muted transition-colors hover:border-store-gold hover:text-store-gold"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Keyingi brendlar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-store-border text-store-text-muted transition-colors hover:border-store-gold hover:text-store-gold"
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}
