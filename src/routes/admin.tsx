import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, saveProductOverrides } from "@/lib/api";
import type { Category, CategoryRow, Product, UserRow } from "@/lib/types";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Pencil,
  Trash2,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SubStore" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const tabs = ["Overview", "Products", "Categories", "Coupons", "Orders", "Users"];

const chart = [30, 45, 42, 60, 58, 72, 68, 84, 79, 92, 88, 100];

const ADMIN_AUTH_KEY = "substore-admin-session";

function Admin() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("Overview");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState<Category>("Streaming");
  const [newProductPrice, setNewProductPrice] = useState("19.99");
  const [newProductStock, setNewProductStock] = useState("10");
  const [newProductBrandColor, setNewProductBrandColor] = useState("#6d5dfc");
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryGradient, setNewCategoryGradient] = useState("from-sky-500 to-indigo-700");
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>("/api/products"),
  });

  const { data: categoriesRows = [] } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<CategoryRow[]>("/api/categories"),
  });

  const { data: users = [] } = useQuery<UserRow[]>({
    queryKey: ["users"],
    queryFn: () => apiFetch<UserRow[]>("/api/users"),
  });

  const visibleProducts = useMemo(() => {
    const merged = [...products];

    for (const localProduct of localProducts) {
      const existingIndex = merged.findIndex((product) => product.id === localProduct.id);

      if (existingIndex >= 0) {
        merged[existingIndex] = localProduct;
      } else {
        merged.unshift(localProduct);
      }
    }

    return merged;
  }, [localProducts, products]);

  const stats = [
    { l: "Revenue", v: "$482,930", d: "+12.4%", i: DollarSign },
    { l: "Orders", v: "8,241", d: "+4.7%", i: ShoppingBag },
    { l: "Customers", v: "24,113", d: "+9.1%", i: Users },
    { l: "Products", v: String(visibleProducts.length), d: "", i: Package },
  ];

  const resetProductForm = () => {
    setNewProductName("");
    setNewProductCategory("Streaming");
    setNewProductPrice("19.99");
    setNewProductStock("10");
    setNewProductBrandColor("#6d5dfc");
  };

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryIcon("");
    setNewCategoryGradient("from-sky-500 to-indigo-700");
    setEditingCategoryName(null);
  };

  const handleOpenEditCategory = (category: CategoryRow) => {
    setEditingCategoryName(category.name);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description);
    setNewCategoryIcon(category.icon);
    setNewCategoryGradient(category.gradient);
    setIsEditCategoryOpen(true);
  };

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newCategoryName.trim() || !newCategoryDescription.trim() || !newCategoryIcon.trim()) {
      return;
    }

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        icon: newCategoryIcon.trim(),
        gradient: newCategoryGradient,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "Unable to add category");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    resetCategoryForm();
    setIsAddCategoryOpen(false);
  };

  const handleEditCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !editingCategoryName ||
      !newCategoryName.trim() ||
      !newCategoryDescription.trim() ||
      !newCategoryIcon.trim()
    ) {
      return;
    }

    const response = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldName: editingCategoryName,
        newName: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        icon: newCategoryIcon.trim(),
        gradient: newCategoryGradient,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "Unable to update category");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    resetCategoryForm();
    setIsEditCategoryOpen(false);
  };

  const handleDeleteCategory = async (category: CategoryRow) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: category.name }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "Unable to delete category");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProductName(product.name);
    setNewProductCategory(product.category);
    setNewProductPrice(String(product.price));
    setNewProductStock(String(product.stock));
    setNewProductBrandColor(product.brandColor || "#6d5dfc");
    setIsEditProductOpen(true);
  };

  const handleEditProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = Number.parseFloat(newProductPrice);
    const parsedStock = Number.parseInt(newProductStock, 10);

    if (
      !editingProductId ||
      !newProductName.trim() ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedStock)
    ) {
      return;
    }

    const slug = newProductName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let existing: Product;
    try {
      existing = await apiFetch<Product>(`/api/products/${editingProductId}`);
    } catch {
      window.alert("Unable to load current product data");
      return;
    }

    const response = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingProductId,
        slug,
        name: newProductName.trim(),
        category: newProductCategory,
        price: parsedPrice,
        originalPrice: existing.originalPrice,
        stock: parsedStock,
        brand: existing.brand,
        brandColor: newProductBrandColor,
        platform: existing.platform,
        region: existing.region,
        duration: existing.duration,
        instant: existing.instant,
        description: existing.description,
        includes: existing.includes,
        activation: existing.activation,
        faqs: existing.faqs,
        rating: existing.rating,
        reviews: existing.reviews,
        sold: existing.sold,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "Unable to update product");
      return;
    }

    const updatedProduct = (await response.json().catch(() => null)) as Product | null;
    if (updatedProduct) {
      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
    }

    await queryClient.invalidateQueries({ queryKey: ["products"] });
    resetProductForm();
    setIsEditProductOpen(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "Unable to delete product");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = Number.parseFloat(newProductPrice);
    const parsedStock = Number.parseInt(newProductStock, 10);

    if (!newProductName.trim() || Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
      return;
    }

    const slug = newProductName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newProductName.trim(),
        slug,
        category: newProductCategory,
        price: parsedPrice,
        originalPrice: parsedPrice,
        stock: parsedStock,
        // optional fields with defaults (server will also default these)
        brand: "Custom",
        brandColor: newProductBrandColor,
        platform: "Web",
        region: "Global",
        duration: "Instant",
        instant: true,
        description: "New product added from the admin dashboard.",
        includes: ["Digital delivery"],
        activation: ["Instant access"],
        faqs: [],
        rating: 5,
        reviews: 0,
        sold: 0,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "Unable to add product");
      return;
    }

    // clear local overrides and refresh from MySQL
    setLocalProducts([]);
    saveProductOverrides([]);
    await queryClient.invalidateQueries({ queryKey: ["products"] });

    resetProductForm();
    setIsAddProductOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setAuthError(data?.error ?? "Invalid admin credentials");
        return;
      }

      window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError("Unable to reach authentication service");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setAuthError("");
  };

  const fillDemoCredentials = () => {
    setEmail("admin@substore.com");
    setPassword("admin123");
    setAuthError("");
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-2xl border border-white/10">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

          <div className="relative text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-lg shadow-brand/30">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight">Admin Portal</h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Sign in to manage catalog, orders, and users
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/10 p-4 text-xs">
            <div className="flex items-center justify-between font-semibold text-brand-accent">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4" /> Demo Credentials
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="underline hover:text-white transition-colors cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="mt-2 space-y-1 text-muted-foreground font-mono text-[11px]">
              <div>
                Email: <span className="text-foreground">admin@substore.com</span>
              </div>
              <div>
                Password: <span className="text-foreground">admin123</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {authError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Admin Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@substore.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white shadow-lg cursor-pointer"
            >
              Sign In to Dashboard
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand text-sm font-black text-white shadow-md">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">Admin Dashboard</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent border border-brand-accent/30">
                <ShieldCheck className="h-3 w-3" /> Super Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Logged in as admin@substore.com</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  tab === t
                    ? "gradient-brand text-white shadow-lg"
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-xl border-white/10 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 cursor-pointer"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </div>

      {tab === "Overview" && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="rounded-2xl glass p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
                    <s.i className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-black">{s.v}</div>
                {s.d && (
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {s.d}
                  </div>
                )}
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
                    <div className="text-[10px] text-muted-foreground">
                      {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                    </div>
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
                    <span className="shrink-0 font-semibold text-brand-accent">
                      ${((p.price * p.sold) / 1000).toFixed(0)}k
                    </span>
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
            <h2 className="text-lg font-bold">Products ({visibleProducts.length})</h2>
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-white">
                  + Add product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a product</DialogTitle>
                  <DialogDescription>
                    Create a new product record for the admin catalog.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddProduct}>
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product name</Label>
                    <Input
                      id="product-name"
                      value={newProductName}
                      onChange={(event) => setNewProductName(event.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="product-category">Category</Label>
                      <select
                        id="product-category"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={newProductCategory}
                        onChange={(event) => setNewProductCategory(event.target.value as Category)}
                      >
                        {[
                          "Streaming",
                          "Gaming",
                          "Music",
                          "Entertainment",
                          "Productivity",
                          "Gift Cards",
                        ].map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProductPrice}
                        onChange={(event) => setNewProductPrice(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="product-stock">Stock</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        min="0"
                        value={newProductStock}
                        onChange={(event) => setNewProductStock(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-color">Brand / Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="product-color-picker"
                          type="color"
                          value={newProductBrandColor}
                          onChange={(event) => setNewProductBrandColor(event.target.value)}
                          className="h-9 w-12 cursor-pointer p-1"
                        />
                        <Input
                          id="product-color"
                          type="text"
                          value={newProductBrandColor}
                          onChange={(event) => setNewProductBrandColor(event.target.value)}
                          placeholder="#6d5dfc"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddProductOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit product</DialogTitle>
                  <DialogDescription>Update the selected product details.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEditProduct}>
                  <div className="space-y-2">
                    <Label htmlFor="edit-product-name">Product name</Label>
                    <Input
                      id="edit-product-name"
                      value={newProductName}
                      onChange={(event) => setNewProductName(event.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-category">Category</Label>
                      <select
                        id="edit-product-category"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={newProductCategory}
                        onChange={(event) => setNewProductCategory(event.target.value as Category)}
                      >
                        {[
                          "Streaming",
                          "Gaming",
                          "Music",
                          "Entertainment",
                          "Productivity",
                          "Gift Cards",
                        ].map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-price">Price</Label>
                      <Input
                        id="edit-product-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProductPrice}
                        onChange={(event) => setNewProductPrice(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-stock">Stock</Label>
                      <Input
                        id="edit-product-stock"
                        type="number"
                        min="0"
                        value={newProductStock}
                        onChange={(event) => setNewProductStock(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-product-color">Brand / Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="edit-product-color-picker"
                          type="color"
                          value={newProductBrandColor}
                          onChange={(event) => setNewProductBrandColor(event.target.value)}
                          className="h-9 w-12 cursor-pointer p-1"
                        />
                        <Input
                          id="edit-product-color"
                          type="text"
                          value={newProductBrandColor}
                          onChange={(event) => setNewProductBrandColor(event.target.value)}
                          placeholder="#6d5dfc"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditProductOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-sm border border-white/20"
                          style={{ backgroundColor: p.brandColor || "#6d5dfc" }}
                        />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td className="text-muted-foreground">{p.sold.toLocaleString()}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditProduct(p)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(p)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Users" && (
        <div className="mt-8 rounded-2xl glass p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Users ({users.length})</h2>
            <button className="rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-white">
              + Add user
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">User</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={String(user.id)}>
                    <td className="py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">#{user.id}</div>
                    </td>
                    <td className="text-muted-foreground">{user.email}</td>
                    <td>{user.plan}</td>
                    <td>{user.orders}</td>
                    <td>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground">
                        {user.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{user.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Categories" && (
        <div className="mt-8 rounded-2xl glass p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Categories ({categoriesRows.length})</h2>
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-white">
                  + Add category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add category</DialogTitle>
                  <DialogDescription>Create a new category for the storefront.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddCategory}>
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category name</Label>
                    <Input
                      id="category-name"
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description</Label>
                    <Input
                      id="category-description"
                      value={newCategoryDescription}
                      onChange={(event) => setNewCategoryDescription(event.target.value)}
                      placeholder="Enter description"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category-icon">Icon</Label>
                      <Input
                        id="category-icon"
                        value={newCategoryIcon}
                        onChange={(event) => setNewCategoryIcon(event.target.value)}
                        placeholder="Icon name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-gradient">Gradient</Label>
                      <Input
                        id="category-gradient"
                        value={newCategoryGradient}
                        onChange={(event) => setNewCategoryGradient(event.target.value)}
                        placeholder="e.g. from-sky-500 to-indigo-700"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetCategoryForm();
                        setIsAddCategoryOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save category</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit category</DialogTitle>
                  <DialogDescription>Update the selected category details.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEditCategory}>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category-name">Category name</Label>
                    <Input
                      id="edit-category-name"
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category-description">Description</Label>
                    <Input
                      id="edit-category-description"
                      value={newCategoryDescription}
                      onChange={(event) => setNewCategoryDescription(event.target.value)}
                      placeholder="Enter description"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-icon">Icon</Label>
                      <Input
                        id="edit-category-icon"
                        value={newCategoryIcon}
                        onChange={(event) => setNewCategoryIcon(event.target.value)}
                        placeholder="Icon name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-gradient">Gradient</Label>
                      <Input
                        id="edit-category-gradient"
                        value={newCategoryGradient}
                        onChange={(event) => setNewCategoryGradient(event.target.value)}
                        placeholder="e.g. from-sky-500 to-indigo-700"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetCategoryForm();
                        setIsEditCategoryOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update category</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Description</th>
                  <th>Icon</th>
                  <th>Gradient</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categoriesRows.map((category) => (
                  <tr key={category.name}>
                    <td className="py-3 font-medium">{category.name}</td>
                    <td className="text-muted-foreground">{category.description}</td>
                    <td>{category.icon}</td>
                    <td className="text-muted-foreground">{category.gradient}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditCategory(category)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab !== "Overview" && tab !== "Products" && tab !== "Categories" && tab !== "Users" && (
        <div className="mt-8 rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
          {tab} management coming soon.
        </div>
      )}
    </div>
  );
}
