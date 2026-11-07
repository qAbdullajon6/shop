import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, ChevronDown, ChevronUp, Grid2X2, List, X, PackageSearch } from "lucide-react";
import { ROUTES } from "@/constants";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { brandsService } from "@/services/brands.service";
import { ProductCard } from "@/components/features/products/ProductCard";
import { ServiceBenefits } from "@/components/features/home/ServiceBenefits";
import { formatPrice, cn } from "@/lib/utils";
import { productName, productImage, productPrice } from "@/lib/product";
import type { Product, ProductFilter, ProductFacets, Category, Brand } from "@/types";

const PAGE_SIZE = 12;
const PRICE_CEILING = 5_000_000;

const SORT_OPTIONS = [
  { value: "popular", label: "Mashhurlik bo'yicha", sort_by: "view_count",  sort_order: "desc" },
  { value: "new",     label: "Yangilari birinchi",  sort_by: "created_at",  sort_order: "desc" },
  { value: "cheap",   label: "Avval arzonlari",     sort_by: "price",       sort_order: "asc"  },
  { value: "expensive", label: "Avval qimmatlari",  sort_by: "price",       sort_order: "desc" },
  { value: "name",    label: "Nomi bo'yicha",       sort_by: "name",        sort_order: "asc"  },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/* ── Yig'iladigan filtr bloki ──────────────────────────────────────────── */
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-store-border px-5 py-4 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-store-text">
          {title}
        </span>
        {open ? (
          <ChevronUp size={15} className="text-store-text-dim" />
        ) : (
          <ChevronDown size={15} className="text-store-text-dim" />
        )}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

/* ── Saralash dropdowni ────────────────────────────────────────────────── */
function SortDropdown({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-store-border bg-store-card px-4 text-[13px] text-store-text transition-colors hover:border-store-gold/50 sm:w-[280px]"
      >
        <span>
          <span className="text-store-text-muted">Saralash: </span>
          {active.label}
        </span>
        <ChevronDown size={15} className={cn("text-store-text-dim transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul className="absolute right-0 z-20 mt-1 w-full overflow-hidden rounded-md border border-store-border bg-store-card shadow-lg">
          {SORT_OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  "block w-full px-4 py-2.5 text-left text-[13px] transition-colors",
                  o.value === value
                    ? "bg-store-gold/10 font-medium text-store-gold"
                    : "text-store-text-muted hover:bg-store-surface hover:text-store-text"
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Checkbox ──────────────────────────────────────────────────────────── */
function FilterCheckbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-store-gold"
      />
      <span className="flex-1 truncate text-[13px] text-store-text-muted">{label}</span>
      {count !== undefined && (
        <span className="text-[12px] tabular-nums text-store-text-dim">{count}</span>
      )}
    </label>
  );
}

/* ── Ro'yxat ko'rinishidagi karta ──────────────────────────────────────── */
function ProductRow({ product }: { product: Product }) {
  const name = productName(product);
  const price = productPrice(product);
  return (
    <Link
      to={`${ROUTES.PRODUCTS}/${product.slug}`}
      className="flex items-center gap-5 rounded-xl border border-store-border bg-store-card p-4 transition-colors hover:border-store-gold/40"
    >
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-store-card">
        <img
          src={productImage(product)}
          alt={name}
          loading="lazy"
          className="h-full w-full object-contain p-1"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-store-text">{name}</p>
        {product.brand && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-store-text-dim">
            {product.brand.name}
          </p>
        )}
        <p className="mt-2 text-[15px] font-bold text-store-text">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-store-border bg-store-card">
      <div className="aspect-square animate-pulse bg-store-surface" />
      <div className="space-y-2 px-4 pb-4 pt-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-store-surface" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-store-surface" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-store-surface" />
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [params, setParams] = useSearchParams();

  const search       = params.get("search") ?? "";
  const categorySlug = params.get("category_slug") ?? "";
  const brandSlugs   = (params.get("brand_slug") ?? "").split(",").filter(Boolean);
  const minPrice     = params.get("min_price") ?? "";
  const maxPrice     = params.get("max_price") ?? "";
  const sort         = (params.get("sort") ?? "popular") as SortValue;
  const onSale       = params.get("on_sale") === "true";
  const isBestseller = params.get("is_bestseller") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  /* ── Filtr o'zgarishlari URL orqali boshqariladi ────────────────────── */
  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    });
    setParams(next);
    setPage(1);
  };

  /* ── Kategoriya va brendlar ─────────────────────────────────────────── */
  useEffect(() => {
    categoriesService.getAll()
      .then((data: Category[]) => setCategories(data.filter((c) => c.is_active && !c.parent_id)))
      .catch(() => {});
    brandsService.getAll()
      .then((data: Brand[]) => setBrands(data.filter((b) => b.is_active)))
      .catch(() => {});
  }, []);

  /* ── Facet hisoblari: backend aggregatsiyasidan (butun katalog bo'yicha) ─
     Kategoriya hisoblari kategoriya filtridan mustaqil; brend hisoblari
     tanlangan kategoriyaga moslashadi. */
  useEffect(() => {
    productsService.getFacets(categorySlug || undefined)
      .then(setFacets)
      .catch(() => setFacets(null));
  }, [categorySlug]);

  /* ── Asosiy ro'yxat ─────────────────────────────────────────────────── */
  useEffect(() => {
    const opt = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];
    const f: ProductFilter = {
      page,
      limit: PAGE_SIZE,
      sort_by: opt.sort_by as ProductFilter["sort_by"],
      sort_order: opt.sort_order as ProductFilter["sort_order"],
    };
    if (search) f.search = search;
    if (categorySlug) f.category_slug = categorySlug;
    if (brandSlugs.length === 1) f.brand_slug = brandSlugs[0];
    if (minPrice) f.min_price = Number(minPrice);
    if (maxPrice) f.max_price = Number(maxPrice);
    if (isBestseller) f.is_bestseller = true;

    const first = page === 1;
    if (first) { setLoading(true); setError(false); } else setLoadingMore(true);

    productsService.getAll(f)
      .then((res) => {
        /* Backend faqat bitta brand_slug qabul qiladi — bir nechta tanlansa
           qolganini mijoz tomonda filtrlaymiz. */
        const rows = brandSlugs.length > 1
          ? res.data.filter((p) => p.brand && brandSlugs.includes(p.brand.slug))
          : res.data;
        setProducts((prev) => (first ? rows : [...prev, ...rows]));
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(() => { if (first) setError(true); })
      .finally(() => { setLoading(false); setLoadingMore(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categorySlug, params.get("brand_slug"), minPrice, maxPrice, sort, isBestseller, page]);

  /* ── Hisoblangan facetlar (backenddan) ──────────────────────────────── */
  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    facets?.categories.forEach((c) => m.set(c.slug, c.count));
    return m;
  }, [facets]);

  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    facets?.brands.forEach((b) => m.set(b.slug, b.count));
    return m;
  }, [facets]);

  const totalCatalog = facets?.total ?? total;

  /* Faqat joriy tanlovda mahsuloti bor brendlar ko'rsatiladi */
  const visibleBrands = useMemo(
    () => brands.filter((b) => (brandCounts.get(b.slug) ?? 0) > 0),
    [brands, brandCounts]
  );
  const shownBrands = showAllBrands ? visibleBrands : visibleBrands.slice(0, 5);

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const heading = activeCategory ? activeCategory.name_uz : search ? `"${search}" bo'yicha natijalar` : "Barcha parfyumlar";

  const toggleBrand = (slug: string) => {
    const next = brandSlugs.includes(slug)
      ? brandSlugs.filter((s) => s !== slug)
      : [...brandSlugs, slug];
    patchParams({ brand_slug: next.join(",") || null });
  };

  const applyPrice = () => patchParams({ min_price: priceMin || null, max_price: priceMax || null });

  const hasFilters = Boolean(categorySlug || brandSlugs.length || minPrice || maxPrice || search || isBestseller || onSale);

  const resetAll = () => {
    setPriceMin(""); setPriceMax("");
    setParams(new URLSearchParams());
    setPage(1);
  };

  /* ── Filtr paneli (desktop + mobil bir xil) ─────────────────────────── */
  const filterPanel = (
    <div className="overflow-hidden rounded-xl border border-store-border bg-store-card">
      <FilterSection title="Kategoriya">
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => patchParams({ category_slug: null })}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                !categorySlug
                  ? "bg-store-gold/10 font-medium text-store-gold"
                  : "text-store-text-muted hover:bg-store-surface hover:text-store-text"
              )}
            >
              Barchasi
              <span className="tabular-nums text-[12px] text-store-text-dim">{totalCatalog}</span>
            </button>
          </li>
          {categories.map((c) => {
            const count = categoryCounts.get(c.slug) ?? 0;
            return (
              <li key={c.id}>
                <button
                  onClick={() => patchParams({ category_slug: c.slug })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                    categorySlug === c.slug
                      ? "bg-store-gold/10 font-medium text-store-gold"
                      : "text-store-text-muted hover:bg-store-surface hover:text-store-text"
                  )}
                >
                  <span className="truncate">{c.name_uz}</span>
                  <span className="ml-2 tabular-nums text-[12px] text-store-text-dim">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {visibleBrands.length > 0 && (
        <FilterSection title="Brend">
          <div>
            {shownBrands.map((b) => (
              <FilterCheckbox
                key={b.id}
                label={b.name}
                count={brandCounts.get(b.slug)}
                checked={brandSlugs.includes(b.slug)}
                onChange={() => toggleBrand(b.slug)}
              />
            ))}
            {visibleBrands.length > 5 && (
              <button
                onClick={() => setShowAllBrands((v) => !v)}
                className="mt-2 flex items-center gap-1 text-[12.5px] font-medium text-store-gold transition-opacity hover:opacity-75"
              >
                {showAllBrands ? "Kamroq ko'rsatish" : "Ko'proq ko'rish"}
                {showAllBrands ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Narx">
        <div className="flex items-center gap-2">
          {([
            ["Min", priceMin, setPriceMin],
            ["Max", priceMax, setPriceMax],
          ] as const).map(([ph, val, setter]) => (
            <div key={ph} className="relative flex-1">
              <input
                type="number"
                min={0}
                value={val}
                placeholder={ph}
                onChange={(e) => setter(e.target.value)}
                onBlur={applyPrice}
                onKeyDown={(e) => { if (e.key === "Enter") applyPrice(); }}
                className="h-10 w-full rounded-md border border-store-border bg-store-input pl-3 pr-11 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-store-text-dim">
                so&apos;m
              </span>
            </div>
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={PRICE_CEILING}
          step={50_000}
          value={priceMax || PRICE_CEILING}
          onChange={(e) => setPriceMax(e.target.value)}
          onMouseUp={applyPrice}
          onTouchEnd={applyPrice}
          aria-label="Maksimal narx"
          className="mt-4 w-full accent-store-gold"
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-store-text-dim">
          <span>0 so&apos;m</span>
          <span>{PRICE_CEILING.toLocaleString("ru-RU")}+ so&apos;m</span>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`${heading} — Zahabi Parfüm`}</title>
        <meta name="description" content={`${heading} — Zahabi Parfüm katalogi. Original brendlar, O'zbekiston bo'ylab yetkazib berish.`} />
      </Helmet>

      <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-store-text-muted">
          <Link to={ROUTES.HOME} className="transition-colors hover:text-store-gold">Bosh sahifa</Link>
          <ChevronRight size={12} />
          <Link to={ROUTES.PRODUCTS} className="transition-colors hover:text-store-gold">Parfyumlar</Link>
          {activeCategory && (
            <>
              <ChevronRight size={12} />
              <span className="text-store-text">{activeCategory.name_uz}</span>
            </>
          )}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          {/* ── Yon panel ─────────────────────────────────────────── */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            {filterPanel}
            {hasFilters && (
              <button
                onClick={resetAll}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-store-border py-2.5 text-[12.5px] text-store-text-muted transition-colors hover:border-store-gold hover:text-store-gold"
              >
                <X size={14} />
                Filtrlarni tozalash
              </button>
            )}
          </aside>

          {/* ── Kontent ───────────────────────────────────────────── */}
          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-serif text-[28px] font-medium leading-tight text-store-text lg:text-[32px]">
                  {heading}
                </h1>
                <p className="mt-1.5 text-[13px] text-store-text-muted">
                  {loading ? "Yuklanmoqda..." : `${total} ta mahsulot`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <SortDropdown value={sort} onChange={(v) => patchParams({ sort: v })} />
                <div className="hidden overflow-hidden rounded-md border border-store-border sm:flex">
                  {([["grid", Grid2X2], ["list", List]] as const).map(([v, Icon]) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      aria-label={v === "grid" ? "Katak ko'rinish" : "Ro'yxat ko'rinish"}
                      className={cn(
                        "flex h-11 w-11 items-center justify-center transition-colors",
                        view === v ? "bg-store-gold/10 text-store-gold" : "text-store-text-dim hover:text-store-text"
                      )}
                    >
                      <Icon size={17} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobil filtr */}
            <button
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-md border border-store-border py-3 text-[13px] text-store-text lg:hidden"
            >
              Filtrlar
              {mobileFiltersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {mobileFiltersOpen && <div className="mb-5 lg:hidden">{filterPanel}</div>}

            {/* Ro'yxat */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-store-border bg-store-card py-20 text-center">
                <p className="text-[13px] text-store-text-muted">Mahsulotlarni yuklab bo&apos;lmadi.</p>
                <button
                  onClick={() => setPage(1)}
                  className="mt-3 text-[12.5px] font-medium text-store-gold hover:underline"
                >
                  Qayta urinish
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center gap-5 rounded-xl border border-store-border bg-store-card py-20 text-center">
                <div className="rounded-full border border-store-border bg-store-surface p-5">
                  <PackageSearch size={34} strokeWidth={1.4} className="text-store-text-dim" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-serif text-[22px] font-medium text-store-text">Mahsulot topilmadi</h2>
                  <p className="text-[13px] text-store-text-muted">Filtrlarni o&apos;zgartirib ko&apos;ring</p>
                </div>
                {hasFilters && (
                  <button
                    onClick={resetAll}
                    className="inline-flex h-11 items-center rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} compact showRating />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => <ProductRow key={p.id} product={p} />)}
              </div>
            )}

            {/* Yana yuklash */}
            {!loading && !error && page < totalPages && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-store-border bg-store-card px-8 text-[13px] text-store-text transition-colors hover:border-store-gold hover:text-store-gold disabled:opacity-50"
                >
                  {loadingMore ? "Yuklanmoqda..." : "Yana ko'proq yuklash"}
                  <ChevronDown size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceBenefits />
    </>
  );
}
