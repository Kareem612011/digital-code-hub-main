import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { ProductCard } from "@/components/site/ProductCard";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { Reviews } from "@/components/site/Reviews";
import { Newsletter } from "@/components/site/Newsletter";
import { Countdown } from "@/components/site/Countdown";
import { apiFetch } from "@/lib/api";
import type { CategoryRow, Product } from "@/lib/types";
import { Flame, TrendingUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function loadProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products");
}

function loadCategories(): Promise<CategoryRow[]> {
  return apiFetch<CategoryRow[]>("/api/categories");
}

function Home() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: loadProducts,
  });
  const { data: categories = [] } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: loadCategories,
  });

  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 8), [products]);
  const best = useMemo(() => products.filter((p) => p.bestSeller).slice(0, 4), [products]);
  const fresh = useMemo(() => products.filter((p) => p.newArrival).slice(0, 4), [products]);
  const flash = useMemo(() => products.filter((p) => p.flashDeal), [products]);

  return (
    <div>
      <Hero />

      {/* Flash deals bar */}
      {flash.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                  Flash Deals
                </div>
                <div className="text-base font-bold">Limited-time drops · up to 70% off</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Ends in</span>
              <Countdown target={flash[0].flashEndsAt!} />
              <Link
                to="/shop"
                className="rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-white"
              >
                Shop deals
              </Link>
            </div>
          </div>
        </section>
      )}

      <Section
        eyebrow="Handpicked"
        title="Featured deals"
        desc="Editor's picks across streaming, gaming and productivity."
        linkTo="/shop"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Trending"
        title="Best sellers"
        desc="What everyone's buying right now."
        linkTo="/shop"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {best.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Fresh drops"
        title="New arrivals"
        desc="Just added to the store."
        linkTo="/shop"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fresh.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Browse"
        title="Popular categories"
        desc="Find exactly what you're looking for."
      >
        <CategoryGrid categories={categories} />
      </Section>

      <Section eyebrow="On fire" title="Flash sale" desc="Grab it before the timer runs out.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flash.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              <div className="absolute right-3 bottom-[calc(50%+8px)] hidden" />
              {p.flashEndsAt && (
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                  <span className="text-xs text-muted-foreground">Ends in</span>
                  <Countdown target={p.flashEndsAt} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Loved by 500k+ buyers" title="What customers say">
        <Reviews />
      </Section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <Newsletter />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { i: TrendingUp, t: "500k+ orders", d: "Delivered with a 4.9★ average rating." },
            { i: Sparkles, t: "Verified codes", d: "Sourced from authorized partners only." },
            { i: Flame, t: "Save up to 70%", d: "Members-only pricing on premium brands." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="flex items-start gap-4 rounded-2xl glass p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-base font-bold">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
