import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ChevronRight, ChevronLeft, Heart, ShoppingCart, Zap,
  BadgeCheck, ShieldCheck, Truck, RotateCcw, Headphones, Star, Check, Loader2,
} from "lucide-react";
import { productsService } from "@/services/products.service";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import { ProductCard } from "@/components/features/products/ProductCard";
import { ProductReviews } from "@/components/features/products/ProductReviews";
import { ServiceBenefits } from "@/components/features/home/ServiceBenefits";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, cn } from "@/lib/utils";
import { imgUrl, ROUTES } from "@/constants";
import { productName, toCartProduct } from "@/lib/product";
import type { Product, ProductVariant } from "@/types";

type TabId = "description" | "reviews" | "delivery" | "returns";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Tavsif" },
  { id: "reviews",     label: "Fikrlar" },
  { id: "delivery",    label: "Yetkazib berish" },
  { id: "returns",     label: "Qaytarish" },
];

const TRUST = [
  { Icon: ShieldCheck, title: "100% original mahsulot", desc: "Sifat kafolatlangan" },
  { Icon: RotateCcw,   title: "14 kun ichida qaytarish", desc: "Qaytarish oson va tez" },
  { Icon: Headphones,  title: "24/7 qo'llab-quvvatlash", desc: "Har doim siz bilan" },
];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? "fill-store-gold text-store-gold" : "text-store-border"}
        />
      ))}
    </div>
  );
}

export function ProductDetailPage() {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { addItem: addToCart, setCart } = useCartStore();
  const { addLocalItem, removeLocalItem, hasItem, setWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [variantIdx, setVariantIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const [tab, setTab] = useState<TabId>("description");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  /* ── Yuklash ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setVariantIdx(0);
    setImageIdx(0);
    window.scrollTo(0, 0);

    productsService.getBySlug(slug)
      .then((p) => setProduct(p))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    productsService.getSimilar(slug)
      .then((list) => setSimilar(Array.isArray(list) ? list : []))
      .catch(() => setSimilar([]));
  }, [slug]);

  const variant: ProductVariant | undefined = product?.variants?.[variantIdx];
  const images = useMemo(() => product?.images ?? [], [product]);
  const price = variant ? parseFloat(String(variant.price)) : 0;
  const inStock = (variant?.stock ?? 0) > 0;
  const isWishlisted = variant ? hasItem(variant.id) : false;

  const handleAddToCart = async () => {
    if (!product || !variant || !inStock || adding) return;
    setAdding(true);
    const item = {
      variantId: variant.id,
      quantity: 1,
      variant,
      product: toCartProduct(product),
    };
    try {
      if (isAuthenticated) {
        const cart = await cartService.addItem(variant.id, 1);
        setCart(cart.items, cart.total);
      } else {
        addToCart(item);
      }
    } catch {
      addToCart(item);
    } finally {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate(ROUTES.CART);
  };

  const handleWishlist = async () => {
    if (!product || !variant) return;
    if (isAuthenticated) {
      try {
        const wl = isWishlisted
          ? await wishlistService.removeItem(variant.id)
          : await wishlistService.addItem(variant.id);
        setWishlist(wl.items);
        return;
      } catch { /* fallthrough to local */ }
    }
    if (isWishlisted) removeLocalItem(variant.id);
    else addLocalItem({
      variantId: variant.id,
      variant: {
        id: variant.id, sku: variant.sku, price: variant.price,
        stock: variant.stock, volume: variant.volume,
      },
      product: toCartProduct(product),
    });
  };

  /* ── Holatlar ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-xl bg-store-surface" />
            <div className="space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-store-surface" />
              <div className="h-7 w-3/4 animate-pulse rounded bg-store-surface" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-store-surface" />
              <div className="h-20 w-full animate-pulse rounded bg-store-surface" />
            </div>
          </div>
          <div className="h-[320px] animate-pulse rounded-xl bg-store-surface" />
        </div>
      </div>
    );
  }

  if (notFound || !product || !variant) {
    return (
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-5 px-4 py-24 text-center">
        <h1 className="font-serif text-[26px] font-medium text-store-text">Mahsulot topilmadi</h1>
        <p className="text-[13px] text-store-text-muted">
          Bu mahsulot o&apos;chirilgan yoki manzil noto&apos;g&apos;ri
        </p>
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex h-11 items-center rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  const name = productName(product);
  const mainImage = imgUrl(images[imageIdx]?.url) ?? "/placeholder.svg";

  return (
    <>
      <Helmet>
        <title>{`${name} — Zahabi Parfüm`}</title>
        <meta name="description" content={product.description_uz ?? name} />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 lg:px-10">
        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[12px] text-store-text-muted">
          <Link to={ROUTES.HOME} className="transition-colors hover:text-store-gold">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <Link to={ROUTES.PRODUCTS} className="transition-colors hover:text-store-gold">Parfyumlar</Link>
          <ChevronRight size={12} />
          <Link
            to={`${ROUTES.PRODUCTS}?category_slug=${product.category.slug}`}
            className="transition-colors hover:text-store-gold"
          >
            {product.category.name_uz}
          </Link>
          <ChevronRight size={12} />
          <span className="text-store-text">{name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          {/* ── Galereya + ma'lumot ───────────────────────────────── */}
          <div className="grid gap-6 md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[88px_minmax(0,1fr)]">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImageIdx(i)}
                    aria-label={`${i + 1}-rasm`}
                    className={cn(
                      "h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-lg border bg-store-card transition-colors",
                      i === imageIdx ? "border-store-gold" : "border-store-border hover:border-store-gold/50"
                    )}
                  >
                    <img
                      src={imgUrl(img.url) ?? "/placeholder.svg"}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Asosiy rasm */}
            <div className="order-1 md:order-2">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-store-border bg-store-card">
                <img
                  src={mainImage}
                  alt={name}
                  className="h-full w-full object-contain p-6"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                />

                <button
                  onClick={handleWishlist}
                  aria-label={isWishlisted ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                  className={cn(
                    "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                    isWishlisted
                      ? "border-store-gold bg-store-card text-store-gold"
                      : "border-store-border bg-store-card/80 text-store-text-dim hover:border-store-gold hover:text-store-gold"
                  )}
                >
                  <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIdx((i) => (i - 1 + images.length) % images.length)}
                      aria-label="Oldingi rasm"
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-store-border bg-store-card text-store-text-muted transition-colors hover:text-store-gold"
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <button
                      onClick={() => setImageIdx((i) => (i + 1) % images.length)}
                      aria-label="Keyingi rasm"
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-store-border bg-store-card text-store-text-muted transition-colors hover:text-store-gold"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </>
                )}
              </div>

              {/* ── Sarlavha va tanlovlar ─────────────────────────── */}
              <div className="mt-6">
                {product.brand && (
                  <Link
                    to={`${ROUTES.PRODUCTS}?brand_slug=${product.brand.slug}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-store-gold transition-opacity hover:opacity-75"
                  >
                    {product.brand.name}
                  </Link>
                )}

                <h1 className="mt-2 font-serif text-[28px] font-medium leading-tight text-store-text lg:text-[32px]">
                  {name}
                </h1>

                <p className="mt-1.5 text-[13px] text-store-text-muted">
                  {product.category.name_uz}
                </p>

                {/* Reyting — sharh bo'lmasa chiqmaydi */}
                {product.review_count > 0 && (
                  <button
                    onClick={() => setTab("reviews")}
                    className="mt-3 flex items-center gap-2 transition-opacity hover:opacity-75"
                  >
                    <Stars value={product.avg_rating ?? 0} />
                    <span className="text-[13px] text-store-text">
                      {(product.avg_rating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-[12.5px] text-store-text-muted">
                      ({product.review_count} baho)
                    </span>
                  </button>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-store-border px-3 py-1.5 text-[11.5px] text-store-text-muted">
                    <BadgeCheck size={13} className="text-store-gold" />
                    Original mahsulot
                  </span>
                  {product.is_bestseller && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-store-gold/30 bg-store-gold/10 px-3 py-1.5 text-[11.5px] text-store-gold">
                      <Star size={12} className="fill-store-gold" />
                      Bestseller
                    </span>
                  )}
                </div>

                {product.description_uz && (
                  <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-store-text-muted">
                    {product.description_uz}
                  </p>
                )}

                {/* Hajm tanlovi */}
                {product.variants.length > 1 && (
                  <div className="mt-6">
                    <p className="text-[12.5px] text-store-text-muted">
                      Hajm: <span className="font-medium text-store-text">{variant.volume ?? "—"}</span>
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {product.variants.map((v, i) => (
                        <button
                          key={v.id}
                          onClick={() => { setVariantIdx(i); setImageIdx(0); }}
                          disabled={v.stock === 0}
                          className={cn(
                            "h-10 min-w-[72px] rounded-md border px-4 text-[13px] transition-colors",
                            i === variantIdx
                              ? "border-store-gold bg-store-gold/10 font-medium text-store-gold"
                              : "border-store-border text-store-text-muted hover:border-store-gold/50",
                            v.stock === 0 && "cursor-not-allowed line-through opacity-40"
                          )}
                        >
                          {v.volume ?? v.sku}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Xususiyatlar — faqat mavjud ma'lumot */}
                <dl className="mt-6 grid gap-x-8 gap-y-2.5 text-[12.5px] sm:grid-cols-2">
                  {product.brand && (
                    <div className="flex gap-2">
                      <dt className="text-store-text-dim">Brend:</dt>
                      <dd className="text-store-text">{product.brand.name}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="text-store-text-dim">Kategoriya:</dt>
                    <dd className="text-store-text">{product.category.name_uz}</dd>
                  </div>
                  {variant.volume && (
                    <div className="flex gap-2">
                      <dt className="text-store-text-dim">Hajm:</dt>
                      <dd className="text-store-text">{variant.volume}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="text-store-text-dim">Artikul:</dt>
                    <dd className="text-store-text">{variant.sku}</dd>
                  </div>
                  {(product.attributes ?? []).map((a) => (
                    <div key={a.id} className="flex gap-2">
                      <dt className="text-store-text-dim">{a.name_uz}:</dt>
                      <dd className="text-store-text">{a.value}{a.unit ? ` ${a.unit}` : ""}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* ── Sotib olish paneli ────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-store-border bg-store-card p-5">
              <p className="font-serif text-[28px] leading-none text-store-text">
                {formatPrice(price)}
              </p>

              <p className={cn(
                "mt-3 flex items-center gap-1.5 text-[12.5px]",
                inStock ? "text-emerald-600" : "text-store-text-dim"
              )}>
                {inStock ? <Check size={14} /> : null}
                {inStock ? `Sotuvda mavjud (${variant.stock} dona)` : "Hozircha tugagan"}
              </p>

              <button
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className={cn(
                  "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md text-[14px] font-medium transition-all",
                  !inStock
                    ? "cursor-not-allowed border border-store-border text-store-text-dim opacity-50"
                    : added
                      ? "border border-store-gold bg-store-gold/10 text-store-gold"
                      : "bg-store-gold text-white hover:opacity-90"
                )}
              >
                {adding ? <Loader2 size={16} className="animate-spin" />
                  : added ? <Check size={16} />
                  : <ShoppingCart size={16} />}
                {!inStock ? "Tugagan" : added ? "Savatchaga qo'shildi" : "Savatchaga qo'shish"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock || adding}
                className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-store-gold text-[14px] font-medium text-store-gold transition-colors hover:bg-store-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Zap size={16} />
                Tez sotib olish
              </button>

              <div className="mt-5 flex items-start gap-3 rounded-lg border border-store-border p-4">
                <Truck size={18} strokeWidth={1.6} className="mt-0.5 flex-shrink-0 text-store-gold" />
                <div>
                  <p className="text-[12.5px] font-medium text-store-text">Bepul yetkazib berish</p>
                  <p className="mt-0.5 text-[11.5px] text-store-text-muted">500 000 so&apos;mdan boshlab</p>
                </div>
              </div>

              <ul className="mt-5 space-y-4 border-t border-store-border pt-5">
                {TRUST.map(({ Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <Icon size={17} strokeWidth={1.6} className="mt-0.5 flex-shrink-0 text-store-gold" />
                    <div>
                      <p className="text-[12.5px] font-medium text-store-text">{title}</p>
                      <p className="mt-0.5 text-[11.5px] text-store-text-muted">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* ── Tablar ──────────────────────────────────────────────── */}
        <div className="mt-10 rounded-xl border border-store-border bg-store-card">
          <div className="flex overflow-x-auto border-b border-store-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-shrink-0 border-b-2 px-6 py-4 text-[13px] transition-colors",
                  tab === t.id
                    ? "border-store-gold font-medium text-store-gold"
                    : "border-transparent text-store-text-muted hover:text-store-text"
                )}
              >
                {t.label}
                {t.id === "reviews" && product.review_count > 0 && ` (${product.review_count})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "description" && (
              <div className="max-w-3xl space-y-3 text-[13.5px] leading-relaxed text-store-text-muted">
                {product.description_uz
                  ? <p>{product.description_uz}</p>
                  : <p>Bu mahsulot uchun batafsil tavsif hozircha qo&apos;shilmagan.</p>}
              </div>
            )}

            {tab === "reviews" && (
              <ProductReviews
                productId={product.id}
                avgRating={product.avg_rating}
                reviewCount={product.review_count}
              />
            )}

            {tab === "delivery" && (
              <ul className="max-w-3xl space-y-3 text-[13.5px] leading-relaxed text-store-text-muted">
                <li>• Toshkent bo&apos;ylab — 1 ish kuni ichida.</li>
                <li>• Viloyatlarga — 2–4 ish kuni ichida.</li>
                <li>• 500 000 so&apos;mdan yuqori buyurtmalarga yetkazib berish bepul.</li>
                <li>• Undan past buyurtmalar uchun yetkazib berish 30 000 so&apos;m.</li>
                <li>• To&apos;lov — naqd yoki karta orqali (Visa, Mastercard, Uzcard, Humo).</li>
              </ul>
            )}

            {tab === "returns" && (
              <ul className="max-w-3xl space-y-3 text-[13.5px] leading-relaxed text-store-text-muted">
                <li>• Mahsulotni olganingizdan keyin 14 kun ichida qaytarishingiz mumkin.</li>
                <li>• Qadoq ochilmagan va mahsulot ishlatilmagan bo&apos;lishi kerak.</li>
                <li>• Qaytarish uchun +998 71 234-56-78 raqamiga murojaat qiling.</li>
                <li>• Pul mablag&apos;i 3–5 ish kuni ichida qaytariladi.</li>
              </ul>
            )}
          </div>
        </div>

        {/* ── O'xshash mahsulotlar ────────────────────────────────── */}
        {similar.length > 0 && (
          <section className="mt-12" aria-label="Sizga yoqishi mumkin">
            <h2 className="mb-6 font-serif text-[26px] font-medium text-store-text">
              Sizga yoqishi mumkin
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} compact showRating />
              ))}
            </div>
          </section>
        )}
      </div>

      <ServiceBenefits />
    </>
  );
}
