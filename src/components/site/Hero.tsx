import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Shield, Star } from "lucide-react";
import { BrandTile } from "./BrandTile";

const heroBrands = [
  { brand: "Netflix", gradient: "from-red-600 to-rose-900", slug: "netflix-premium-1m" },
  { brand: "Xbox", gradient: "from-emerald-500 to-green-800", slug: "xbox-gamepass-ultimate" },
  { brand: "PlayStation", gradient: "from-blue-600 to-indigo-900", slug: "psn-plus-essential" },
  { brand: "Spotify", gradient: "from-green-500 to-emerald-800", slug: "spotify-premium" },
  { brand: "Disney+", gradient: "from-sky-500 to-indigo-800", slug: "disney-plus" },
  { brand: "Crunchyroll", gradient: "from-orange-500 to-amber-800", slug: "crunchyroll-premium" },
  { brand: "YouTube", gradient: "from-red-500 to-rose-900", slug: "youtube-premium" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand/30 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-brand-2/30 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-brand-accent/25 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pt-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent" />
            </span>
            Live · 12,483 codes delivered today
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Premium subscriptions,{" "}
            <span className="text-gradient">delivered in seconds.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Netflix, Game Pass, Spotify, Disney+ and more. Save up to 60% on official codes with instant email delivery and full buyer protection.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-2xl gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-xl glow-brand transition-transform hover:scale-[1.02] active:scale-95"
            >
              Shop all subscriptions
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10"
            >
              Browse categories
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-brand-accent" /> Instant digital delivery</div>
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-brand-accent" /> 100% buyer protection</div>
            <div className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 · 84k reviews</div>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {heroBrands.slice(0, 6).map((b, i) => (
              <Link
                key={b.brand}
                to="/products/$id"
                params={{ id: b.slug }}
                className={`transition-transform hover:-translate-y-1 ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <BrandTile
                  brand={b.brand}
                  gradient={b.gradient}
                  size={i === 0 ? "xl" : "lg"}
                  className={`${i === 0 ? "aspect-square" : "aspect-square"} glow-brand`}
                />
              </Link>
            ))}
          </div>
          <Link
            to="/products/$id"
            params={{ id: heroBrands[6].slug }}
            className="mt-3 block sm:mt-4"
          >
            <BrandTile
              brand={heroBrands[6].brand}
              gradient={heroBrands[6].gradient}
              size="lg"
              subtitle="Ad-free music & videos"
              className="h-24"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
