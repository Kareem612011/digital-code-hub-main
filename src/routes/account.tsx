import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { BrandTile } from "@/components/site/BrandTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  Download,
  Heart,
  MapPin,
  CreditCard,
  User,
  Settings,
  FileText,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Home,
  Building2,
  Globe2,
  Bell,
  Moon,
  Sun,
  DollarSign,
  Languages,
  Save,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "My Account — SubStore" }, { name: "robots", content: "noindex" }],
  }),
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
  {
    id: "ORD-10482",
    date: "Jul 09, 2026",
    status: "Delivered",
    pid: "netflix-premium-1m",
    code: "NFLX-9K2M-XQ7T-PLM3",
  },
  {
    id: "ORD-10441",
    date: "Jun 22, 2026",
    status: "Delivered",
    pid: "spotify-premium",
    code: "SPTY-4Z1A-HB88-TR6D",
  },
  {
    id: "ORD-10399",
    date: "Jun 03, 2026",
    status: "Delivered",
    pid: "xbox-gamepass-ultimate",
    code: "XGPU-77KL-99AV-QP11",
  },
];

const USER_AUTH_KEY = "substore-user-session";
const ADDRESSES_KEY = "substore-user-addresses";
const SETTINGS_KEY = "substore-user-settings";

interface UserSession {
  name: string;
  email: string;
  joined: string;
}

interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface UserSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  currency: string;
  language: string;
  theme: string;
  twoFactor: boolean;
}

const defaultSettings: UserSettings = {
  emailNotifications: true,
  orderUpdates: true,
  promotions: false,
  currency: "USD",
  language: "English",
  theme: "dark",
  twoFactor: false,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function Account() {
  const [userSession, setUserSession] = useState<UserSession | null>(() =>
    loadFromStorage<UserSession | null>(USER_AUTH_KEY, null),
  );

  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("orders");
  const { wishlist } = useCart();
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<Product[]>("/api/products"),
  });
  const wishItems = products.filter((p) => wishlist.includes(p.id));

  // ─── Addresses State ─────────────────────────────────────────────
  const [addresses, setAddresses] = useState<Address[]>(() =>
    loadFromStorage<Address[]>(ADDRESSES_KEY, []),
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id" | "isDefault">>({
    label: "Home",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  const [addrError, setAddrError] = useState("");
  const [addrSuccess, setAddrSuccess] = useState("");

  // ─── Settings State ──────────────────────────────────────────────
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadFromStorage<UserSettings>(SETTINGS_KEY, defaultSettings),
  );
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ─── Auth Handlers ───────────────────────────────────────────────
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === "user@example.com" && password === "user123") {
      const session: UserSession = { name: "Jane Doe", email: "user@example.com", joined: "2024" };
      saveToStorage(USER_AUTH_KEY, session);
      setUserSession(session);
    } else if (cleanEmail && password.length >= 6) {
      const session: UserSession = {
        name:
          cleanEmail
            .split("@")[0]
            .replace(/[^a-zA-Z]/g, " ")
            .trim() || "Customer",
        email: cleanEmail,
        joined: "2026",
      };
      saveToStorage(USER_AUTH_KEY, session);
      setUserSession(session);
    } else {
      setAuthError("Invalid email or password (min 6 characters)");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!name.trim()) {
      setAuthError("Please enter your full name");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }
    const session: UserSession = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      joined: "2026",
    };
    saveToStorage(USER_AUTH_KEY, session);
    setUserSession(session);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(USER_AUTH_KEY);
    setUserSession(null);
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setAuthError("");
  };

  const fillDemoCredentials = () => {
    setAuthMode("signin");
    setEmail("user@example.com");
    setPassword("user123");
    setAuthError("");
  };

  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (userName.slice(0, 2) || "US").toUpperCase();
  };

  // ─── Address Handlers ────────────────────────────────────────────
  const resetAddrForm = () => {
    setAddrForm({
      label: "Home",
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
    });
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddrError("");
  };

  const handleOpenEditAddress = (addr: Address) => {
    setAddrForm({
      label: addr.label,
      fullName: addr.fullName,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
    });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
    setAddrError("");
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError("");
    if (
      !addrForm.fullName.trim() ||
      !addrForm.line1.trim() ||
      !addrForm.city.trim() ||
      !addrForm.zip.trim()
    ) {
      setAddrError("Please fill in all required fields");
      return;
    }
    let updated: Address[];
    if (editingAddressId) {
      updated = addresses.map((a) => (a.id === editingAddressId ? { ...a, ...addrForm } : a));
      setAddrSuccess("Address updated successfully");
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        ...addrForm,
        isDefault: addresses.length === 0,
      };
      updated = [...addresses, newAddr];
      setAddrSuccess("Address added successfully");
    }
    saveToStorage(ADDRESSES_KEY, updated);
    setAddresses(updated);
    resetAddrForm();
    setTimeout(() => setAddrSuccess(""), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses
      .filter((a) => a.id !== id)
      .map((a, i) => (i === 0 ? { ...a, isDefault: true } : a));
    saveToStorage(ADDRESSES_KEY, updated);
    setAddresses(updated);
    setAddrSuccess("Address removed");
    setTimeout(() => setAddrSuccess(""), 3000);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveToStorage(ADDRESSES_KEY, updated);
    setAddresses(updated);
  };

  // ─── Settings Handlers ───────────────────────────────────────────
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSettingsSaved(false);
  };

  const handleSaveSettings = () => {
    saveToStorage(SETTINGS_KEY, settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // ─── Unauthenticated Portal ──────────────────────────────────────
  if (!userSession) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-2xl border border-white/10">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

          <div className="relative text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-lg shadow-brand/30">
              <User className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight">Customer Portal</h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Sign in to view orders, downloads, and wishlist
            </p>
          </div>

          <div className="mt-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setAuthError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${authMode === "signin" ? "gradient-brand text-white shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${authMode === "register" ? "gradient-brand text-white shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Create Account
            </button>
          </div>

          {authMode === "signin" && (
            <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/10 p-3.5 text-xs">
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
              <div className="mt-1.5 space-y-0.5 text-muted-foreground font-mono text-[11px]">
                <div>
                  Email: <span className="text-foreground">user@example.com</span>
                </div>
                <div>
                  Password: <span className="text-foreground">user123</span>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={authMode === "signin" ? handleSignIn : handleRegister}
            className="mt-5 space-y-4"
          >
            {authError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authMode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="user-name">Full Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {authMode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="user-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white shadow-lg cursor-pointer"
            >
              {authMode === "signin" ? "Sign In to Account" : "Create My Account"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-xl font-black text-white shadow-lg">
            {getInitials(userSession.name)}
          </div>
          <div>
            <h1 className="text-2xl font-black">Welcome back, {userSession.name}</h1>
            <p className="text-xs text-muted-foreground">
              {userSession.email} · Member since {userSession.joined}
            </p>
          </div>
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

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl glass p-3">
          {menu.map((m) => (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer ${tab === m.id ? "gradient-brand text-white shadow-lg" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
            >
              <m.i className="h-4 w-4" />
              {m.l}
            </button>
          ))}
        </aside>

        <div className="rounded-2xl glass p-6">
          {/* ─── Orders ─── */}
          {tab === "orders" && (
            <div>
              <h2 className="text-lg font-bold">Order history</h2>
              <div className="mt-4 space-y-3">
                {demoOrders.map((o) => {
                  const p = products.find((x) => x.id === o.pid)!;
                  return (
                    <div
                      key={o.id}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="h-16 w-16 shrink-0">
                        <BrandTile
                          brand={p.brand}
                          gradient={p.brandColor}
                          size="sm"
                          className="h-full w-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.id} · {o.date}
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        {o.status}
                      </span>
                      <div className="hidden rounded-lg bg-white/5 px-3 py-2 font-mono text-xs sm:block">
                        {o.code}
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 cursor-pointer">
                          <Download className="h-3.5 w-3.5" /> Code
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 cursor-pointer">
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Downloads ─── */}
          {tab === "downloads" && (
            <div>
              <h2 className="text-lg font-bold">Downloads</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every code you've purchased, available anytime.
              </p>
              <div className="mt-4 space-y-2">
                {demoOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold">
                        {products.find((p) => p.id === o.pid)?.name}
                      </div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{o.code}</div>
                    </div>
                    <button className="inline-flex items-center gap-1 rounded-lg gradient-brand px-3 py-2 text-xs font-semibold text-white cursor-pointer">
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Wishlist ─── */}
          {tab === "wishlist" && (
            <div>
              <h2 className="text-lg font-bold">Wishlist</h2>
              {wishItems.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Save products you love by tapping the heart icon.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {wishItems.map((p) => (
                    <Link
                      key={p.id}
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
                    >
                      <div className="h-14 w-14 shrink-0">
                        <BrandTile
                          brand={p.brand}
                          gradient={p.brandColor}
                          size="sm"
                          className="h-full w-full"
                        />
                      </div>
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

          {/* ─── Addresses ─── */}
          {tab === "addresses" && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Addresses</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Manage billing &amp; delivery addresses.
                  </p>
                </div>
                {!showAddressForm && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      resetAddrForm();
                      setShowAddressForm(true);
                    }}
                    className="rounded-xl gradient-brand text-white text-xs cursor-pointer"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Address
                  </Button>
                )}
              </div>

              {addrSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{addrSuccess}</span>
                </div>
              )}

              {showAddressForm && (
                <form
                  onSubmit={handleSaveAddress}
                  className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold">
                    {editingAddressId ? "Edit Address" : "New Address"}
                  </h3>

                  {addrError && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{addrError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>Address Label</Label>
                    <div className="flex gap-2">
                      {["Home", "Work", "Other"].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setAddrForm((f) => ({ ...f, label: l }))}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition ${addrForm.label === l ? "gradient-brand border-transparent text-white" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
                        >
                          {l === "Home" && <Home className="h-3 w-3" />}
                          {l === "Work" && <Building2 className="h-3 w-3" />}
                          {l === "Other" && <Globe2 className="h-3 w-3" />}
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addr-name">Full Name *</Label>
                    <Input
                      id="addr-name"
                      value={addrForm.fullName}
                      onChange={(e) => setAddrForm((f) => ({ ...f, fullName: e.target.value }))}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addr-line1">Address Line 1 *</Label>
                    <Input
                      id="addr-line1"
                      value={addrForm.line1}
                      onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="addr-line2">
                      Address Line 2 <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="addr-line2"
                      value={addrForm.line2}
                      onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="addr-city">City *</Label>
                      <Input
                        id="addr-city"
                        value={addrForm.city}
                        onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="addr-state">State / Region</Label>
                      <Input
                        id="addr-state"
                        value={addrForm.state}
                        onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="addr-zip">Postal Code *</Label>
                      <Input
                        id="addr-zip"
                        value={addrForm.zip}
                        onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value }))}
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="addr-country">Country</Label>
                      <Input
                        id="addr-country"
                        value={addrForm.country}
                        onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))}
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="submit"
                      className="rounded-xl gradient-brand text-white text-xs cursor-pointer"
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />{" "}
                      {editingAddressId ? "Update Address" : "Save Address"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetAddrForm}
                      className="rounded-xl border-white/10 text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-5 space-y-3">
                {addresses.length === 0 && !showAddressForm && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
                    No addresses yet. Add your first one above.
                  </div>
                )}
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl border p-4 transition ${addr.isDefault ? "border-brand/40 bg-brand/5" : "border-white/10 bg-white/5"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${addr.isDefault ? "bg-brand-accent/20 text-brand-accent" : "bg-white/10 text-muted-foreground"}`}
                        >
                          {addr.label === "Home" && <Home className="h-2.5 w-2.5" />}
                          {addr.label === "Work" && <Building2 className="h-2.5 w-2.5" />}
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-brand-accent font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-1.5 text-rose-400 hover:bg-rose-500/15 cursor-pointer transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-foreground font-medium">{addr.fullName}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                      <br />
                      {addr.city}
                      {addr.state && `, ${addr.state}`} {addr.zip}
                      <br />
                      {addr.country}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "payment" && (
            <Empty title="Payment methods" desc="Add or remove saved cards and wallets." />
          )}
          {tab === "profile" && (
            <Empty title="Profile" desc="Update your name, email and password." />
          )}

          {/* ─── Settings ─── */}
          {tab === "settings" && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Settings</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Manage your preferences and account options.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSaveSettings}
                  className={`rounded-xl text-xs cursor-pointer transition-all ${settingsSaved ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "gradient-brand text-white"}`}
                >
                  {settingsSaved ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" /> Save Settings
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 space-y-5">
                {/* Notifications */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-4 w-4 text-brand-accent" />
                    <h3 className="text-sm font-bold">Notifications</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications" as const,
                        label: "Email notifications",
                        desc: "Receive all account activity via email",
                      },
                      {
                        key: "orderUpdates" as const,
                        label: "Order updates",
                        desc: "Get notified when your order status changes",
                      },
                      {
                        key: "promotions" as const,
                        label: "Promotions & deals",
                        desc: "Flash sales and exclusive discounts",
                      },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSetting(key, !settings[key])}
                          className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${settings[key] ? "bg-brand-accent" : "bg-white/10"}`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings[key] ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe2 className="h-4 w-4 text-brand-accent" />
                    <h3 className="text-sm font-bold">Preferences</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="settings-currency" className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" /> Currency
                      </Label>
                      <select
                        id="settings-currency"
                        value={settings.currency}
                        onChange={(e) => updateSetting("currency", e.target.value)}
                        className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                      >
                        {["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "AED", "SAR"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="settings-language" className="flex items-center gap-1.5">
                        <Languages className="h-3.5 w-3.5" /> Language
                      </Label>
                      <select
                        id="settings-language"
                        value={settings.language}
                        onChange={(e) => updateSetting("language", e.target.value)}
                        className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                      >
                        {[
                          "English",
                          "Arabic",
                          "French",
                          "German",
                          "Spanish",
                          "Japanese",
                          "Chinese",
                        ].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5">
                        {settings.theme === "dark" ? (
                          <Moon className="h-3.5 w-3.5" />
                        ) : (
                          <Sun className="h-3.5 w-3.5" />
                        )}{" "}
                        Theme
                      </Label>
                      <div className="flex gap-2">
                        {[
                          { v: "dark", label: "Dark", icon: Moon },
                          { v: "light", label: "Light", icon: Sun },
                        ].map(({ v, label, icon: Icon }) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateSetting("theme", v)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition ${settings.theme === v ? "gradient-brand border-transparent text-white" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}
                          >
                            <Icon className="h-3 w-3" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-4 w-4 text-brand-accent" />
                    <h3 className="text-sm font-bold">Security</h3>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">Two-factor authentication</div>
                      <div className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting("twoFactor", !settings.twoFactor)}
                      className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${settings.twoFactor ? "bg-brand-accent" : "bg-white/10"}`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings.twoFactor ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-medium"
                    >
                      Delete account permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
