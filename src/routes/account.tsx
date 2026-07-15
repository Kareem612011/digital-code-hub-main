import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { BrandTile } from "@/components/site/BrandTile";
import { Package, Download, Heart, MapPin, CreditCard, User, Settings, FileText } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — SubStore" }, { name: "robots", content: "noindex" }] }),
  component: Account,
});

const menu = [
  { id: "orders", l: "Orders", i: Package },
  { id: "downloads", l: "Downloads", i: Download },
  { id: "wishlist", l: "Wishlist", i: Heart },
  { id: "addresses", l: "Addresses", i: MapPin },
  { id: "payment", l: "Payment Methods", i: CreditCard },
  { id: "profile", l: "Profile", i: User },
  { id: "settings", l: "Settings", i: Settings },
];

const demoOrders = [
  { id: "ORD-10482", date: "Jul 09, 2026", status: "Delivered", pid: "netflix-premium-1m", code: "NFLX-9K2M-XQ7T-PLM3" },
  { id: "ORD-10441", date: "Jun 22, 2026", status: "Delivered", pid: "spotify-premium", code: "SPTY-4Z1A-HB88-TR6D" },
  { id: "ORD-10399", date: "Jun 03, 2026", status: "Delivered", pid: "xbox-gamepass-ultimate", code: "XGPU-77KL-99AV-QP11" },
];

function Account() {
  const [tab, setTab] = useState("orders");
  const { wishlist } = useCart();
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>("/api/products"),
  });
  const wishItems = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-xl font-black text-white">JD</div>
        <div>
          <h1 className="text-2xl font-black">Welcome back, Jane</h1>
          <p className="text-sm text-muted-foreground">jane@example.com · Member since 2024</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl glass p-3">
          {menu.map((m) => (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                tab === m.id ? "gradient-brand text-white shadow-lg" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <m.i className="h-4 w-4" />
              {m.l}
            </button>
          ))}
        </aside>

        <div className="rounded-2xl glass p-6">
          {tab === "orders" && (
            <div>
              <h2 className="text-lg font-bold">Order history</h2>
              <div className="mt-4 space-y-3">
                {demoOrders.map((o) => {
                  const p = products.find((x) => x.id === o.pid)!;
                  return (
                    <div key={o.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="h-16 w-16 shrink-0"><BrandTile brand={p.brand} gradient={p.brandColor} size="sm" className="h-full w-full" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">{o.status}</span>
                      <div className="hidden rounded-lg bg-white/5 px-3 py-2 font-mono text-xs sm:block">{o.code}</div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10">
                          <Download className="h-3.5 w-3.5" /> Code
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10">
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {tab === "downloads" && (
            <div>
              <h2 className="text-lg font-bold">Downloads</h2>
              <p className="mt-2 text-sm text-muted-foreground">Every code you've purchased, available anytime.</p>
              <div className="mt-4 space-y-2">
                {demoOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <div className="text-sm font-semibold">{products.find((p) => p.id === o.pid)?.name}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{o.code}</div>
                    </div>
                    <button className="inline-flex items-center gap-1 rounded-lg gradient-brand px-3 py-2 text-xs font-semibold text-white">
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "wishlist" && (
            <div>
              <h2 className="text-lg font-bold">Wishlist</h2>
              {wishItems.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Save products you love by tapping the heart icon.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {wishItems.map((p) => (
                    <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10">
                      <div className="h-14 w-14 shrink-0"><BrandTile brand={p.brand} gradient={p.brandColor} size="sm" className="h-full w-full" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-semibold">{p.name}</div>
                        <div className="text-sm font-bold text-gradient">${p.price.toFixed(2)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "addresses" && <Empty title="Addresses" desc="Manage billing addresses used at checkout." />}
          {tab === "payment" && <Empty title="Payment methods" desc="Add or remove saved cards and wallets." />}
          {tab === "profile" && <Empty title="Profile" desc="Update your name, email and password." />}
          {tab === "settings" && <Empty title="Settings" desc="Notifications, currency, language and more." />}
        </div>
      </div>
    </div>
  );
}

function Empty({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
        Nothing here yet.
      </div>
    </div>
  );
}
