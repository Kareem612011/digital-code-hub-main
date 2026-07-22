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
} from "lucide-react";

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

const USER_AUTH_KEY = "substore-user-session";

interface UserSession {
  name: string;
  email: string;
  joined: string;
}

function Account() {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(USER_AUTH_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserSession;
    } catch {
      return null;
    }
  });

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === "user@example.com" && password === "user123") {
      const session: UserSession = {
        name: "Jane Doe",
        email: "user@example.com",
        joined: "2024",
      };
      window.localStorage.setItem(USER_AUTH_KEY, JSON.stringify(session));
      setUserSession(session);
    } else if (cleanEmail && password.length >= 6) {
      const session: UserSession = {
        name: cleanEmail.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim() || "Customer",
        email: cleanEmail,
        joined: "2026",
      };
      window.localStorage.setItem(USER_AUTH_KEY, JSON.stringify(session));
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
      setAuthError("Password must be at least 6 characters long");
      return;
    }

    const session: UserSession = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      joined: "2026",
    };
    window.localStorage.setItem(USER_AUTH_KEY, JSON.stringify(session));
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
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (userName.slice(0, 2) || "US").toUpperCase();
  };

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
            <p className="mt-1.5 text-xs text-muted-foreground">Sign in to view orders, downloads, and wishlist</p>
          </div>

          <div className="mt-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => { setAuthMode("signin"); setAuthError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                authMode === "signin" ? "gradient-brand text-white shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                authMode === "register" ? "gradient-brand text-white shadow" : "text-muted-foreground hover:text-foreground"
              }`}
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
                <div>Email: <span className="text-foreground">user@example.com</span></div>
                <div>Password: <span className="text-foreground">user123</span></div>
              </div>
            </div>
          )}

          <form onSubmit={authMode === "signin" ? handleSignIn : handleRegister} className="mt-5 space-y-4">
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
                  onClick={() => setShowPassword((prev) => !prev)}
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

            <Button type="submit" className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white shadow-lg cursor-pointer">
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
            <p className="text-xs text-muted-foreground">{userSession.email} · Member since {userSession.joined}</p>
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
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
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
                    <button className="inline-flex items-center gap-1 rounded-lg gradient-brand px-3 py-2 text-xs font-semibold text-white cursor-pointer">
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
