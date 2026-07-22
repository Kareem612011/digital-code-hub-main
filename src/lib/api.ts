import type { Product } from "@/lib/types";

type QueryValue = string | number | boolean | null | undefined;

const PRODUCT_STORAGE_KEY = "substore-product-overrides";

function buildQueryString(params?: Record<string, QueryValue>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function filterProducts(products: Product[], params?: Record<string, QueryValue>): Product[] {
  const category = String(params?.category ?? "");
  const platform = String(params?.platform ?? "");
  const region = String(params?.region ?? "");
  const duration = String(params?.duration ?? "");
  const brand = String(params?.brand ?? "");
  const inStock = String(params?.inStock ?? "");
  const minPrice = Number(params?.minPrice ?? 0);
  const maxPrice = Number(params?.maxPrice ?? 9999);
  const sort = String(params?.sort ?? "popular");
  const id = String(params?.id ?? "");

  if (id) {
    const match = products.find((product) => product.id === id || product.slug === id);
    return match ? [match] : [];
  }

  let list = products.filter((product) => {
    if (category && category !== "All" && product.category !== category) return false;
    if (platform && platform !== "All" && product.platform !== platform) return false;
    if (region && region !== "All" && product.region !== region) return false;
    if (duration && duration !== "All" && product.duration !== duration) return false;
    if (brand && brand !== "All" && product.brand !== brand) return false;
    if (inStock === "true" && product.stock <= 0) return false;
    if (product.price < minPrice || product.price > maxPrice) return false;
    return true;
  });

  list = [...list].sort((a, b) => {
    switch (sort) {
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return (b.flashEndsAt ?? 0) - (a.flashEndsAt ?? 0);
      default:
        return b.sold - a.sold;
    }
  });

  return list;
}

export function saveProductOverrides(products: Product[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

export async function apiFetch<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  // Only use localStorage overrides on the storefront (never on admin pages)
  if (
    typeof window !== "undefined" &&
    path === "/api/products" &&
    !window.location.pathname.startsWith("/admin")
  ) {
    const storedProducts = getStoredProducts();
    if (storedProducts.length > 0) {
      return filterProducts(storedProducts, params) as T;
    }
  }

  const url = `${path}${buildQueryString(params)}`;
  let response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status === 404 && !path.endsWith(".php")) {
    const fallbackUrl = `${path}.php${buildQueryString(params)}`;
    response = await fetch(fallbackUrl, {
      headers: {
        Accept: "application/json",
      },
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${text}`);
  }

  return (await response.json()) as T;
}
