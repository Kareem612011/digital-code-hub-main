import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Category, CategoryRow, Product } from "@/lib/types";
import { SlidersHorizontal, X } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — SubStore" },
      { name: "description", content: "Browse premium subscription codes with filters for platform, region, duration and price." },
    ],
  }),
  component: Shop,
});

type Sort = "popular" | "newest" | "priceAsc" | "priceDesc" | "rating";

function loadProducts(params: Record<string, string | number | boolean | null>) {
  return apiFetch<Product[]>("/api/products", params);
}

function loadCategories() {
  return apiFetch<CategoryRow[]>("/api/categories");
}

function Shop() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [platform, setPlatform] = useState<string>("All");
  const [region, setRegion] = useState<string>("All");
  const [duration, setDuration] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [inStock, setInStock] = useState(false);
  const [price, setPrice] = useState<[number, number]>([0, 100]);
  const [sort, setSort] = useState<Sort>("popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", cat, platform, region, duration, brand, inStock, price, sort],
    queryFn: () =>
      loadProducts({
        category: cat === "All" ? null : cat,
        platform: platform === "All" ? null : platform,
        region: region === "All" ? null : region,
        duration: duration === "All" ? null : duration,
        brand: brand === "All" ? null : brand,
        inStock: inStock ? "true" : null,
        minPrice: price[0],
        maxPrice: price[1],
        sort,
      }),
  });

  const { data: categories = [] } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: loadCategories,
  });

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))), [products]);
  const platforms = useMemo(() => Array.from(new Set(products.map((p) => p.platform))), [products]);
  const regions = useMemo(() => Array.from(new Set(products.map((p) => p.region))), [products]);
  const durations = useMemo(() => Array.from(new Set(products.map((p) => p.duration))), [products]);

  const filtered = products;

  const Select = ({ label, value, onChange, options }: any) => (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand"
      >
        <option value="All">All</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const Filters = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["All", ...categories.map((c) => c.name)] as (Category | "All")[]).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                cat === c
                  ? "gradient-brand text-white shadow-lg"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Select label="Platform" value={platform} onChange={setPlatform} options={platforms} />
      <Select label="Region" value={region} onChange={setRegion} options={regions} />
      <Select label="Duration" value={duration} onChange={setDuration} options={durations} />
      <Select label="Brand" value={brand} onChange={setBrand} options={brands} />
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price · ${price[0]} – ${price[1]}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={price[1]}
          onChange={(e) => setPrice([price[0], Number(e.target.value)])}
          className="mt-2 w-full accent-[color:var(--brand)]"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-[color:var(--brand)]" />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-accent">Marketplace</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Shop all subscriptions</h1>
          <p className="mt-2 text-sm text-muted-foreground">{filtered.length} products available</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="popular">Most popular</option>
            <option value="newest">Newest</option>
            <option value="priceAsc">Lowest price</option>
            <option value="priceDesc">Highest price</option>
            <option value="rating">Best rated</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-3xl glass p-5 lg:block">{Filters}</aside>

        {showFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
            <div className="relative ml-auto h-full w-80 overflow-y-auto glass-strong p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-bold">Filters</div>
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
              {Filters}
            </div>
          </div>
        )}

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-3xl glass p-16 text-center text-muted-foreground">
              No products match those filters.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
