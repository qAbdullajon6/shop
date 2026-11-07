import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Gem,
  Sparkles,
  Droplets,
  Leaf,
  Gift,
  Wind,
  Star,
} from "lucide-react";
import { ROUTES } from "@/constants";

const CATEGORIES = [
  {
    id: "1",
    name: "Ayollar uchun",
    parent: "Parfyumeriya",
    count: 324,
    slug: "ayollar-uchun",
    Icon: Heart,
    gradient: "linear-gradient(145deg, #d4607a 0%, #8b1e3f 50%, #4a0d20 100%)",
    accent: "#f5b0c8",
  },
  {
    id: "2",
    name: "Erkaklar uchun",
    parent: "Parfyumeriya",
    count: 278,
    slug: "erkaklar-uchun",
    Icon: Gem,
    gradient: "linear-gradient(145deg, #2a5ba0 0%, #0d2550 50%, #06101e 100%)",
    accent: "#90c0e8",
  },
  {
    id: "3",
    name: "Unisex atirlar",
    parent: "Parfyumeriya",
    count: 145,
    slug: "unisex",
    Icon: Sparkles,
    gradient: "linear-gradient(145deg, #c9965a 0%, #8b6028 50%, #4a3010 100%)",
    accent: "#f0d0a0",
  },
  {
    id: "4",
    name: "Eau de Parfum",
    parent: "Atir turlari",
    count: 412,
    slug: "eau-de-parfum",
    Icon: Droplets,
    gradient: "linear-gradient(145deg, #7b3fa0 0%, #4a1870 50%, #200840 100%)",
    accent: "#c8a0e8",
  },
  {
    id: "5",
    name: "Tana parvarishi",
    parent: "Aksessuarlar",
    count: 189,
    slug: "tana-parvarishi",
    Icon: Leaf,
    gradient: "linear-gradient(145deg, #2a8050 0%, #155030 50%, #081e10 100%)",
    accent: "#90d8a8",
  },
  {
    id: "6",
    name: "Sovg'a to'plamlari",
    parent: "To'plamlar",
    count: 97,
    slug: "sovga-toplamlari",
    Icon: Gift,
    gradient: "linear-gradient(145deg, #c84880 0%, #801840 50%, #400820 100%)",
    accent: "#f5a8cc",
  },
  {
    id: "7",
    name: "Uy xushbo'ylari",
    parent: "Uy uchun",
    count: 63,
    slug: "uy-xushboylari",
    Icon: Wind,
    gradient: "linear-gradient(145deg, #1a8090 0%, #0d5060 50%, #062028 100%)",
    accent: "#80d8e8",
  },
  {
    id: "8",
    name: "Luksus brendlar",
    parent: "Premium",
    count: 118,
    slug: "luksus",
    Icon: Star,
    gradient: "linear-gradient(145deg, #c8a030 0%, #806015 50%, #402808 100%)",
    accent: "#f0d880",
  },
];

const PER_PAGE = 3;

export function PopularCategoriesSlider() {
  const [offset, setOffset] = useState(0);
  const max = Math.max(0, CATEGORIES.length - PER_PAGE);
  const visible = CATEGORIES.slice(offset, offset + PER_PAGE);

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-content px-4">
        <h2 className="mb-3 text-lg font-semibold text-store-text">Ommabop toifalar</h2>
        <div className="mb-4 border-t border-store-border" />

        <div className="relative">
          {offset > 0 && (
            <button
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              aria-label="Oldingi"
              className="absolute -left-5 top-1/2 z-10 flex h-10 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-store-card border border-store-border text-store-text shadow-md hover:border-store-red hover:text-store-red transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className="grid grid-cols-3 gap-4">
            {visible.map((cat) => {
              const { Icon } = cat;
              return (
                <Link
                  key={cat.id}
                  to={`${ROUTES.PRODUCTS}?category=${encodeURIComponent(cat.slug)}`}
                  className="group relative flex h-52 overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl"
                  style={{ background: cat.gradient }}
                >
                  {/* Shimmer overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)",
                    }}
                  />

                  {/* Background watermark icon */}
                  <div className="absolute -right-6 -bottom-8 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon size={155} className="text-white/[0.07]" strokeWidth={0.5} />
                  </div>

                  {/* Noise texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
                      backgroundSize: "300px 300px",
                    }}
                  />

                  {/* Top accent — dot + parent label */}
                  <div className="absolute top-4 left-5 flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.accent }}
                    />
                    <span
                      className="text-[10px] font-semibold tracking-[0.22em] uppercase"
                      style={{ color: cat.accent, opacity: 0.85 }}
                    >
                      {cat.parent}
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-5 left-5 right-5 z-10">
                    {/* Small glassmorphism icon badge */}
                    <div
                      className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Icon size={18} className="text-white" />
                    </div>

                    {/* Category name in serif */}
                    <p
                      className="text-[21px] font-semibold text-white leading-tight mb-2.5"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        letterSpacing: "0.01em",
                        textShadow: "0 1px 8px rgba(0,0,0,0.25)",
                      }}
                    >
                      {cat.name}
                    </p>

                    {/* Count pill */}
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px]"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      <span
                        className="h-[5px] w-[5px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.accent }}
                      />
                      <span className="text-[11px] font-medium text-white/75 tracking-wide">
                        {cat.count.toLocaleString()} ta mahsulot
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {offset < max && (
            <button
              onClick={() => setOffset((o) => Math.min(max, o + 1))}
              aria-label="Keyingi"
              className="absolute -right-5 top-1/2 z-10 flex h-10 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-store-card border border-store-border text-store-text shadow-md hover:border-store-red hover:text-store-red transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="mt-5 flex justify-center items-center gap-2">
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setOffset(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === offset ? "24px" : "6px",
                height: "6px",
                backgroundColor: i === offset ? "#C4647A" : "rgb(var(--color-border))",
              }}
              aria-label={`Sahifa ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
