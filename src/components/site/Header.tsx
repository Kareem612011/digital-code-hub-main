import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, Heart, User, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/contact", label: "Support" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>("/api/products"),
  });

  const suggestions =
    q.length > 1
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q.toLowerCase()) ||
              p.brand.toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="relative h-8 w-8 rounded-lg gradient-brand">
            <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
              S
            </div>
          </div>
          <span className="text-lg font-black tracking-tight">
            Sub<span className="text-gradient">Store</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative hidden flex-1 max-w-md lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 150)}
            placeholder="Search Netflix, Xbox, Spotify…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:bg-white/10"
          />
          {focus && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl glass-strong shadow-2xl">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  to="/products/$id"
                  params={{ id: p.id }}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-white/5"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 text-xs text-brand-accent">${p.price.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:inline-flex"
            aria-label="Language"
          >
            <Globe className="h-4 w-4" />
          </button>
          <Link
            to="/account"
            className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:inline-flex"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            to="/account"
            className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full gradient-brand px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
