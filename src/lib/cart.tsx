import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";
import type { Product } from "./types";

export interface CartItem {
  id: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  wishlist: string[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  count: number;
  subtotal: number;
  detailed: (CartItem & { product: Product })[];
}

const Ctx = createContext<CartCtx | null>(null);

function useHydratedState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [key]);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state, hydrated]);
  return [state, setState];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useHydratedState<CartItem[]>("substore.cart", []);
  const [wishlist, setWishlist] = useHydratedState<string[]>("substore.wish", []);
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>('/api/products'),
    staleTime: 1000 * 60 * 5,
  });

  const value = useMemo<CartCtx>(() => {
    const detailed = items
      .map((i) => {
        const product = products.find((p) => p.id === i.id);
        return product ? { ...i, product } : null;
      })
      .filter(Boolean) as (CartItem & { product: Product })[];

    return {
      items,
      wishlist,
      detailed,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: detailed.reduce((s, i) => s + i.product.price * i.qty, 0),
      add: (id, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((x) => x.id === id);
          if (existing) return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x));
          return [...prev, { id, qty }];
        }),
      remove: (id) => setItems((prev) => prev.filter((x) => x.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) => (qty <= 0 ? prev.filter((x) => x.id !== id) : prev.map((x) => (x.id === id ? { ...x, qty } : x)))),
      clear: () => setItems([]),
      toggleWish: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    };
  }, [items, wishlist, setItems, setWishlist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
