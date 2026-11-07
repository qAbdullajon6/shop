import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Gift, ShoppingCart } from "lucide-react";
import { ROUTES } from "@/constants";
import { formatPrice } from "@/lib/utils";

interface GiftSet {
  id: string;
  name: string;
  contents: string;
  price: number;
  mainImage: string;
  thumbs: string[];
}

const GIFT_SETS: GiftSet[] = [
  {
    id: "1",
    name: "Romantik To'plam — Ayollar uchun",
    contents: "Chanel No. 5 EDP 100ml + Body Lotion 200ml + Shower Gel 150ml + Yoqimli sumka",
    price: 385000,
    mainImage: "https://placehold.co/240x200/f9e4ec/a84e62?text=Romantik+Set",
    thumbs: [
      "https://placehold.co/80x80/f9e4ec/a84e62?text=EDP",
      "https://placehold.co/80x80/f9e4ec/a84e62?text=Lotion",
      "https://placehold.co/80x80/f9e4ec/a84e62?text=+2",
    ],
  },
  {
    id: "2",
    name: "Premium Erkak To'plami",
    contents: "Dior Sauvage EDT 100ml + After Shave 100ml + Deodorant 75g + Charm sumka",
    price: 320000,
    mainImage: "https://placehold.co/240x200/1a2035/8bb8d8?text=Erkak+Set",
    thumbs: [
      "https://placehold.co/80x80/1a2035/8bb8d8?text=EDT",
      "https://placehold.co/80x80/1a2035/8bb8d8?text=Shave",
      "https://placehold.co/80x80/1a2035/8bb8d8?text=+2",
    ],
  },
  {
    id: "3",
    name: "Luksus Unisex Kolleksiya",
    contents: "Tom Ford Black Orchid EDP 100ml + Body Cream 150ml + Muattar sham + Premium quti",
    price: 680000,
    mainImage: "https://placehold.co/240x200/1a1a2e/d4af37?text=Luxury+Set",
    thumbs: [
      "https://placehold.co/80x80/1a1a2e/d4af37?text=EDP",
      "https://placehold.co/80x80/1a1a2e/d4af37?text=Cream",
      "https://placehold.co/80x80/1a1a2e/d4af37?text=+2",
    ],
  },
  {
    id: "4",
    name: "Yozgi Yangilik To'plami",
    contents: "YSL Libre EDP 90ml + D&G Light Blue EDT 100ml + Mini atir 15ml + Sumka",
    price: 450000,
    mainImage: "https://placehold.co/240x200/e8f4f8/2a7a9e?text=Yozgi+Set",
    thumbs: [
      "https://placehold.co/80x80/e8f4f8/2a7a9e?text=YSL",
      "https://placehold.co/80x80/e8f4f8/2a7a9e?text=D%26G",
      "https://placehold.co/80x80/e8f4f8/2a7a9e?text=+2",
    ],
  },
];

const PER_PAGE = 3;

export function PopularBuildsSlider() {
  const [offset, setOffset] = useState(0);
  const max = Math.max(0, GIFT_SETS.length - PER_PAGE);
  const visible = GIFT_SETS.slice(offset, offset + PER_PAGE);

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-content px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-store-text">
            <Gift size={20} className="text-store-red" />
            Sovg'a to'plamlari
          </h2>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-sm text-store-red hover:underline flex items-center gap-1"
          >
            Barcha to'plamlar <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mb-4 border-t border-store-border" />

        <div className="relative">
          {offset > 0 && (
            <button
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              aria-label="Oldingi"
              className="absolute -left-5 top-1/2 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded bg-store-card text-store-text shadow hover:bg-store-border transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="grid grid-cols-3 gap-4">
            {visible.map((set) => (
              <div
                key={set.id}
                className="flex flex-col rounded-lg border border-store-border bg-store-card overflow-hidden"
              >
                {/* Images area */}
                <div className="flex gap-2 p-3">
                  <img
                    src={set.mainImage}
                    alt={set.name}
                    className="h-48 w-40 flex-shrink-0 rounded object-contain bg-store-bg"
                  />
                  <div className="flex flex-1 flex-col gap-2">
                    {set.thumbs.map((thumb, i) => (
                      <div
                        key={i}
                        className="flex h-14 w-full items-center justify-center rounded border border-store-border bg-store-bg"
                      >
                        <img src={thumb} alt="" className="h-10 w-10 object-contain" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
                  <p className="line-clamp-2 text-sm font-semibold text-store-text leading-snug">
                    {set.name}
                  </p>
                  <p className="line-clamp-2 text-xs text-store-text-muted leading-relaxed">
                    {set.contents}
                  </p>
                  <p className="mt-auto text-lg font-bold text-store-text">
                    {formatPrice(set.price)}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={ROUTES.PRODUCTS}
                      className="flex-1 rounded border border-store-border px-2 py-1.5 text-center text-xs font-medium text-store-text hover:bg-store-border transition-colors"
                    >
                      Batafsil
                    </Link>
                    <button className="flex flex-1 items-center justify-center gap-1 rounded bg-store-red px-2 py-1.5 text-xs font-medium text-white hover:bg-store-red-hover transition-colors">
                      <ShoppingCart size={13} />
                      Savatchaga
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {offset < max && (
            <button
              onClick={() => setOffset((o) => Math.min(max, o + 1))}
              aria-label="Keyingi"
              className="absolute -right-5 top-1/2 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded bg-store-card text-store-text shadow hover:bg-store-border transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
