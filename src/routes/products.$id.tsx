import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { BrandTile } from "@/components/site/BrandTile";
import { ProductCard } from "@/components/site/ProductCard";
import { Section } from "@/components/site/Section";
import type { Product } from "@/lib/types";
import {
  Zap,
  Shield,
  Globe2,
  Star,
  ShoppingCart,
  Heart,
  Check,
  Truck,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    if (!params.id) throw notFound();
    try {
      const product = await apiFetch<Product>("/api/products", { id: params.id });
      return { product };
    } catch (error) {
      throw notFound();
    }
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.product.name} — SubStore` },
            { name: "description", content: loaderData.product.description.slice(0, 155) },
            { property: "og:title", content: loaderData.product.name },
            { property: "og:description", content: loaderData.product.description.slice(0, 155) },
          ],
        }
      : { meta: [{ title: "Not found — SubStore" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center">
      <h1 className="text-3xl font-black">Product not found</h1>
      <Link
        to="/shop"
        className="mt-6 inline-block rounded-xl gradient-brand px-5 py-2.5 font-semibold text-white"
      >
        Back to shop
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { add, toggleWish, wishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  const wished = wishlist.includes(product.id);
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["relatedProducts", product.category],
    queryFn: () => apiFetch<Product[]>("/api/products", { category: product.category }),
    enabled: !!product.category,
  });
  const related = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <BrandTile
            brand={product.brand}
            gradient={product.brandColor}
            size="xl"
            subtitle={product.duration}
            className="aspect-square w-full glow-brand"
          />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <BrandTile
                key={i}
                brand={product.brand}
                gradient={product.brandColor}
                size="sm"
                className="aspect-square opacity-70 hover:opacity-100 transition"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-accent/15 px-2.5 py-1 text-xs font-medium text-brand-accent">
              <Zap className="mr-1 inline h-3 w-3" /> Instant Digital Delivery
            </span>
            {product.stock > 0 ? (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <Check className="mr-1 inline h-3 w-3" /> In stock · {product.stock} left
              </span>
            ) : (
              <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-400">
                Out of stock
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
              <Globe2 className="h-3 w-3" /> {product.region}
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{product.sold.toLocaleString()} sold</span>
          </div>

          <div className="mt-6 rounded-2xl glass p-5">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gradient">${product.price.toFixed(2)}</span>
              <span className="text-base text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-300">
                  Save {discount}%
                </span>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-2.5">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => add(product.id, qty)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={() => toggleWish(product.id)}
                aria-label="Wishlist"
                className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
              >
                <Heart className={`h-4 w-4 ${wished ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            <Link
              to="/checkout"
              onClick={() => add(product.id, qty)}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl gradient-brand px-4 py-3.5 text-sm font-semibold text-white shadow-lg glow-brand transition hover:scale-[1.01] active:scale-95"
            >
              Buy Now — ${(product.price * qty).toFixed(2)}
            </Link>

            <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
              {[
                { i: Zap, l: "Instant" },
                { i: Shield, l: "Protected" },
                { i: Truck, l: "Email delivery" },
              ].map(({ i: Icon, l }) => (
                <div
                  key={l}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-accent" /> {l}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Info label="Platform" value={product.platform} />
            <Info label="Region" value={product.region} />
            <Info label="Duration" value={product.duration} />
            <Info label="Delivery" value="Email · 30s" />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Description">
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </Card>
          <Card title="What's included">
            <ul className="space-y-2 text-sm">
              {product.includes.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {x}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Activation guide">
            <ol className="space-y-3 text-sm">
              {product.activation.map((x, i) => (
                <li key={x} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <div>
          <Card title="Frequently asked">
            <div className="divide-y divide-white/5">
              {product.faqs.map((f, i) => (
                <button
                  key={f.q}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="block w-full py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {f.q}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </div>
                  {openFaq === i && <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {related.length > 0 && (
        <Section title="You might also like">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-6">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
