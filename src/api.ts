import { products, categories, reviews } from "./lib/data";
import pool from "./lib/mysql";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/api/products") {
    return handleProducts(url);
  }
  if (pathname.startsWith("/api/products/")) {
    const id = pathname.replace("/api/products/", "");
    const p = products.find((x) => x.id === id || x.slug === id);
    if (!p) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: jsonHeaders });
    return new Response(JSON.stringify(p), { headers: jsonHeaders });
  }
  if (pathname === "/api/categories") {
    const rows = categories.map((c) => ({
      name: c.name,
      description: c.desc,
      icon: c.icon,
      gradient: c.gradient,
    }));
    return new Response(JSON.stringify(rows), { headers: jsonHeaders });
  }
  if (pathname === "/api/reviews") {
    const rows = reviews.map((r, i) => ({ id: i + 1, ...r }));
    return new Response(JSON.stringify(rows), { headers: jsonHeaders });
  }
  if (pathname === "/api/users") {
    return handleUsers();
  }
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: jsonHeaders });
}

async function handleUsers(): Promise<Response> {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, plan, orders, status, DATE_FORMAT(joined_at, "%Y-%m-%d") AS joined FROM users ORDER BY id ASC`,
    );

    return new Response(JSON.stringify(rows), { headers: jsonHeaders });
  } catch (error) {
    console.error("users endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to load users" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}

function handleProducts(url: URL): Response {
  const p = url.searchParams;
  const category = p.get("category");
  const platform = p.get("platform");
  const region = p.get("region");
  const duration = p.get("duration");
  const brand = p.get("brand");
  const inStock = p.get("inStock");
  const minPrice = Number(p.get("minPrice") ?? 0);
  const maxPrice = Number(p.get("maxPrice") ?? 9999);
  const sort = p.get("sort") ?? "popular";

  let list = products.filter((x) => {
    if (category && category !== "All" && x.category !== category) return false;
    if (platform && platform !== "All" && x.platform !== platform) return false;
    if (region && region !== "All" && x.region !== region) return false;
    if (duration && duration !== "All" && x.duration !== duration) return false;
    if (brand && brand !== "All" && x.brand !== brand) return false;
    if (inStock === "true" && x.stock <= 0) return false;
    if (x.price < minPrice || x.price > maxPrice) return false;
    return true;
  });

  list = [...list].sort((a, b) => {
    switch (sort) {
      case "priceAsc": return a.price - b.price;
      case "priceDesc": return b.price - a.price;
      case "rating": return b.rating - a.rating;
      case "newest": return (b.flashEndsAt ?? 0) - (a.flashEndsAt ?? 0);
      default: return b.sold - a.sold;
    }
  });

  return new Response(JSON.stringify(list), { headers: jsonHeaders });
}
