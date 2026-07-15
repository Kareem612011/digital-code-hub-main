import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { BrandTile } from "@/components/site/BrandTile";
import { Trash2, Minus, Plus, ShoppingBag, Tag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — SubStore" }] }),
  component: CartPage,
});

function CartPage() {
  const { detailed, setQty, remove, subtotal } = useCart();
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);
  const discount = applied ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-black">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse the shop to add subscriptions.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-xl gradient-brand px-5 py-3 font-semibold text-white">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {detailed.map(({ product, qty }) => (
            <div key={product.id} className="flex flex-wrap items-center gap-4 rounded-2xl glass p-4">
              <div className="h-20 w-20 shrink-0">
                <BrandTile brand={product.brand} gradient={product.brandColor} size="md" className="h-full w-full" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to="/products/$id" params={{ id: product.id }} className="line-clamp-1 font-semibold hover:text-brand-accent">
                  {product.name}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">{product.region} · {product.duration}</div>
              </div>
              <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
                <button onClick={() => setQty(product.id, qty - 1)} className="p-2"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(product.id, qty + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="w-24 text-right font-bold">${(product.price * qty).toFixed(2)}</div>
              <button onClick={() => remove(product.id)} className="rounded-lg p-2 text-muted-foreground hover:text-rose-400" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl glass p-6">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Promo code (try SUB10)"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
            <button
              onClick={() => setApplied(promo.trim().toUpperCase() === "SUB10")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold hover:bg-white/10"
            >
              Apply
            </button>
          </div>
          {applied && <div className="mt-2 text-xs text-emerald-400">✓ 10% off applied</div>}

          <div className="mt-5 space-y-2 text-sm">
            <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            {applied && <Row label="Promo (SUB10)" value={`−$${discount.toFixed(2)}`} accent />}
            <Row label="Tax (est. 8%)" value={`$${tax.toFixed(2)}`} muted />
            <div className="my-3 border-t border-white/10" />
            <Row label="Total" value={`$${total.toFixed(2)}`} bold />
          </div>

          <Link to="/checkout" className="mt-6 flex items-center justify-center rounded-xl gradient-brand px-4 py-3.5 text-sm font-semibold text-white shadow-lg">
            Continue to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, bold, accent }: { label: string; value: string; muted?: boolean; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : ""}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={accent ? "text-emerald-400" : ""}>{value}</span>
    </div>
  );
}
