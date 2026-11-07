import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface MoodCollection {
  id: string;
  title: string;
  tagline: string;
  href: string;
  gradient: string;
  accentColor: string;
}

const COLLECTIONS: MoodCollection[] = [
  {
    id: "fresh",
    title: "Fresh & Clean",
    tagline: "Citrus, bergamot, dengiz havosi",
    href: `${ROUTES.PRODUCTS}?category_slug=erkaklar-atiri`,
    gradient: "from-blue-950 via-slate-900 to-zinc-900",
    accentColor: "text-blue-300",
  },
  {
    id: "floral",
    title: "Soft & Floral",
    tagline: "Gulob, peony, jasmin, iris",
    href: `${ROUTES.PRODUCTS}?category_slug=ayollar-atiri`,
    gradient: "from-rose-950 via-pink-950 to-stone-900",
    accentColor: "text-rose-300",
  },
  {
    id: "body",
    title: "Body & Care",
    tagline: "Body mist, dush geli, sovun",
    href: `${ROUTES.PRODUCTS}?category_slug=body-mist`,
    gradient: "from-amber-950 via-orange-950 to-stone-900",
    accentColor: "text-amber-300",
  },
  {
    id: "home",
    title: "Home Atmosphere",
    tagline: "Xona aromalari, shamlar",
    href: `${ROUTES.PRODUCTS}?category_slug=xona-aromalari`,
    gradient: "from-neutral-900 via-zinc-900 to-slate-950",
    accentColor: "text-neutral-300",
  },
];

function MoodCard({ collection }: { collection: MoodCollection }) {
  return (
    <Link
      to={collection.href}
      className={cn(
        "group relative flex flex-col justify-end p-6 min-h-[220px] sm:min-h-[260px] overflow-hidden",
        "bg-gradient-to-br",
        collection.gradient,
      )}
    >
      {/* Decorative element */}
      <div className="absolute top-5 right-5 w-16 h-16 rounded-full border border-white/5 opacity-60" />
      <div className="absolute top-8 right-8 w-8 h-8 rounded-full border border-white/5 opacity-40" />

      <div className="relative">
        <p className={cn("text-[11px] font-semibold uppercase tracking-widest mb-2", collection.accentColor)}>
          Collection
        </p>
        <h3 className="font-serif text-2xl sm:text-3xl text-white leading-tight mb-2">
          {collection.title}
        </h3>
        <p className="text-[12px] text-white/50 mb-4">{collection.tagline}</p>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 group-hover:text-white transition-colors">
          Ko'rish <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export function ShopByMoodSection() {
  return (
    <section className="py-16 bg-store-surface border-t border-store-border" aria-label="Kolleksiyalar">
      <div className="mx-auto max-w-content px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-store-text-dim mb-2">
              Kolleksiyalar
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl text-store-text leading-tight">
              Kayfiyatingizga mos
              <br className="hidden sm:block" /> kolleksiya toping
            </h2>
          </div>
          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-1.5 text-[13px] text-store-text-muted hover:text-store-text transition-colors group flex-shrink-0"
          >
            Barcha mahsulotlar
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLLECTIONS.map((col) => (
            <MoodCard key={col.id} collection={col} />
          ))}
        </div>
      </div>
    </section>
  );
}
