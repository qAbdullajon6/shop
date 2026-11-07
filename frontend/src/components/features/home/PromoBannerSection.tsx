import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { bannersService } from "@/services/banners.service";
import { imgUrl } from "@/constants";
import type { Banner } from "@/types";

export function PromoBannerSection() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    bannersService
      .getAll()
      .then((banners) => {
        const active = banners.filter((b) => b.is_active);
        if (active.length > 0) setBanner(active[0]);
      })
      .catch(() => {});
  }, []);

  if (!banner) return null;

  const image = imgUrl(banner.image_uz) ?? imgUrl(banner.image_ru) ?? imgUrl(banner.image_en);
  const title = banner.title_uz ?? banner.title_ru ?? banner.title_en;

  return (
    <section className="py-6 px-4 bg-store-nav border-t border-store-border" aria-label="Aksiya">
      <div className="mx-auto max-w-content">
        <div className="relative overflow-hidden border border-store-border min-h-[140px] sm:min-h-[180px] flex items-center">
          {image && (
            <img
              src={image}
              alt={title ?? "Aksiya"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative px-8 py-6">
            {title && (
              <p className="font-serif text-2xl sm:text-3xl text-white mb-3 max-w-sm leading-tight">
                {title}
              </p>
            )}
            {banner.link && (
              <Link
                to={banner.link}
                className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-store-gold hover:opacity-80 transition-opacity"
              >
                Batafsil <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
