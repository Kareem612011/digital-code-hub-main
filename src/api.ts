import { reviews } from "./lib/data";
import pool from "./lib/mysql";
// @ts-expect-error no types for bcrypt in this project
import bcrypt from "bcrypt";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/api/products") {
    if (request.method === "GET") {
      return handleProducts(url);
    }
    return handleProductMutations(request);
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
    if (request.method === "POST") {
      return handleCreateUser(request);
    }
    return handleUsers();
  }
  if (pathname === "/api/admin") {
    if (request.method === "POST") {
      return handleAdminAuth(request);
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }
  if (pathname === "/api/orders") {
    if (request.method === "POST") {
      return handleCreateOrder(request);
    }
    if (request.method === "GET") {
      return handleGetOrders(request);
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: jsonHeaders,
  });
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
    flashEndsAt:
      row.flashEndsAt === null || row.flashEndsAt === undefined ? null : Number(row.flashEndsAt),
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
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1", [
      id,
      id,
    ]);
    const row = Array.isArray(rows) ? rows[0] : null;

    if (!row) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify(castProduct(row as Record<string, unknown>)), {
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("product detail endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to load product" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}

async function handleProductMutations(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (request.method === "POST") {
      const name = String(body.name ?? "").trim();
      const slug = String(body.slug ?? "").trim();
      const category = String(body.category ?? "").trim();
      const price = Number(body.price);
      const originalPrice = Number(body.originalPrice);
      const stock = Number(body.stock);

      if (
        !name ||
        !slug ||
        !category ||
        Number.isNaN(price) ||
        Number.isNaN(originalPrice) ||
        Number.isNaN(stock)
      ) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      const [result] = await pool.query(
        `INSERT INTO products (slug, name, brand, brandColor, category, platform, region, duration, price, originalPrice, rating, reviews, sold, stock, instant, description, includes, activation, faqs) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug,
          name,
          String(body.brand ?? "Custom"),
          String(body.brandColor ?? "#6d5dfc"),
          category,
          String(body.platform ?? "Web"),
          String(body.region ?? "Global"),
          String(body.duration ?? "Instant"),
          price,
          originalPrice,
          Number(body.rating ?? 5),
          Number(body.reviews ?? 0),
          Number(body.sold ?? 0),
          stock,
          toBoolean(body.instant ?? true) ? 1 : 0,
          String(body.description ?? ""),
          JSON.stringify(Array.isArray(body.includes) ? body.includes : []),
          JSON.stringify(Array.isArray(body.activation) ? body.activation : []),
          JSON.stringify(Array.isArray(body.faqs) ? body.faqs : []),
        ],
      );

      const insertId = (result as { insertId: number }).insertId;
      const [rows] = await pool.query("SELECT * FROM products WHERE id = ? LIMIT 1", [insertId]);
      const row = Array.isArray(rows) ? rows[0] : null;

      if (!row) {
        return new Response(JSON.stringify({ error: "Failed to load created product" }), {
          status: 500,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify(castProduct(row as Record<string, unknown>)), {
        status: 201,
        headers: jsonHeaders,
      });
    }

    if (request.method === "PUT") {
      const id = String(body.id ?? "").trim();
      const slug = String(body.slug ?? "").trim();

      if (!id || !slug) {
        return new Response(JSON.stringify({ error: "Missing required fields: id and slug" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      const name = String(body.name ?? "").trim();
      const category = String(body.category ?? "").trim();
      const price = Number(body.price);
      const originalPrice = Number(body.originalPrice);
      const stock = Number(body.stock);

      if (
        !name ||
        !category ||
        Number.isNaN(price) ||
        Number.isNaN(originalPrice) ||
        Number.isNaN(stock)
      ) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      await pool.query(
        `UPDATE products SET slug = ?, name = ?, brand = ?, brandColor = ?, category = ?, platform = ?, region = ?, duration = ?, price = ?, originalPrice = ?, rating = ?, reviews = ?, sold = ?, stock = ?, instant = ?, description = ?, includes = ?, activation = ?, faqs = ? WHERE id = ?`,
        [
          slug,
          name,
          String(body.brand ?? "Custom"),
          String(body.brandColor ?? "#6d5dfc"),
          category,
          String(body.platform ?? "Web"),
          String(body.region ?? "Global"),
          String(body.duration ?? "Instant"),
          price,
          originalPrice,
          Number(body.rating ?? 5),
          Number(body.reviews ?? 0),
          Number(body.sold ?? 0),
          stock,
          toBoolean(body.instant ?? true) ? 1 : 0,
          String(body.description ?? ""),
          JSON.stringify(Array.isArray(body.includes) ? body.includes : []),
          JSON.stringify(Array.isArray(body.activation) ? body.activation : []),
          JSON.stringify(Array.isArray(body.faqs) ? body.faqs : []),
          id,
        ],
      );

      const [rows] = await pool.query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
      const row = Array.isArray(rows) ? rows[0] : null;

      if (!row) {
        return new Response(JSON.stringify({ error: "Product not found" }), {
          status: 404,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify(castProduct(row as Record<string, unknown>)), {
        headers: jsonHeaders,
      });
    }

    if (request.method === "DELETE") {
      const id = String(body.id ?? "").trim();

      if (!id) {
        return new Response(JSON.stringify({ error: "Missing required field: id" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
      const affectedRows = (result as { affectedRows: number }).affectedRows;

      if (affectedRows === 0) {
        return new Response(JSON.stringify({ error: "Product not found" }), {
          status: 404,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("product mutations endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to process product mutation" }), {
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

async function handleCreateUser(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const rawPassword = String(body.password ?? "");

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields: name and email" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const password = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;

    await pool.query(
      `INSERT INTO users (name, email, plan, orders, status, password) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password = COALESCE(VALUES(password), password)`,
      [name, email, "Starter", 0, "Active", password],
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, plan, orders, status, DATE_FORMAT(joined_at, '%Y-%m-%d') AS joined FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const row = Array.isArray(rows) ? rows[0] : null;

    if (!row) {
      return new Response(JSON.stringify({ error: "Failed to load user" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify(row), { headers: jsonHeaders });
  } catch (error) {
    console.error("create user endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to create user" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}

async function ensureAdminsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedDefaultAdmin(): Promise<void> {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM admins");
  const count = (rows as { count: number }[])[0]?.count ?? 0;
  if (count === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    await pool.query("INSERT INTO admins (email, password, name) VALUES (?, ?, ?)", [
      "admin@substore.com",
      hash,
      "Admin",
    ]);
  }
}

async function handleAdminAuth(request: Request): Promise<Response> {
  await ensureAdminsTable();
  await seedDefaultAdmin();

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "").trim();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password FROM admins WHERE email = ? LIMIT 1",
      [email],
    );
    const admin = (Array.isArray(rows) ? rows[0] : null) as Record<string, unknown> | null;

    if (!admin || !(await bcrypt.compare(password, String(admin.password)))) {
      return new Response(JSON.stringify({ error: "Invalid admin credentials" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const { password: _password, ...safeAdmin } = admin as Record<string, unknown>;
    return new Response(JSON.stringify({ ok: true, admin: safeAdmin }), { headers: jsonHeaders });
  } catch (error) {
    console.error("admin auth endpoint failed", error);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
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

    const [rows] = await pool.query(
      `SELECT * FROM products${whereClause} ORDER BY ${orderBy}`,
      params,
    );

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

function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function handleCreateOrder(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const userEmail = String(body.userEmail ?? "").trim();
    const userName = String(body.userName ?? "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!userEmail || !userName || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userEmail, userName, items" }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    const created: Record<string, unknown>[] = [];

    for (const item of items) {
      const productId = String(item.productId ?? "").trim();
      const productName = String(item.productName ?? "").trim();
      const qty = Number(item.qty ?? 1);
      const price = Number(item.price ?? 0);

      if (!productId || !productName || Number.isNaN(qty) || Number.isNaN(price)) {
        continue;
      }

      const code = generateOrderCode();

      const [result] = await pool.query(
        `INSERT INTO orders (user_email, user_name, product_id, product_name, qty, price, code, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userEmail, userName, productId, productName, qty, price, code, "Delivered"],
      );

      const insertId = (result as { insertId: number }).insertId;
      const [rows] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [insertId]);
      const row = (Array.isArray(rows) ? rows[0] : null) as Record<string, unknown> | null;

      if (row) {
        created.push({
          id: row.id,
          productId: row.product_id,
          productName: row.product_name,
          qty: Number(row.qty ?? 1),
          price: Number(row.price ?? 0),
          code: row.code,
          status: row.status,
          date: row.created_at,
        });
      }
    }

    return new Response(JSON.stringify(created), { status: 201, headers: jsonHeaders });
  } catch (error) {
    console.error("create order endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}

async function handleGetOrders(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const email = String(url.searchParams.get("email") ?? "").trim();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email query parameter" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const [rows] = await pool.query(
      `SELECT id, product_id, product_name, qty, price, code, status, DATE_FORMAT(created_at, "%Y-%m-%d") AS date
       FROM orders
       WHERE user_email = ?
       ORDER BY id DESC`,
      [email],
    );

    const orders = Array.isArray(rows)
      ? (rows as Record<string, unknown>[]).map((row) => ({
          id: row.id,
          productId: row.product_id,
          productName: row.product_name,
          qty: Number(row.qty ?? 1),
          price: Number(row.price ?? 0),
          code: row.code,
          status: row.status,
          date: row.date,
        }))
      : [];

    return new Response(JSON.stringify(orders), { headers: jsonHeaders });
  } catch (error) {
    console.error("get orders endpoint failed", error);
    return new Response(JSON.stringify({ error: "Failed to load orders" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
