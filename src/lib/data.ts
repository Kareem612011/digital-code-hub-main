export type Category =
  | "Streaming"
  | "Gaming"
  | "Music"
  | "Entertainment"
  | "Productivity"
  | "Gift Cards";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandColor: string; // gradient css
  category: Category;
  platform: string;
  region: string;
  duration: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
  instant: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  flashDeal?: boolean;
  flashEndsAt?: number; // ms from now offset for demo
  description: string;
  includes: string[];
  activation: string[];
  faqs: { q: string; a: string }[];
}

const now = Date.now();
const H = 3600_000;

const base = (p: Partial<Product> & Pick<Product, "id" | "name" | "brand" | "brandColor" | "category" | "price" | "originalPrice">): Product => ({
  slug: p.id,
  platform: "Multi-platform",
  region: "Global",
  duration: "1 Month",
  rating: 4.7,
  reviews: 1240,
  sold: 12800,
  stock: 250,
  instant: true,
  description:
    "Activate instantly and enjoy premium access. Digital code delivered to your inbox within seconds of purchase. Backed by our 24/7 support and buyer protection.",
  includes: [
    "1 digital activation code",
    "Step-by-step redemption guide",
    "Instant email delivery",
    "24/7 customer support",
  ],
  activation: [
    "Open your provider account or create one",
    "Navigate to Redeem Code / Gift Card",
    "Enter the code we send to your inbox",
    "Enjoy your subscription immediately",
  ],
  faqs: [
    { q: "How fast is delivery?", a: "Codes are delivered automatically within 30 seconds after payment." },
    { q: "Is this region locked?", a: "Please check the region badge on the product. Most codes are global." },
    { q: "Can I get a refund?", a: "Unused codes are eligible for refund within 24 hours of purchase." },
  ],
  ...p,
});

export const products: Product[] = [
  base({
    id: "netflix-premium-1m",
    name: "Netflix Premium — 1 Month",
    brand: "Netflix",
    brandColor: "from-red-600 to-rose-900",
    category: "Streaming",
    price: 12.99,
    originalPrice: 22.99,
    rating: 4.9,
    reviews: 8420,
    sold: 92000,
    featured: true,
    bestSeller: true,
    flashDeal: true,
    flashEndsAt: now + 6 * H,
    duration: "1 Month",
  }),
  base({
    id: "netflix-premium-3m",
    name: "Netflix Premium — 3 Months",
    brand: "Netflix",
    brandColor: "from-red-600 to-rose-900",
    category: "Streaming",
    price: 34.99,
    originalPrice: 68.97,
    duration: "3 Months",
    bestSeller: true,
  }),
  base({
    id: "xbox-gamepass-ultimate",
    name: "Xbox Game Pass Ultimate — 3 Months",
    brand: "Xbox",
    brandColor: "from-emerald-500 to-green-800",
    category: "Gaming",
    price: 38.99,
    originalPrice: 54.99,
    duration: "3 Months",
    platform: "Xbox / PC",
    featured: true,
    bestSeller: true,
    rating: 4.8,
    reviews: 5230,
  }),
  base({
    id: "xbox-gamepass-core",
    name: "Xbox Game Pass Core — 3 Months",
    brand: "Xbox",
    brandColor: "from-emerald-500 to-green-800",
    category: "Gaming",
    price: 18.99,
    originalPrice: 24.99,
    duration: "3 Months",
    platform: "Xbox",
  }),
  base({
    id: "psn-plus-essential",
    name: "PlayStation Plus Essential — 3 Months",
    brand: "PlayStation",
    brandColor: "from-blue-600 to-indigo-900",
    category: "Gaming",
    price: 22.99,
    originalPrice: 29.99,
    duration: "3 Months",
    platform: "PS4 / PS5",
    featured: true,
  }),
  base({
    id: "psn-plus-extra",
    name: "PlayStation Plus Extra — 3 Months",
    brand: "PlayStation",
    brandColor: "from-blue-600 to-indigo-900",
    category: "Gaming",
    price: 36.99,
    originalPrice: 49.99,
    duration: "3 Months",
    platform: "PS4 / PS5",
    newArrival: true,
  }),
  base({
    id: "psn-plus-premium",
    name: "PlayStation Plus Premium — 3 Months",
    brand: "PlayStation",
    brandColor: "from-blue-600 to-indigo-900",
    category: "Gaming",
    price: 44.99,
    originalPrice: 59.99,
    duration: "3 Months",
    platform: "PS4 / PS5",
  }),
  base({
    id: "spotify-premium",
    name: "Spotify Premium — 3 Months",
    brand: "Spotify",
    brandColor: "from-green-500 to-emerald-800",
    category: "Music",
    price: 19.99,
    originalPrice: 32.97,
    duration: "3 Months",
    featured: true,
    flashDeal: true,
    flashEndsAt: now + 12 * H,
  }),
  base({
    id: "disney-plus",
    name: "Disney+ Premium — 1 Month",
    brand: "Disney+",
    brandColor: "from-sky-500 to-indigo-800",
    category: "Streaming",
    price: 8.99,
    originalPrice: 13.99,
    featured: true,
    newArrival: true,
  }),
  base({
    id: "crunchyroll-premium",
    name: "Crunchyroll Mega Fan — 1 Month",
    brand: "Crunchyroll",
    brandColor: "from-orange-500 to-amber-800",
    category: "Entertainment",
    price: 6.99,
    originalPrice: 11.99,
    newArrival: true,
  }),
  base({
    id: "youtube-premium",
    name: "YouTube Premium — 3 Months",
    brand: "YouTube",
    brandColor: "from-red-500 to-rose-900",
    category: "Music",
    price: 24.99,
    originalPrice: 41.97,
    duration: "3 Months",
    bestSeller: true,
  }),
  base({
    id: "hulu",
    name: "Hulu (No Ads) — 1 Month",
    brand: "Hulu",
    brandColor: "from-lime-400 to-green-700",
    category: "Streaming",
    price: 10.99,
    originalPrice: 17.99,
    region: "US",
  }),
  base({
    id: "max",
    name: "Max Ultimate — 1 Month",
    brand: "Max",
    brandColor: "from-violet-500 to-purple-900",
    category: "Streaming",
    price: 11.99,
    originalPrice: 20.99,
    newArrival: true,
  }),
  base({
    id: "paramount-plus",
    name: "Paramount+ with SHOWTIME — 1 Month",
    brand: "Paramount+",
    brandColor: "from-blue-500 to-indigo-800",
    category: "Streaming",
    price: 9.99,
    originalPrice: 14.99,
  }),
  base({
    id: "apple-tv",
    name: "Apple TV+ — 3 Months",
    brand: "Apple TV+",
    brandColor: "from-neutral-400 to-neutral-800",
    category: "Streaming",
    price: 17.99,
    originalPrice: 29.97,
    duration: "3 Months",
  }),
  base({
    id: "nintendo-switch-online",
    name: "Nintendo Switch Online — 12 Months",
    brand: "Nintendo",
    brandColor: "from-red-500 to-rose-900",
    category: "Gaming",
    price: 17.99,
    originalPrice: 19.99,
    duration: "12 Months",
    platform: "Switch",
  }),
  base({
    id: "apple-music",
    name: "Apple Music — 3 Months",
    brand: "Apple Music",
    brandColor: "from-pink-500 to-rose-800",
    category: "Music",
    price: 22.99,
    originalPrice: 32.97,
    duration: "3 Months",
  }),
  base({
    id: "deezer-premium",
    name: "Deezer Premium — 3 Months",
    brand: "Deezer",
    brandColor: "from-fuchsia-500 to-purple-800",
    category: "Music",
    price: 18.99,
    originalPrice: 32.97,
    duration: "3 Months",
    newArrival: true,
  }),
  base({
    id: "microsoft-365",
    name: "Microsoft 365 Family — 1 Year",
    brand: "Microsoft",
    brandColor: "from-blue-500 to-cyan-800",
    category: "Productivity",
    price: 69.99,
    originalPrice: 99.99,
    duration: "12 Months",
    featured: true,
  }),
  base({
    id: "adobe-cc",
    name: "Adobe Creative Cloud — 1 Month",
    brand: "Adobe",
    brandColor: "from-rose-600 to-red-900",
    category: "Productivity",
    price: 44.99,
    originalPrice: 59.99,
  }),
  base({
    id: "canva-pro",
    name: "Canva Pro — 12 Months",
    brand: "Canva",
    brandColor: "from-cyan-400 to-sky-700",
    category: "Productivity",
    price: 39.99,
    originalPrice: 119.99,
    duration: "12 Months",
    flashDeal: true,
    flashEndsAt: now + 3 * H,
    bestSeller: true,
  }),
  base({
    id: "grammarly-premium",
    name: "Grammarly Premium — 12 Months",
    brand: "Grammarly",
    brandColor: "from-emerald-400 to-green-800",
    category: "Productivity",
    price: 59.99,
    originalPrice: 144.0,
    duration: "12 Months",
  }),
];

export const categories: {
  name: Category;
  desc: string;
  icon: string;
  gradient: string;
}[] = [
  { name: "Streaming", desc: "Netflix, Disney+, Max & more", icon: "Play", gradient: "from-rose-500 to-pink-700" },
  { name: "Gaming", desc: "Xbox, PlayStation, Nintendo", icon: "Gamepad2", gradient: "from-emerald-500 to-teal-700" },
  { name: "Music", desc: "Spotify, Apple Music, Deezer", icon: "Music", gradient: "from-fuchsia-500 to-purple-700" },
  { name: "Entertainment", desc: "Crunchyroll, anime & more", icon: "Clapperboard", gradient: "from-amber-500 to-orange-700" },
  { name: "Productivity", desc: "Microsoft, Adobe, Canva", icon: "Sparkles", gradient: "from-sky-500 to-indigo-700" },
  { name: "Gift Cards", desc: "Steam, iTunes, Amazon", icon: "Gift", gradient: "from-violet-500 to-indigo-700" },
];

export const reviews = [
  { name: "Alex M.", country: "🇺🇸", rating: 5, text: "Code arrived in 20 seconds. Cheaper than the official site and worked flawlessly on my Xbox." },
  { name: "Sofia R.", country: "🇪🇸", rating: 5, text: "Bought a Netflix subscription for my parents. Instant, easy, no fuss. Will use again." },
  { name: "Kenji T.", country: "🇯🇵", rating: 4, text: "Great prices on Game Pass. Clean checkout, would love more payment options." },
  { name: "Linda P.", country: "🇩🇪", rating: 5, text: "Support answered in under two minutes. The activation guide was actually useful." },
];

export function findProduct(id: string) {
  return products.find((p) => p.id === id || p.slug === id);
}

export function relatedProducts(p: Product, n = 4) {
  return products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, n);
}
