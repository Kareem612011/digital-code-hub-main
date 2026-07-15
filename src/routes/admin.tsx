import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SubStore" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const tabs = ["Overview", "Products", "Categories", "Coupons", "Orders", "Users"];

const chart = [30, 45, 42, 60, 58, 72, 68, 84, 79, 92, 88, 100];

function Admin() {
  const [tab, setTab] = useState("Overview");
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>("/api/products"),
  });
  const stats = [
    { l: "Revenue", v: "$482,930", d: "+12.4%", i: DollarSign },
    { l: "Orders", v: "8,241", d: "+4.7%", i: ShoppingBag },
    { l: "Customers", v: "24,113", d: "+9.1%", i: Users },
    { l: "Products", v: String(products.length), d: "", i: Package },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-accent">Admin</div>
          <h1 className="mt-1 text-4xl font-black">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                tab === t ? "gradient-brand text-white shadow-lg" : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Overview" && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="rounded-2xl glass p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
                    <s.i className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-black">{s.v}</div>
                {s.d && <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400"><TrendingUp className="h-3 w-3" />{s.d}</div>}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl glass p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Revenue (12 mo)</h2>
                <span className="text-xs text-muted-foreground">+18% YoY</span>
              </div>
              <div className="mt-6 flex h-56 items-end gap-2">
                {chart.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg gradient-brand transition-all"
                      style={{ height: `${v}%` }}
                    />
                    <div className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl glass p-6">
              <h2 className="text-lg font-bold">Top products</h2>
              <div className="mt-4 space-y-3">
                {products.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="line-clamp-1">{p.name}</span>
                    <span className="shrink-0 font-semibold text-brand-accent">${(p.price * p.sold / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "Products" && (
        <div className="mt-8 rounded-2xl glass p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Products ({products.length})</h2>
            <button className="rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-white">+ Add product</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="text-muted-foreground">{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td className="text-muted-foreground">{p.sold.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab !== "Overview" && tab !== "Products" && (
        <div className="mt-8 rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
          {tab} management coming soon.
        </div>
      )}
    </div>
  );
}
