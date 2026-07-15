import { reviews } from "./lib/data";
import pool from "./lib/mysql";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/api/products") {
    return handleProducts(url);
  }
  if (pathname.startsWith("/api/products/")) {
    return handleProductById(pathname.replace("/api/products/", ""));
  }
  if (pathname === "/api/categories") {
    return handleCategories(request);
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

function castProduct(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    includes: parseJsonArray(row.includes),
    activation: parseJsonArray(row.activation),
    faqs: parseJsonArray(row.faqs),
    instant: toBoolean(row.instant),
    featured: toBoolean(row.featured),
    bestSeller: toBoolean(row.bestSeller),
    newArrival: toBoolean(row.newArrival),
    flashDeal: toBoolean(row.flashDeal),
    price: Number(row.price ?? 0),
    originalPrice: Number(row.originalPrice ?? 0),
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    sold: Number(row.sold ?? 0),
    stock: Number(row.stock ?? 0),
    flashEndsAt: row.flashEndsAt === null || row.flashEndsAt === undefined ? null : Number(row.flashEndsAt),
  };
}

function parseJsonArray(value: unknown): unknown[] {
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
  return false;
}

async function handleProductById(id: string): Promise<Response> {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1", [id, id]);
    const row = Array.isArray(rows) ? rows[0] : null;

    if (!row) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: jsonHeaders });
    }

    return new Response(JSON.stringify(castProduct(row as Record<string, unknown>)), { headers: jsonHeaders });
  } catch (error) {
    console.error("product detail endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to load product" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}

async function handleCategories(request: Request): Promise<Response> {
  try {
    if (request.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM categories ORDER BY name ASC");
      return new Response(JSON.stringify(rows), { headers: jsonHeaders });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (request.method === "POST") {
      const name = String(body.name ?? "").trim();
      const description = String(body.description ?? "").trim();
      const icon = String(body.icon ?? "").trim();
      const gradient = String(body.gradient ?? "").trim();

      if (!name || !description || !icon || !gradient) {
        return new Response(JSON.stringify({ error: "Missing category fields" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      await pool.query(
        "INSERT INTO categories (name, description, icon, gradient) VALUES (?, ?, ?, ?)",
        [name, description, icon, gradient],
      );

      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }

    if (request.method === "PUT") {
      const oldName = String(body.oldName ?? "").trim();
      const newName = String(body.newName ?? "").trim();
      const description = String(body.description ?? "").trim();
      const icon = String(body.icon ?? "").trim();
      const gradient = String(body.gradient ?? "").trim();

      if (!oldName || !newName || !description || !icon || !gradient) {
        return new Response(JSON.stringify({ error: "Missing category fields" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      await pool.query(
        "UPDATE categories SET name = ?, description = ?, icon = ?, gradient = ? WHERE name = ?",
        [newName, description, icon, gradient, oldName],
      );

      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }

    if (request.method === "DELETE") {
      const name = String(body.name ?? "").trim();

      if (!name) {
        return new Response(JSON.stringify({ error: "Missing category name" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      await pool.query("DELETE FROM categories WHERE name = ?", [name]);
      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("categories endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to update categories" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
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

async function handleProducts(url: URL): Promise<Response> {
  const p = url.searchParams;
  const id = p.get("id");
  const category = p.get("category");
  const platform = p.get("platform");
  const region = p.get("region");
  const duration = p.get("duration");
  const brand = p.get("brand");
  const inStock = p.get("inStock");
  const minPrice = Number(p.get("minPrice") ?? 0);
  const maxPrice = Number(p.get("maxPrice") ?? 9999);
  const sort = p.get("sort") ?? "popular";

  if (id) {
    return handleProductById(id);
  }

  try {
    const filters: string[] = [];
    const params: (string | number)[] = [];

    if (category && category !== "All") {
      filters.push("category = ?");
      params.push(category);
    }
    if (platform && platform !== "All") {
      filters.push("platform = ?");
      params.push(platform);
    }
    if (region && region !== "All") {
      filters.push("region = ?");
      params.push(region);
    }
    if (duration && duration !== "All") {
      filters.push("duration = ?");
      params.push(duration);
    }
    if (brand && brand !== "All") {
      filters.push("brand = ?");
      params.push(brand);
    }
    if (inStock === "true" || inStock === "1") {
      filters.push("stock > 0");
    }

    filters.push("price BETWEEN ? AND ?");
    params.push(minPrice, maxPrice);

    const whereClause = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
    const orderBy = getOrderBy(sort);

    const [rows] = await pool.query(`SELECT * FROM products${whereClause} ORDER BY ${orderBy}`, params);

    const list = Array.isArray(rows)
      ? (rows as Record<string, unknown>[]).map((row) => castProduct(row))
      : [];

    return new Response(JSON.stringify(list), { headers: jsonHeaders });
  } catch (error) {
    console.error("products endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to load products" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}

function getOrderBy(sort: string): string {
  switch (sort) {
    case "priceAsc":
      return "price ASC";
    case "priceDesc":
      return "price DESC";
    case "rating":
      return "rating DESC";
    case "newest":
      return "flashEndsAt DESC";
    default:
      return "sold DESC";
  }
}
