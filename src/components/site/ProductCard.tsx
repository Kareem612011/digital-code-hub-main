import { Link } from "@tanstack/react-router";
import { Heart, Star, Zap, ShoppingCart, Globe2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { BrandTile } from "./BrandTile";

export function ProductCard({ product }: { product: Product }) {
  const { add, toggleWish, wishlist } = useCart();
  const wished = wishlist.includes(product.id);
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const discount =
    originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:-translate-y-1 hover:glow-brand">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <BrandTile
          brand={product.brand}
          gradient={product.brandColor}
          size="xl"
          subtitle={product.duration}
          className="h-full w-full rounded-none transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            −{discount}%
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(product.id);
          }}
          aria-label="Wishlist"
          className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 font-medium text-brand-accent">
            <Zap className="mr-1 inline h-3 w-3" />
            Instant
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
            <Globe2 className="h-3 w-3" /> {product.region}
          </span>
        </div>

        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors hover:text-brand-accent">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{product.rating}</span>
          </span>
          <span>·</span>
          <span>{product.sold.toLocaleString()} sold</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
            <span className="text-lg font-bold text-gradient">${price.toFixed(2)}</span>
          </div>
          <button
            onClick={() => add(product.id)}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
