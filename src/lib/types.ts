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
  brandColor: string;
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
  flashEndsAt?: number | null;
  description: string;
  includes: string[];
  activation: string[];
  faqs: { q: string; a: string }[];
}

export interface CategoryRow {
  name: Category;
  description: string;
  icon: string;
  gradient: string;
}

export interface Review {
  id: number;
  name: string;
  country: string;
  rating: number;
  text: string;
}

export interface UserRow {
  id: string | number;
  name: string;
  email: string;
  plan: string;
  orders: number;
  status: string;
  joined: string;
}
