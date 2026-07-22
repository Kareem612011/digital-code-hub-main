import { Link } from "@tanstack/react-router";
import { Play, Gamepad2, Music, Clapperboard, Sparkles, Gift, type LucideIcon } from "lucide-react";
import type { CategoryRow } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  Play,
  Gamepad2,
  Music,
  Clapperboard,
  Sparkles,
  Gift,
};

export function CategoryGrid({ categories }: { categories: CategoryRow[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const Icon = iconMap[c.icon];
        return (
          <Link
            key={c.name}
            to="/shop"
            search={{ category: c.name } as never}
            className="group relative overflow-hidden rounded-3xl glass p-6 transition-all hover:-translate-y-1 hover:glow-brand"
          >
            <div
              className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${c.gradient} opacity-30 blur-2xl transition-opacity group-hover:opacity-60`}
            />
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.gradient} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="relative mt-6">
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
