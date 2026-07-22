import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { products, categories, reviews, type Product, type Category } from "../src/lib/data";

const dbPath = path.resolve(process.cwd(), "data.db");
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE categories (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    gradient TEXT NOT NULL
  );

  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    brandColor TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES categories(name),
    platform TEXT NOT NULL,
    region TEXT NOT NULL,
    duration TEXT NOT NULL,
    price REAL NOT NULL,
    originalPrice REAL NOT NULL,
    rating REAL NOT NULL,
    reviews INTEGER NOT NULL,
    sold INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    instant INTEGER NOT NULL,
    featured INTEGER NOT NULL,
    bestSeller INTEGER NOT NULL,
    newArrival INTEGER NOT NULL,
    flashDeal INTEGER NOT NULL,
    flashEndsAt INTEGER,
    description TEXT NOT NULL,
    includes TEXT NOT NULL,
    activation TEXT NOT NULL,
    faqs TEXT NOT NULL
  );

  CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL
  );

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'Starter',
    orders INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    password TEXT,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Delivered',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const idxUserEmail = db.prepare("CREATE INDEX IF NOT EXISTS idx_user_email ON orders(user_email)");
idxUserEmail.run();

const insertCategory = db.prepare(`
  INSERT INTO categories (name, description, icon, gradient)
  VALUES (?, ?, ?, ?)
`);
const insertProduct = db.prepare(`
  INSERT INTO products (
    id, slug, name, brand, brandColor, category, platform, region, duration,
    price, originalPrice, rating, reviews, sold, stock, instant,
    featured, bestSeller, newArrival, flashDeal, flashEndsAt,
    description, includes, activation, faqs
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertReview = db.prepare(`
  INSERT INTO reviews (name, country, rating, text)
  VALUES (?, ?, ?, ?)
`);
const insertUser = db.prepare(`
  INSERT INTO users (name, email, plan, orders, status, password, joined_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertOrder = db.prepare(`
  INSERT INTO orders (user_email, user_name, product_id, product_name, qty, price, code, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const category of categories) {
  insertCategory.run(category.name, category.desc, category.icon, category.gradient);
}

for (const product of products) {
  insertProduct.run(
    product.id,
    product.slug,
    product.name,
    product.brand,
    product.brandColor,
    product.category,
    product.platform,
    product.region,
    product.duration,
    product.price,
    product.originalPrice,
    product.rating,
    product.reviews,
    product.sold,
    product.stock,
    product.instant ? 1 : 0,
    product.featured ? 1 : 0,
    product.bestSeller ? 1 : 0,
    product.newArrival ? 1 : 0,
    product.flashDeal ? 1 : 0,
    product.flashEndsAt ?? null,
    product.description,
    JSON.stringify(product.includes),
    JSON.stringify(product.activation),
    JSON.stringify(product.faqs),
  );
}

for (const review of reviews) {
  insertReview.run(review.name, review.country, review.rating, review.text);
}

insertUser.run(
  "Ava Carter",
  "ava.carter@example.com",
  "Premium",
  13,
  "Active",
  null,
  "2025-01-08 00:00:00",
);
insertUser.run(
  "Liam Patel",
  "liam.patel@example.com",
  "Standard",
  5,
  "Active",
  null,
  "2025-02-12 00:00:00",
);
insertUser.run(
  "Sophia Nguyen",
  "sophia.nguyen@example.com",
  "Premium",
  27,
  "VIP",
  null,
  "2024-11-03 00:00:00",
);
insertUser.run(
  "Noah Williams",
  "noah.williams@example.com",
  "Starter",
  2,
  "Inactive",
  null,
  "2026-03-15 00:00:00",
);
insertUser.run(
  "Emma Johnson",
  "emma.johnson@example.com",
  "Premium",
  18,
  "Active",
  null,
  "2025-04-22 00:00:00",
);
insertUser.run("Jane Doe", "user@example.com", "Premium", 3, "Active", null, "2024-01-15 00:00:00");

insertOrder.run(
  "user@example.com",
  "Jane Doe",
  "netflix-premium-1m",
  "Netflix Premium — 1 Month",
  1,
  12.99,
  "NFLX-9K2M-XQ7T-PLM3",
  "Delivered",
  "2026-07-01 00:00:00",
);
insertOrder.run(
  "user@example.com",
  "Jane Doe",
  "spotify-premium",
  "Spotify Premium — 3 Months",
  1,
  19.99,
  "SPTY-4Z1A-HB88-TR6D",
  "Delivered",
  "2026-06-15 00:00:00",
);
insertOrder.run(
  "user@example.com",
  "Jane Doe",
  "xbox-gamepass-ultimate",
  "Xbox Game Pass Ultimate — 3 Months",
  1,
  38.99,
  "XGPU-77KL-99AV-QP11",
  "Delivered",
  "2026-05-20 00:00:00",
);

console.log(
  `Created ${dbPath} with ${products.length} products, ${categories.length} categories, ${reviews.length} reviews, and ${5 + 1} users.`,
);
